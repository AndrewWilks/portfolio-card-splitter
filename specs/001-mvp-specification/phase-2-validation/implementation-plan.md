# Phase 2: Validation & Business Logic - Implementation Plan

**Date**: November 8, 2025  
**Status**: 🟡 Ready to Start  
**Estimated Time**: 19-25 hours  
**Depends On**: Phase 0 (Authentication), Phase 1 (Events)

---

## Overview

This plan implements validation and business logic across 5 services to fix 34 failing tests and ensure data integrity:

1. **TransactionService** (3-4 hrs) - Allocation validation, member checks, tag saving
2. **PaymentService** (3-4 hrs) - Amount validation, reconciliation logic
3. **ReservationService** (5-6 hrs) - Complex validation with linkage and balance checks
4. **PotService** (4-5 hrs) - ACL enforcement for SOLO/SHARED pots
5. **LedgerService** (3-4 hrs) - Balance and settlement calculations

---

## Task 2.1: TransactionService Validation

**Estimated Time**: 3-4 hours  
**Status**: ⏳ Not Started  
**Current Failing Tests**: 6

### Goal

Implement comprehensive allocation validation, member existence checks, and tag persistence.

### Context

TransactionService allows invalid data:

- Allocations can sum to !=100% (percentage mode)
- Allocations can sum to !=transaction amount (fixed mode)
- Can mix percentage and fixed allocations
- Member IDs not validated
- Tags created but not saved
- Date serialization issues

### Files to Modify

- `backend/services/transactionService.ts`

### Implementation

#### Allocation Validation

Add validation method:

```typescript
/**
 * Validate allocations for a transaction
 * Rules:
 * - All must be percentage OR all must be fixed (no mixing)
 * - Percentage allocations must sum to 100%
 * - Fixed allocations must sum to transaction amount
 * - Each allocation must have valid member
 */
private async validateAllocations(
  allocations: AllocationData[],
  transactionAmountCents: number,
  actorId: string
): Promise<void> {
  if (allocations.length === 0) {
    throw new Error("At least one allocation required");
  }

  // Check XOR: each allocation has percentage OR amountCents
  for (const allocation of allocations) {
    const hasPercentage = allocation.percentage !== undefined;
    const hasAmount = allocation.amountCents !== undefined;

    if (hasPercentage && hasAmount) {
      throw new Error("Allocation must have either percentage or amountCents, not both");
    }
    if (!hasPercentage && !hasAmount) {
      throw new Error("Allocation must have either percentage or amountCents");
    }
  }

  // Determine type: all percentage or all fixed
  const hasPercentage = allocations.some(a => a.percentage !== undefined);
  const hasFixed = allocations.some(a => a.amountCents !== undefined);

  if (hasPercentage && hasFixed) {
    throw new Error("Cannot mix percentage and fixed allocations");
  }

  // Validate sums
  if (hasPercentage) {
    const sum = allocations.reduce((total, a) => total + (a.percentage || 0), 0);
    if (Math.abs(sum - 100) > 0.01) {
      throw new Error(`Percentage allocations must sum to exactly 100% (got ${sum}%)`);
    }
  } else {
    const sum = allocations.reduce((total, a) => total + (a.amountCents || 0), 0);
    if (sum !== transactionAmountCents) {
      throw new Error(
        `Fixed allocations must sum to transaction amount $${transactionAmountCents / 100} (got $${sum / 100})`
      );
    }
  }

  // Validate all members exist and are accessible
  for (const allocation of allocations) {
    const member = await this.memberRepo.findById(allocation.memberId);
    if (!member) {
      throw new Error(`Member ${allocation.memberId} does not exist`);
    }

    // Check member accessibility (via pot membership)
    // For now, basic existence check. ACL can be enhanced later.
  }
}
```

#### Update createTransaction

```typescript
async createTransaction(
  data: CreateTransactionData,
  actorId: string
): Promise<Transaction> {
  // Validate allocations first
  await this.validateAllocations(data.allocations, data.amountCents, actorId);

  // Create transaction
  const transaction = new Transaction({
    id: crypto.randomUUID(),
    cardAccountId: data.cardAccountId,
    cardId: data.cardId,
    merchantId: data.merchantId,
    description: data.description,
    amountCents: data.amountCents,
    type: data.type,
    transactionDate: data.transactionDate,
    createdById: actorId,
    createdAt: new Date(),
  });

  const savedTransaction = await this.transactionRepo.save(transaction);

  // Create allocations
  for (const allocationData of data.allocations) {
    const allocation = new Allocation({
      id: crypto.randomUUID(),
      transactionId: savedTransaction.id,
      memberId: allocationData.memberId,
      percentage: allocationData.percentage,
      amountCents: allocationData.amountCents,
      createdAt: new Date(),
    });
    await this.allocationRepo.save(allocation);
  }

  // Save tags
  if (data.tags && data.tags.length > 0) {
    for (const tagName of data.tags) {
      // Check if tag exists
      let tag = await this.tagRepo.findByName(tagName);

      if (!tag) {
        // Create new tag
        tag = new Tag({
          id: crypto.randomUUID(),
          name: tagName,
          createdAt: new Date(),
        });
        await this.tagRepo.save(tag);
      }

      // Link tag to transaction (assuming junction table exists)
      await this.transactionRepo.addTag(savedTransaction.id, tag.id);
    }
  }

  // Emit event
  await this.eventRepo.save(
    new Event({
      id: crypto.randomUUID(),
      entityType: "transaction",
      entityId: savedTransaction.id,
      eventType: "created",
      actorId,
      metadata: {
        amountCents: savedTransaction.amountCents,
        merchant: data.merchantId,
        type: savedTransaction.type,
      },
      createdAt: new Date(),
    })
  );

  return savedTransaction;
}
```

