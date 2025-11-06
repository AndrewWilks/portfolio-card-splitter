# Pre-MVP Cleanup: Entity Model Gap Analysis

**Date**: 2025-11-07  
**Purpose**: Identify gaps between implemented entities and product specifications

## Summary

The shared entity layer is **mostly aligned** with the high-level spec and architecture docs, but several **critical entities are missing** and some existing entities need **refinement** to fully support the MVP.

---

## Missing Entities (Critical)

### 1. CardAccount Entity ❌ **MISSING**

**Spec requirement**: "CardAccounts represent credit card accounts (issuer, name, last4, billing cycle, credit limit)"

**Why needed**:

- Every transaction must belong to exactly one CardAccount
- Outstanding balance calculation is per CardAccount
- Dashboard shows outstanding totals per CardAccount

**Required fields**:

```typescript
interface CardAccountData extends EntityData {
  name: string; // User-friendly name
  issuer: string; // e.g., "Chase", "Amex"
  last4: string; // Last 4 digits
  billingCycle: number; // Day of month (1-31)
  creditLimitCents?: Cents; // Optional credit limit
  ownerId: string; // User who owns this account
  isActive: boolean; // Soft delete support
}
```

**Business rules**:

- Cannot delete if transactions exist (archive instead)
- If only one CardAccount exists, auto-select for new transactions

### 2. Card Entity ❌ **MISSING**

**Spec requirement**: "Cards (optional) represent physical/virtual card numbers within an account"

**Why needed**:

- Track "who swiped" for shared accounts
- Filter transactions by card
- Useful for multi-card households

**Required fields**:

```typescript
interface CardData extends EntityData {
  cardAccountId: string; // Parent CardAccount
  memberId?: string; // Who typically uses this card
  nickname?: string; // e.g., "Alice's card", "Virtual #1"
  last4?: string; // Last 4 of card number
  isActive: boolean; // Soft delete support
}
```

**Business rules**:

- Cards are optional (transactions can exist without Card attribution)
- Cards don't affect splits or payments (attribution only)

---

## Entity Refinements Required

### 3. Transaction Entity ⚠️ **NEEDS UPDATE**

**Current state**: Missing `cardAccountId` (critical) and optional `cardId`

**Required changes**:

```typescript
interface TransactionData extends EntityData {
  cardAccountId: string; // ✅ ADD - Every transaction belongs to one CardAccount
  cardId?: string; // ✅ ADD - Optional card attribution
  merchantId: string;
  description: string;
  amountCents: Cents;
  type: TransactionType;
  transactionDate: Date;
  createdById: string;
}
```

**Business rules to add**:

- `cardAccountId` is required (no default)
- If only one CardAccount exists, frontend can auto-select
- `cardId` is optional and must belong to the same CardAccount

### 4. Allocation Entity ⚠️ **NEEDS MINOR UPDATE**

**Current state**: Good, but missing link to member's allocation for reservations

**Issue**: Spec says "Each member reserves against their own allocation separately"

**Suggested addition**:

- Consider adding a way to link Reservation → Allocation (currently Reservation only links to Transaction)
- This ensures reservations are tied to specific member allocations

**Possible solution**:

```typescript
interface ReservationData extends EntityData {
  potId: string;
  transactionId: string;
  allocationId: string; // ✅ ADD - Link to specific allocation
  memberId: string; // ✅ ADD - Denormalized for easier queries
  amountCents: Cents;
}
```

### 5. Payment Entity ⚠️ **NEEDS VALIDATION**

**Current state**: All fields are optional (too permissive)

**Issue**: Spec says "Record a payment from a pot to a transaction"

**Required changes**:

```typescript
interface PaymentData extends EntityData {
  potId: string; // ✅ MAKE REQUIRED - Payment must come from a pot
  transactionId: string; // ✅ MAKE REQUIRED - Payment must be to a transaction
  amountCents: Cents; // ✅ MAKE REQUIRED - Payment must have an amount
  paidOn: Date; // ✅ MAKE REQUIRED - When payment occurred
  reservationId?: string; // Optional link to reservation
  note?: string; // Optional note
}
```