#### Fix Date Serialization

```typescript
// In transaction entity or serialization layer
toJSON(): object {
  return {
    ...this,
    transactionDate: this.transactionDate.toISOString(),
    createdAt: this.createdAt.toISOString(),
  };
}
```

### Testing

Update existing tests to verify validation:

```typescript
describe("TransactionService.createTransaction", () => {
  it("should reject percentage allocations that don't sum to 100%", async () => {
    const data = {
      allocations: [
        { memberId: member1.id, percentage: 40 },
        { memberId: member2.id, percentage: 50 }, // Sums to 90%
      ],
      amountCents: 10000,
      // ... other fields
    };

    await expect(
      transactionService.createTransaction(data, actorId)
    ).rejects.toThrow("must sum to exactly 100%");
  });

  it("should accept valid percentage allocations", async () => {
    const data = {
      allocations: [
        { memberId: member1.id, percentage: 60 },
        { memberId: member2.id, percentage: 40 },
      ],
      amountCents: 10000,
      // ... other fields
    };

    const transaction = await transactionService.createTransaction(
      data,
      actorId
    );
    expect(transaction).toBeTruthy();
  });

  it("should reject fixed allocations that don't sum to amount", async () => {
    const data = {
      allocations: [
        { memberId: member1.id, amountCents: 4000 },
        { memberId: member2.id, amountCents: 5000 }, // Sums to 9000, not 10000
      ],
      amountCents: 10000,
      // ... other fields
    };

    await expect(
      transactionService.createTransaction(data, actorId)
    ).rejects.toThrow("must sum to transaction amount");
  });

  it("should reject mixed allocation types", async () => {
    const data = {
      allocations: [
        { memberId: member1.id, percentage: 50 },
        { memberId: member2.id, amountCents: 5000 },
      ],
      amountCents: 10000,
      // ... other fields
    };

    await expect(
      transactionService.createTransaction(data, actorId)
    ).rejects.toThrow("Cannot mix percentage and fixed allocations");
  });

  it("should reject allocation with non-existent member", async () => {
    const data = {
      allocations: [{ memberId: "non-existent-id", percentage: 100 }],
      amountCents: 10000,
      // ... other fields
    };

    await expect(
      transactionService.createTransaction(data, actorId)
    ).rejects.toThrow("Member non-existent-id does not exist");
  });

  it("should save tags and link to transaction", async () => {
    const data = {
      allocations: [{ memberId: member1.id, percentage: 100 }],
      amountCents: 10000,
      tags: ["groceries", "essential"],
      // ... other fields
    };

    const transaction = await transactionService.createTransaction(
      data,
      actorId
    );

    const tags = await transactionRepo.getTags(transaction.id);
    expect(tags).toHaveLength(2);
    expect(tags.map((t) => t.name)).toContain("groceries");
    expect(tags.map((t) => t.name)).toContain("essential");
  });
});
```

### Validation

- [ ] All 6 TransactionService tests passing
- [ ] Percentage allocations validated (sum to 100%)
- [ ] Fixed allocations validated (sum to amount)
- [ ] Mixed allocations rejected
- [ ] Member existence checked
- [ ] Tags saved correctly
- [ ] XOR validation (percentage OR amountCents)

### Commit Message

```
feat(validation): implement TransactionService allocation validation

- Add validateAllocations() with percentage/fixed sum checks
- Validate member existence for all allocations
- Reject mixed allocation types (percentage and fixed)
- Implement XOR validation (percentage OR amountCents)
- Fix tag persistence (save and link to transaction)
- Fix date serialization to ISO format
- Add 6 comprehensive validation tests

Fixes 6 failing tests in TransactionService
Related to Phase 2: Validation
```

---

## Task 2.2: PaymentService Validation

**Estimated Time**: 3-4 hours  
**Status**: ⏳ Not Started  
**Current Failing Tests**: 6

### Goal

Implement payment amount validation and automatic reconciliation flag logic.

### Context

PaymentService doesn't validate:

- Payment can exceed transaction amount
- Multiple payments can exceed transaction total
- Reconciliation flag not calculated

### Files to Modify

- `backend/services/paymentService.ts`

### Implementation

#### Payment Validation

```typescript
/**
 * Validate payment amount against transaction
 */
private async validatePaymentAmount(
  transactionId: string,
  paymentAmountCents: number
): Promise<void> {
  // Get transaction
  const transaction = await this.transactionRepo.findById(transactionId);
  if (!transaction) {
    throw new Error(`Transaction ${transactionId} not found`);
  }

  // Check payment doesn't exceed transaction
  if (paymentAmountCents > transaction.amountCents) {
    throw new Error(
      `Payment amount $${paymentAmountCents / 100} exceeds transaction amount $${transaction.amountCents / 100}`
    );
  }

  // Get existing payments for this transaction
  const existingPayments = await this.paymentRepo.findByTransactionId(transactionId);
  const existingTotal = existingPayments.reduce(
    (sum, p) => sum + p.amountCents,
    0
  );

  // Check total wouldn't exceed transaction
  const newTotal = existingTotal + paymentAmountCents;
  if (newTotal > transaction.amountCents) {
    throw new Error(
      `Total payments $${newTotal / 100} would exceed transaction amount $${transaction.amountCents / 100}`
    );
  }
}

/**
 * Calculate and update reconciliation status for all payments of a transaction
 */
private async updateReconciliationStatus(transactionId: string): Promise<void> {
  const transaction = await this.transactionRepo.findById(transactionId);
  if (!transaction) return;

  const payments = await this.paymentRepo.findByTransactionId(transactionId);
  const totalPaid = payments.reduce((sum, p) => sum + p.amountCents, 0);

  // Reconciled if total paid >= transaction amount
  const isReconciled = totalPaid >= transaction.amountCents;

  // Update all payments
  for (const payment of payments) {
    if (payment.reconciled !== isReconciled) {
      payment.reconciled = isReconciled;
      await this.paymentRepo.save(payment);
    }
  }
}
```

#### Update createPayment

```typescript
async createPayment(
  data: CreatePaymentData,
  actorId: string
): Promise<Payment> {
  // Validate amount
  await this.validatePaymentAmount(data.transactionId, data.amountCents);

  // Create payment (initially not reconciled)
  const payment = new Payment({
    id: crypto.randomUUID(),
    transactionId: data.transactionId,
    potId: data.potId,
    amountCents: data.amountCents,
    paidOn: data.paidOn || new Date(),
    note: data.note,
    reconciled: false, // Always start false
    createdAt: new Date(),
  });

  const savedPayment = await this.paymentRepo.save(payment);

  // Update reconciliation status for all payments of this transaction
  await this.updateReconciliationStatus(data.transactionId);

  // Reload payment to get updated reconciliation status
  const reloadedPayment = await this.paymentRepo.findById(savedPayment.id);

  // Emit event
  await this.eventRepo.save(
    new Event({
      id: crypto.randomUUID(),
      entityType: "payment",
      entityId: savedPayment.id,
      eventType: "created",
      actorId,
      metadata: {
        amountCents: savedPayment.amountCents,
        potId: savedPayment.potId,
        transactionId: savedPayment.transactionId,
        reconciled: reloadedPayment?.reconciled || false,
      },
      createdAt: new Date(),
    })
  );

  return reloadedPayment || savedPayment;
}
```

### Testing

```typescript
describe("PaymentService", () => {
  let transaction: Transaction;

  beforeEach(async () => {
    // Create test transaction of $100
    transaction = await transactionRepo.save(
      new Transaction({
        id: crypto.randomUUID(),
        amountCents: 10000, // $100
        // ... other fields
      })
    );
  });

  it("should reject payment exceeding transaction amount", async () => {
    const data = {
      transactionId: transaction.id,
      potId: pot.id,
      amountCents: 15000, // $150 > $100
    };

    await expect(paymentService.createPayment(data, actorId)).rejects.toThrow(
      "exceeds transaction amount"
    );
  });

  it("should reject payment when total would exceed transaction", async () => {
    // Create first payment of $80
    await paymentService.createPayment(
      {
        transactionId: transaction.id,
        potId: pot.id,
        amountCents: 8000,
      },
      actorId
    );

    // Try to add $50 (total would be $130 > $100)
    const data = {
      transactionId: transaction.id,
      potId: pot.id,
      amountCents: 5000,
    };

    await expect(paymentService.createPayment(data, actorId)).rejects.toThrow(
      "would exceed transaction amount"
    );
  });

  it("should set reconciled=false when payment < transaction", async () => {
    const payment = await paymentService.createPayment(
      {
        transactionId: transaction.id,
        potId: pot.id,
        amountCents: 5000, // $50 < $100
      },
      actorId
    );

    expect(payment.reconciled).toBe(false);
  });

  it("should set reconciled=true when payment = transaction", async () => {
    const payment = await paymentService.createPayment(
      {
        transactionId: transaction.id,
        potId: pot.id,
        amountCents: 10000, // $100 = $100
      },
      actorId
    );

    expect(payment.reconciled).toBe(true);
  });

  it("should update all payments when reconciliation status changes", async () => {
    // Create first payment
    const payment1 = await paymentService.createPayment(
      {
        transactionId: transaction.id,
        potId: pot.id,
        amountCents: 6000, // $60
      },
      actorId
    );

    expect(payment1.reconciled).toBe(false);

    // Create second payment (total = $100)
    const payment2 = await paymentService.createPayment(
      {
        transactionId: transaction.id,
        potId: pot.id,
        amountCents: 4000, // $40
      },
      actorId
    );

    // Both should now be reconciled
    const reloaded1 = await paymentRepo.findById(payment1.id);
    const reloaded2 = await paymentRepo.findById(payment2.id);

    expect(reloaded1?.reconciled).toBe(true);
    expect(reloaded2?.reconciled).toBe(true);
  });
});
```