**Business rules to add**:

- Payment amount cannot exceed transaction total
- Payment reduces outstanding balance of linked CardAccount
- If payment differs from reservations, flag for reconciliation

### 6. Pot Entity ⚠️ **NEEDS MINOR UPDATE**

**Current state**: Good derived value handling, but field naming inconsistent

**Issue**: Uses `ownerId` (should be `userId` for consistency with spec language "Owner sets up the space")

**Suggested refinement**:

- Consider renaming `ownerId` → `userId` or document that "owner" means "user who created it"
- Add validation that `scope = SOLO` pots have visibility restrictions

### 7. Member Entity ✅ **LOOKS GOOD**

**Current state**: Aligns with spec

**Note**: Ensure relationship to User is clear (Member is a user participating in expenses)

---

## Validation & Business Rule Gaps

### Allocation Validation ✅ **IMPLEMENTED**

- [x] One-of rule (basisPoints XOR amountCents) ✅ Present in `create()` and schema
- [x] Calculated amount handling ✅ Present

### Transaction Validation ⚠️ **PARTIAL**

- [ ] Allocations must sum to transaction total (service layer, not entity)
- [ ] Transaction must belong to CardAccount ❌ Field missing
- [ ] Cannot save with mismatched allocation totals (service layer)

### Payment Validation ⚠️ **MISSING**

- [ ] Cannot exceed transaction total
- [ ] Must link to valid pot and transaction
- [ ] Flag if differs from reservations

### Reservation Validation ⚠️ **PARTIAL**

- [ ] Cannot reserve more than pot balance (service layer)
- [ ] Cannot reserve more than allocation amount (needs allocation link)

### Pot Validation ✅ **GOOD**

- [x] Derived values computed, not persisted ✅ Present
- [ ] Visibility ACL enforcement (service layer)

---

## Entity Export/Import Consistency

### Current `index.ts` exports ⚠️ **NEEDS UPDATE**

**Missing exports for new entities**:

- CardAccount (once created)
- Card (once created)

**Check these are exported**:

- ✅ Allocation
- ✅ Event
- ✅ InviteToken
- ✅ Member
- ✅ Merchant
- ✅ PasswordResetToken
- ✅ Payment
- ✅ Pot
- ✅ Reservation
- ✅ Session
- ✅ Tag
- ✅ Transaction
- ✅ Transfer
- ✅ User

---

## Recommended Implementation Order

### Phase 1: Critical Missing Entities (Blocker for MVP)

1. **CardAccount** entity (required for transactions)
2. **Card** entity (optional attribution, nice-to-have)
3. Update **Transaction** to include `cardAccountId` and `cardId`

### Phase 2: Validation & Business Rules

4. Update **Payment** to make required fields non-optional
5. Update **Reservation** to link to Allocation and Member
6. Add schema refinements for edge cases

### Phase 3: Polish

7. Add service-layer validation for aggregate rules (allocations sum to 100%, etc.)
8. Ensure all entities have proper getters for public API
9. Document entity relationships clearly

---

## Notes for Implementation

**CardAccount is the highest priority** - without it, transactions cannot be properly modeled per the spec.

**Spec alignment checklist**:

- [ ] CardAccount entity created
- [ ] Card entity created
- [ ] Transaction.cardAccountId added
- [ ] Transaction.cardId added
- [ ] Payment fields made required
- [ ] Reservation linked to Allocation
- [ ] All entities exported from index.ts
- [ ] Architecture doc updated with new entities

**Testing requirements**:

- Add tests for CardAccount/Card creation and validation
- Update Transaction tests to require cardAccountId
- Test Payment validation for required fields
- Test Reservation → Allocation linking

---

This gap analysis provides a clear roadmap for bringing the entity model into full alignment with the MVP specification.