### Validation

- [ ] All 6 PaymentService tests passing
- [ ] Payment amount validated against transaction
- [ ] Total payments validated
- [ ] Reconciliation calculated correctly
- [ ] All payments updated when status changes

### Commit Message

```
feat(validation): implement PaymentService amount validation and reconciliation

- Add validatePaymentAmount() to check against transaction
- Validate total payments don't exceed transaction
- Implement automatic reconciliation flag calculation
- Update all payments when reconciliation status changes
- Reconciled = true when total payments >= transaction amount
- Add 6 validation tests

Fixes 6 failing tests in PaymentService
Related to Phase 2: Validation
```

---

## Task 2.3: ReservationService Validation

**Estimated Time**: 5-6 hours  
**Status**: ⏳ Not Started  
**Current Failing Tests**: 9

### Goal

Implement comprehensive reservation validation including linkage checks, amount limits, and pot balance verification.

### Context

ReservationService has most complex validation:

- Member/allocation existence not checked
- Linkage between reservation→allocation→transaction not validated
- Amount can exceed allocation
- Pot balance not checked
- Most failing tests (9)

### Files to Modify

- `backend/services/reservationService.ts`

### Implementation

#### Comprehensive Validation

```typescript
/**
 * Validate reservation against allocation, transaction, and pot balance
 */
private async validateReservation(
  data: CreateReservationData
): Promise<{ allocation: Allocation; transaction: Transaction; pot: Pot }> {
  // 1. Validate member exists
  const member = await this.memberRepo.findById(data.memberId);
  if (!member) {
    throw new Error(`Member ${data.memberId} does not exist`);
  }

  // 2. Validate allocation exists
  const allocation = await this.allocationRepo.findById(data.allocationId);
  if (!allocation) {
    throw new Error(`Allocation ${data.allocationId} does not exist`);
  }

  // 3. Validate transaction exists (via allocation)
  const transaction = await this.transactionRepo.findById(allocation.transactionId);
  if (!transaction) {
    throw new Error(`Transaction ${allocation.transactionId} not found`);
  }

  // 4. Validate member matches allocation
  if (data.memberId !== allocation.memberId) {
    throw new Error(
      `Reservation member ${data.memberId} does not match allocation member ${allocation.memberId}`
    );
  }

  // 5. Calculate allocation amount
  const allocationAmount = allocation.amountCents ||
    Math.round((transaction.amountCents * (allocation.percentage || 0)) / 100);

  // 6. Validate reservation amount <= allocation amount
  if (data.amountCents > allocationAmount) {
    throw new Error(
      `Reservation amount $${data.amountCents / 100} exceeds allocation amount $${allocationAmount / 100}`
    );
  }

  // 7. Validate total reservations for allocation don't exceed allocation
  const existingReservations = await this.reservationRepo.findByAllocationId(
    data.allocationId
  );
  const existingTotal = existingReservations.reduce(
    (sum, r) => sum + r.amountCents,
    0
  );
  const newTotal = existingTotal + data.amountCents;

  if (newTotal > allocationAmount) {
    throw new Error(
      `Total reservations $${newTotal / 100} would exceed allocation amount $${allocationAmount / 100}`
    );
  }

  // 8. Validate total reservations for transaction don't exceed transaction
  const allAllocations = await this.allocationRepo.findByTransactionId(
    allocation.transactionId
  );
  let totalReservations = data.amountCents;

  for (const alloc of allAllocations) {
    const reservations = await this.reservationRepo.findByAllocationId(alloc.id);
    totalReservations += reservations.reduce((sum, r) => sum + r.amountCents, 0);
  }

  if (totalReservations > transaction.amountCents) {
    throw new Error(
      `Total reservations $${totalReservations / 100} would exceed transaction amount $${transaction.amountCents / 100}`
    );
  }

  // 9. Validate pot exists and has balance
  const pot = await this.potRepo.findById(data.potId);
  if (!pot) {
    throw new Error(`Pot ${data.potId} not found`);
  }

  // 10. Calculate available pot balance
  const potReservations = await this.reservationRepo.findByPotId(data.potId);
  const reservedAmount = potReservations.reduce(
    (sum, r) => sum + r.amountCents,
    0
  );
  const availableBalance = pot.balanceCents - reservedAmount;

  if (data.amountCents > availableBalance) {
    throw new Error(
      `Pot ${data.potId} has insufficient balance. Available: $${availableBalance / 100}, Required: $${data.amountCents / 100}`
    );
  }

  return { allocation, transaction, pot };
}
```

#### Update createReservation

```typescript
async createReservation(
  data: CreateReservationData,
  actorId: string
): Promise<Reservation> {
  // Validate everything
  const { allocation, transaction, pot } = await this.validateReservation(data);

  // Create reservation
  const reservation = new Reservation({
    id: crypto.randomUUID(),
    allocationId: data.allocationId,
    memberId: data.memberId,
    potId: data.potId,
    amountCents: data.amountCents,
    createdAt: new Date(),
  });

  const saved = await this.reservationRepo.save(reservation);

  // Emit event
  await this.eventRepo.save(
    new Event({
      id: crypto.randomUUID(),
      entityType: "reservation",
      entityId: saved.id,
      eventType: "created",
      actorId,
      metadata: {
        amountCents: saved.amountCents,
        potId: saved.potId,
        allocationId: saved.allocationId,
      },
      createdAt: new Date(),
    })
  );

  return saved;
}
```

### Testing

```typescript
describe("ReservationService", () => {
  let member: Member;
  let transaction: Transaction;
  let allocation: Allocation;
  let pot: Pot;

  beforeEach(async () => {
    // Setup: member, transaction of $100, allocation of 60% ($60), pot with $100 balance
    member = await memberRepo.save(/* ... */);
    transaction = await transactionRepo.save({
      amountCents: 10000, // $100
      // ...
    });
    allocation = await allocationRepo.save({
      transactionId: transaction.id,
      memberId: member.id,
      percentage: 60, // $60
      // ...
    });
    pot = await potRepo.save({
      balanceCents: 10000, // $100
      // ...
    });
  });

  it("should reject reservation with non-existent member", async () => {
    await expect(
      reservationService.createReservation(
        {
          memberId: "non-existent",
          allocationId: allocation.id,
          potId: pot.id,
          amountCents: 1000,
        },
        actorId
      )
    ).rejects.toThrow("Member non-existent does not exist");
  });

  it("should reject reservation with non-existent allocation", async () => {
    await expect(
      reservationService.createReservation(
        {
          memberId: member.id,
          allocationId: "non-existent",
          potId: pot.id,
          amountCents: 1000,
        },
        actorId
      )
    ).rejects.toThrow("Allocation non-existent does not exist");
  });

  it("should reject reservation with mismatched member", async () => {
    const otherMember = await memberRepo.save(/* different member */);

    await expect(
      reservationService.createReservation(
        {
          memberId: otherMember.id, // Different from allocation.memberId
          allocationId: allocation.id,
          potId: pot.id,
          amountCents: 1000,
        },
        actorId
      )
    ).rejects.toThrow("does not match allocation member");
  });

  it("should reject reservation exceeding allocation amount", async () => {
    await expect(
      reservationService.createReservation(
        {
          memberId: member.id,
          allocationId: allocation.id,
          potId: pot.id,
          amountCents: 7000, // $70 > $60 allocation
        },
        actorId
      )
    ).rejects.toThrow("exceeds allocation amount");
  });

  it("should reject when total reservations exceed allocation", async () => {
    // Create first reservation of $40
    await reservationService.createReservation(
      {
        memberId: member.id,
        allocationId: allocation.id,
        potId: pot.id,
        amountCents: 4000,
      },
      actorId
    );

    // Try to add $30 (total would be $70 > $60 allocation)
    await expect(
      reservationService.createReservation(
        {
          memberId: member.id,
          allocationId: allocation.id,
          potId: pot.id,
          amountCents: 3000,
        },
        actorId
      )
    ).rejects.toThrow("would exceed allocation amount");
  });

  it("should reject when pot has insufficient balance", async () => {
    // Create pot with only $20
    const smallPot = await potRepo.save({
      balanceCents: 2000,
      // ...
    });

    await expect(
      reservationService.createReservation(
        {
          memberId: member.id,
          allocationId: allocation.id,
          potId: smallPot.id,
          amountCents: 5000, // $50 > $20 available
        },
        actorId
      )
    ).rejects.toThrow("insufficient balance");
  });

  it("should allow valid reservation", async () => {
    const reservation = await reservationService.createReservation(
      {
        memberId: member.id,
        allocationId: allocation.id,
        potId: pot.id,
        amountCents: 3000, // $30 < $60 allocation, pot has $100
      },
      actorId
    );

    expect(reservation).toBeTruthy();
    expect(reservation.amountCents).toBe(3000);
  });

  it("should account for existing reservations in pot balance", async () => {
    // Pot has $100, reserve $80
    await reservationService.createReservation(
      {
        memberId: member.id,
        allocationId: allocation.id,
        potId: pot.id,
        amountCents: 8000,
      },
      actorId
    );

    // Available balance is now $20, try to reserve $30
    await expect(
      reservationService.createReservation(
        {
          memberId: member.id,
          allocationId: allocation.id, // Different allocation
          potId: pot.id,
          amountCents: 3000,
        },
        actorId
      )
    ).rejects.toThrow("insufficient balance");
  });
});
```

### Validation

- [ ] All 9 ReservationService tests passing
- [ ] Member existence validated
- [ ] Allocation existence validated
- [ ] Transaction linkage validated
- [ ] Member-allocation match validated
- [ ] Reservation ≤ allocation enforced
- [ ] Total reservations ≤ allocation enforced
- [ ] Total reservations ≤ transaction enforced
- [ ] Pot balance checked
- [ ] Available balance calculated correctly

### Commit Message

```
feat(validation): implement comprehensive ReservationService validation

- Add validateReservation() with 10 validation checks
- Validate member and allocation existence
- Validate member matches allocation
- Validate reservation <= allocation amount
- Validate total reservations <= allocation
- Validate total reservations <= transaction
- Validate pot balance availability
- Calculate available balance (balance - existing reservations)
- Add 9 comprehensive validation tests

Fixes 9 failing tests in ReservationService
Related to Phase 2: Validation
```

---

## Task 2.4: PotService ACL Enforcement

**Estimated Time**: 4-5 hours  
**Status**: ⏳ Not Started  
**Current Failing Tests**: 7

### Goal

Implement Access Control List (ACL) enforcement for SOLO and SHARED pot visibility.

### Context

PotService doesn't enforce ACL:

- SOLO pots visible to all users (should be owner only)
- SHARED pots not filtered by membership
- enrichPots() not implemented

### Files to Modify

- `backend/services/potService.ts`

### Implementation

#### ACL Helper Methods

```typescript
/**
 * Check if user has access to a pot
 */
private async hasAccess(potId: string, userId: string): Promise<boolean> {
  const pot = await this.potRepo.findById(potId);
  if (!pot) return false;

  // SOLO pots: only owner has access
  if (pot.type === "SOLO") {
    return pot.ownerId === userId;
  }

  // SHARED pots: check membership
  const members = await this.memberRepo.findByPotId(potId);
  return members.some(m => m.userId === userId);
}

/**
 * Filter pots by user access
 */
private async filterByAccess(pots: Pot[], userId: string): Promise<Pot[]> {
  const accessible: Pot[] = [];

  for (const pot of pots) {
    if (await this.hasAccess(pot.id, userId)) {
      accessible.push(pot);
    }
  }

  return accessible;
}
```

#### Update list()

```typescript
async list(userId: string): Promise<Pot[]> {
  // Get all pots
  const allPots = await this.potRepo.list();

  // Filter by access
  return await this.filterByAccess(allPots, userId);
}
```

#### Update getById()

```typescript
async getById(potId: string, userId: string): Promise<Pot | null> {
  const pot = await this.potRepo.findById(potId);
  if (!pot) return null;

  // Check access
  const hasAccess = await this.hasAccess(potId, userId);
  if (!hasAccess) {
    throw new Error(`Pot ${potId} not found or access denied`);
  }

  return pot;
}
```

#### Implement enrichPots()

```typescript
/**
 * Enrich pots with calculated data (balance, member count)
 */
async enrichPots(pots: Pot[]): Promise<EnrichedPot[]> {
  const enriched: EnrichedPot[] = [];

  for (const pot of pots) {
    // Get members
    const members = await this.memberRepo.findByPotId(pot.id);

    // Calculate available balance
    const reservations = await this.reservationRepo.findByPotId(pot.id);
    const reservedAmount = reservations.reduce(
      (sum, r) => sum + r.amountCents,
      0
    );
    const availableBalance = pot.balanceCents - reservedAmount;

    enriched.push({
      ...pot,
      memberCount: members.length,
      members: members.map(m => ({
        id: m.id,
        name: m.name,
        role: m.role,
      })),
      availableBalanceCents: availableBalance,
      reservedAmountCents: reservedAmount,
    });
  }

  return enriched;
}
```

### Testing

```typescript
describe("PotService ACL", () => {
  let owner: User;
  let member: User;
  let soloPot: Pot;
  let sharedPot: Pot;

  beforeEach(async () => {
    owner = await userRepo.save(/* owner user */);
    member = await userRepo.save(/* member user */);

    soloPot = await potRepo.save({
      type: "SOLO",
      ownerId: owner.id,
      name: "Owner's Solo Pot",
      balanceCents: 10000,
      // ...
    });

    sharedPot = await potRepo.save({
      type: "SHARED",
      name: "Shared Pot",
      balanceCents: 20000,
      // ...
    });

    // Add owner to shared pot
    await memberRepo.save({
      potId: sharedPot.id,
      userId: owner.id,
      // ...
    });
  });

  describe("list()", () => {
    it("should return only owner's SOLO pots to owner", async () => {
      const pots = await potService.list(owner.id);

      expect(pots).toHaveLength(2); // solo + shared
      expect(pots.find((p) => p.id === soloPot.id)).toBeTruthy();
      expect(pots.find((p) => p.id === sharedPot.id)).toBeTruthy();
    });

    it("should not return SOLO pots to non-owner", async () => {
      const pots = await potService.list(member.id);

      expect(pots).not.toContain(soloPot);
      expect(pots.every((p) => p.id !== soloPot.id)).toBe(true);
    });

    it("should return SHARED pots to members only", async () => {
      const pots = await potService.list(owner.id);

      expect(pots.find((p) => p.id === sharedPot.id)).toBeTruthy();
    });
  });

  describe("getById()", () => {
    it("should allow owner to get SOLO pot", async () => {
      const pot = await potService.getById(soloPot.id, owner.id);
      expect(pot).toBeTruthy();
      expect(pot?.id).toBe(soloPot.id);
    });

    it("should reject non-owner getting SOLO pot", async () => {
      await expect(potService.getById(soloPot.id, member.id)).rejects.toThrow(
        "not found or access denied"
      );
    });

    it("should allow member to get SHARED pot", async () => {
      const pot = await potService.getById(sharedPot.id, owner.id);
      expect(pot).toBeTruthy();
    });

    it("should reject non-member getting SHARED pot", async () => {
      await expect(potService.getById(sharedPot.id, member.id)).rejects.toThrow(
        "not found or access denied"
      );
    });
  });

  describe("enrichPots()", () => {
    it("should include member count", async () => {
      const enriched = await potService.enrichPots([sharedPot]);

      expect(enriched[0].memberCount).toBe(1);
    });

    it("should include member list", async () => {
      const enriched = await potService.enrichPots([sharedPot]);

      expect(enriched[0].members).toHaveLength(1);
      expect(enriched[0].members[0].id).toBeTruthy();
    });

    it("should calculate available balance", async () => {
      // Create reservation of $30
      await reservationRepo.save({
        potId: sharedPot.id,
        amountCents: 3000,
        // ...
      });

      const enriched = await potService.enrichPots([sharedPot]);

      expect(enriched[0].balanceCents).toBe(20000); // $200
      expect(enriched[0].reservedAmountCents).toBe(3000); // $30
      expect(enriched[0].availableBalanceCents).toBe(17000); // $170
    });
  });
});
```

### Validation

- [ ] All 7 PotService tests passing
- [ ] list() filters SOLO pots by owner
- [ ] list() filters SHARED pots by membership
- [ ] getById() enforces ACL (rejects unauthorized)
- [ ] enrichPots() calculates member count
- [ ] enrichPots() includes member list
- [ ] enrichPots() calculates available balance

### Commit Message

```
feat(security): implement PotService ACL enforcement

- Add hasAccess() for SOLO/SHARED pot access checks
- Add filterByAccess() to filter pots by user
- Update list() to filter by user access
- Update getById() to reject unauthorized access
- Implement enrichPots() with member count and available balance
- SOLO pots visible only to owner
- SHARED pots visible only to members
- Add 7 ACL enforcement tests

Fixes 7 failing tests in PotService
Related to Phase 2: Validation
```

---

## Task 2.5: LedgerService Calculations

**Estimated Time**: 3-4 hours  
**Status**: ⏳ Not Started  
**Current Tests**: Stub implementations

### Goal

Implement balance calculations and settlement logic for financial reporting.

### Context

LedgerService has two stub methods:

- getBalances() - calculate outstanding balance per CardAccount
- calculateSettlement() - determine who owes whom

### Files to Modify

- `backend/services/ledgerService.ts`

### Implementation

#### getBalances()

```typescript
/**
 * Calculate outstanding balance per CardAccount
 * Outstanding = sum(transactions) - sum(payments)
 */
async getBalances(): Promise<Map<string, number>> {
  const balances = new Map<string, number>();

  // Get all transactions grouped by CardAccount
  const transactions = await this.transactionRepo.list();

  for (const transaction of transactions) {
    const current = balances.get(transaction.cardAccountId) || 0;
    balances.set(
      transaction.cardAccountId,
      current + transaction.amountCents
    );
  }

  // Subtract payments
  const payments = await this.paymentRepo.list();

  for (const payment of payments) {
    // Get transaction to find CardAccount
    const transaction = await this.transactionRepo.findById(payment.transactionId);
    if (!transaction) continue;

    const current = balances.get(transaction.cardAccountId) || 0;
    balances.set(
      transaction.cardAccountId,
      current - payment.amountCents
    );
  }

  return balances;
}
```

#### calculateSettlement()

```typescript
/**
 * Calculate who owes whom based on allocations and payments
 * Uses greedy algorithm to minimize number of transactions
 */
async calculateSettlement(): Promise<SettlementTransaction[]> {
  // Calculate net position per member
  const netPositions = new Map<string, number>();

  // Add allocations (what each member should pay)
  const transactions = await this.transactionRepo.list();
  for (const transaction of transactions) {
    const allocations = await this.allocationRepo.findByTransactionId(transaction.id);

    for (const allocation of allocations) {
      const amount = allocation.amountCents ||
        Math.round((transaction.amountCents * (allocation.percentage || 0)) / 100);

      const current = netPositions.get(allocation.memberId) || 0;
      netPositions.set(allocation.memberId, current - amount); // Negative = owes
    }
  }

  // Add payments (what each member has paid)
  const payments = await this.paymentRepo.list();
  for (const payment of payments) {
    // Get pot to find member (assuming pot has ownerId or similar)
    const pot = await this.potRepo.findById(payment.potId);
    if (!pot) continue;

    const current = netPositions.get(pot.ownerId) || 0;
    netPositions.set(pot.ownerId, current + payment.amountCents); // Positive = paid
  }

  // Separate into debtors and creditors
  const debtors: Array<{ memberId: string; amount: number }> = [];
  const creditors: Array<{ memberId: string; amount: number }> = [];

  for (const [memberId, balance] of netPositions.entries()) {
    if (balance < 0) {
      debtors.push({ memberId, amount: Math.abs(balance) });
    } else if (balance > 0) {
      creditors.push({ memberId, amount: balance });
    }
  }

  // Greedy settlement algorithm
  const settlements: SettlementTransaction[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.amount, creditor.amount);

    settlements.push({
      fromMemberId: debtor.memberId,
      toMemberId: creditor.memberId,
      amountCents: amount,
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount === 0) i++;
    if (creditor.amount === 0) j++;
  }

  return settlements;
}
```

### Testing

```typescript
describe("LedgerService", () => {
  describe("getBalances()", () => {
    it("should calculate outstanding balance per CardAccount", async () => {
      // Create transactions totaling $300 for CardAccount1
      const cardAccount1 = await cardAccountRepo.save(/* ... */);
      await transactionRepo.save({
        cardAccountId: cardAccount1.id,
        amountCents: 20000, // $200
        // ...
      });
      await transactionRepo.save({
        cardAccountId: cardAccount1.id,
        amountCents: 10000, // $100
        // ...
      });

      // Create payment of $150
      const transaction = await transactionRepo.findByCardAccountId(
        cardAccount1.id
      );
      await paymentRepo.save({
        transactionId: transaction[0].id,
        amountCents: 15000,
        // ...
      });

      const balances = await ledgerService.getBalances();

      // Outstanding = $300 - $150 = $150
      expect(balances.get(cardAccount1.id)).toBe(15000);
    });

    it("should handle multiple CardAccounts", async () => {
      const cardAccount1 = await cardAccountRepo.save(/* ... */);
      const cardAccount2 = await cardAccountRepo.save(/* ... */);

      await transactionRepo.save({
        cardAccountId: cardAccount1.id,
        amountCents: 10000,
        // ...
      });
      await transactionRepo.save({
        cardAccountId: cardAccount2.id,
        amountCents: 20000,
        // ...
      });

      const balances = await ledgerService.getBalances();

      expect(balances.get(cardAccount1.id)).toBe(10000);
      expect(balances.get(cardAccount2.id)).toBe(20000);
    });
  });

  describe("calculateSettlement()", () => {
    it("should calculate who owes whom", async () => {
      // Setup: Transaction $100, Alice allocated 60%, Bob 40%
      // Alice paid $100 from her pot
      // Result: Bob owes Alice $40

      const settlements = await ledgerService.calculateSettlement();

      expect(settlements).toHaveLength(1);
      expect(settlements[0].fromMemberId).toBe(bob.id);
      expect(settlements[0].toMemberId).toBe(alice.id);
      expect(settlements[0].amountCents).toBe(4000); // $40
    });

    it("should minimize number of transactions", async () => {
      // Complex scenario with multiple members
      // Should optimize to minimal settlement transactions

      const settlements = await ledgerService.calculateSettlement();

      // Verify it's optimal (fewer than naive approach)
      expect(settlements.length).toBeLessThan(6); // Example threshold
    });
  });
});
```

### Validation

- [ ] getBalances() calculates correctly per CardAccount
- [ ] getBalances() subtracts payments
- [ ] getBalances() handles multiple CardAccounts
- [ ] calculateSettlement() determines who owes whom
- [ ] calculateSettlement() minimizes transactions
- [ ] All LedgerService tests passing

### Commit Message

```
feat(ledger): implement balance and settlement calculations

- Implement getBalances() for outstanding balance per CardAccount
- Calculate outstanding = transactions - payments
- Implement calculateSettlement() using greedy algorithm
- Minimize number of settlement transactions
- Calculate net positions (allocations - payments)
- Separate debtors and creditors
- Add comprehensive calculation tests

Related to Phase 2: Validation
```

---

## Phase 2 Completion Checklist

### Implementation

- [ ] Task 2.1: TransactionService (3-4 hrs)
- [ ] Task 2.2: PaymentService (3-4 hrs)
- [ ] Task 2.3: ReservationService (5-6 hrs)
- [ ] Task 2.4: PotService ACL (4-5 hrs)
- [ ] Task 2.5: LedgerService (3-4 hrs)

### Testing

- [ ] All 34 previously failing tests now passing
- [ ] 28+ new validation tests passing
- [ ] Integration tests verify end-to-end flows
- [ ] ACL enforcement verified

### Validation

- [ ] No invalid data can be saved
- [ ] All business rules enforced
- [ ] ACL blocks unauthorized access
- [ ] Balance calculations accurate
- [ ] Clear error messages

---

## Next Steps

After Phase 2 completion:

1. Merge to main branch
2. Consider Phase 3: Polish (optional for MVP)
3. MVP is production-ready after Phase 2

---

_Last Updated: November 8, 2025_  
_Ready to implement after Phase 1_
