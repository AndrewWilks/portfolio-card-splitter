# Pre-MVP Cleanup: Implementation Plan

**Date**: 2025-11-07  
**Purpose**: Step-by-step plan to align codebase with product specifications

---

## Overview

This plan has **two major phases**:

1. **Phase 0: Cleanup** - Remove outdated code that conflicts with current specs
2. **Phase 1-3: Implementation** - Add missing entities and refinements per gap analysis

---

## Phase 0: Pre-Implementation Cleanup 🧹

**Goal**: Remove code that doesn't match the updated specs before adding new features.

### 0.1 Database Schema Cleanup

#### Issue: Transfer table doesn't support cash transactions

**Current state**: Both `fromPotId` and `toPotId` are `NOT NULL` in database schema

**Spec requirement**: "Transfers support cash transactions via nullable pot IDs"

**Files to update**:

- `backend/db/schema/tables/transfers.ts`
  - Make `fromPotId` nullable (remove `.notNull()`)
  - Make `toPotId` nullable (remove `.notNull()`)
  - Add check constraint: at least one must be non-null

**Migration required**: Yes - alter table to change constraints

```sql
-- Migration: Make transfer pot IDs nullable
ALTER TABLE transfers
  ALTER COLUMN from_pot_id DROP NOT NULL,
  ALTER COLUMN to_pot_id DROP NOT NULL;

-- Add check constraint
ALTER TABLE transfers
  ADD CONSTRAINT transfers_at_least_one_pot
  CHECK (from_pot_id IS NOT NULL OR to_pot_id IS NOT NULL);
```

#### Issue: Payment table has wrong field structure

**Current state**: `potId` is nullable, but spec says payments must come from a pot

**Spec requirement**: "Payment must come from a pot to a transaction"

**Files to update**:

- `backend/db/schema/tables/payment.ts`
  - Make `potId` NOT NULL (add `.notNull()`)
  - Consider renaming `description` to `note` for consistency with spec
  - Add `paidOn` field (date field, currently missing)

**Migration required**: Yes - alter table structure

```sql
-- Migration: Fix payment table structure
ALTER TABLE payments
  ALTER COLUMN pot_id SET NOT NULL;

-- Add paidOn field
ALTER TABLE payments
  ADD COLUMN paid_on DATE NOT NULL DEFAULT CURRENT_DATE;
```

#### Issue: Allocation table has calculated field (violates derived value pattern)

**Current state**: `calculatedAmountCents` is persisted

**Spec requirement**: "Derived values should be computed, not persisted"

**Files to update**:

- `backend/db/schema/tables/allocations.ts`
  - Remove `calculatedAmountCents` field from schema
  - Calculation should happen in entity layer only

**Migration required**: Yes - drop column

```sql
-- Migration: Remove calculated field
ALTER TABLE allocations
  DROP COLUMN calculated_amount_cents;
```

#### Issue: Reservation table missing link to allocation

**Current state**: Reservation only links to `potId` and `transactionId`

**Spec requirement**: "Each member reserves against their own allocation separately"

**Files to update**:

- `backend/db/schema/tables/reservations.ts`
  - Add `allocationId` field (references allocations table)
  - Add `memberId` field (denormalized for easier queries)

**Migration required**: Yes - add columns

```sql
-- Migration: Add allocation link to reservations
ALTER TABLE reservations
  ADD COLUMN allocation_id UUID REFERENCES allocations(id) ON DELETE CASCADE,
  ADD COLUMN member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT;

CREATE INDEX idx_reservations_allocation_id ON reservations(allocation_id);
CREATE INDEX idx_reservations_member_id ON reservations(member_id);
```

### 0.2 Entity Schema Cleanup

**Files to review and update**:

- `shared/entities/payment.ts`

  - Update interface to match new database schema
  - Make `potId`, `transactionId`, `amountCents`, `paidOn` required
  - Keep `reservationId` and `note` optional
  - Update Zod schema to enforce required fields

- `shared/entities/reservation.ts`

  - Add `allocationId` and `memberId` to interface
  - Update Zod schema
  - Update factory method to require new fields

- `shared/entities/transfer.ts`

  - ✅ Already supports nullable pot IDs (done in previous session)
  - Verify alignment with updated database schema

- `shared/entities/allocation.ts`
  - ✅ Already enforces one-of rule (done in previous session)
  - Remove `calculatedAmountCents` from persisted data
  - Keep calculation logic in entity methods only

### 0.3 Repository Cleanup

**Files to update**:

- `backend/repositories/paymentRepository.ts`

  - Update queries to handle new required fields
  - Update create/update methods to enforce required fields

- `backend/repositories/reservationRepository.ts`

  - Update queries to include `allocationId` and `memberId`
  - Update create methods to require new fields

- `backend/repositories/transferRepository.ts`
  - Verify queries handle nullable `fromPotId` and `toPotId`
  - Ensure filters work correctly for cash transactions

### 0.4 Service Cleanup

**Files to update**:

- `backend/services/paymentService.ts`

  - Update business logic to require `potId`, `paidOn`
  - Add validation: payment cannot exceed transaction total
  - Add logic to flag mismatches between payment and reservations

- `backend/services/reservationService.ts`

  - Update to link reservations to specific allocations
  - Add validation: cannot reserve more than allocation amount

- `backend/services/transferService.ts`
  - Verify cash transaction support
  - Add validation for cash-in vs cash-out vs pot-to-pot

### 0.5 Route/API Cleanup

**Files to update**:

- `backend/routes/payments/api_payments_create.ts`

  - Update request validation to require `potId`, `paidOn`
  - Update response structure

- `backend/routes/reservations/api_reservations_create.ts`
  - Add `allocationId` and `memberId` to request validation
  - Update response structure

### 0.6 Test Cleanup

**Action**: Run existing tests to identify failures from schema changes

**Files to update**:

- `backend/__tests__/repositories/paymentRepository.test.ts`
- `backend/__tests__/repositories/reservationRepository.test.ts`
- `backend/__tests__/services/paymentService.test.ts`
- `backend/__tests__/services/reservationService.test.ts`
- `shared/__tests__/entities/payment.test.ts`
- `shared/__tests__/entities/reservation.test.ts`

**Expected failures**: Tests that create payments/reservations without new required fields

### 0.7 Documentation Cleanup

**Files to review**:

- ~~`specs/001-mvp-specification/data-model.md`~~ (folder is empty, can ignore)
- ~~`docs/architecture.md`~~ (doesn't exist, can ignore)

**Outdated references**: Old data model specs have been superseded by:

- `specs/0. high level.md` (current product spec)
- `specs/1. architecture.md` (current technical spec)

---

## Phase 1: Critical Missing Entities (MVP Blocker) 🚨

**Goal**: Add CardAccount and Card entities - required for transactions to work per spec.

### 1.1 Create CardAccount Entity

**Files to create**:

- `shared/entities/cardAccount.ts`
  - Interface: name, issuer, last4, billingCycle, creditLimitCents?, ownerId, isActive
  - Factory method with validation
  - Zod schema
  - Business rules: cannot delete if transactions exist

**Template**:

```typescript
import { z } from "zod";
import { Entity, type EntityData } from "./base/entity.ts";

export interface CardAccountData extends EntityData {
  name: string;
  issuer: string;
  last4: string;
  billingCycle: number; // 1-31
  creditLimitCents?: number;
  ownerId: string;
  isActive: boolean;
}

export const cardAccountSchema = z.object({
  name: z.string().min(1).max(255),
  issuer: z.string().min(1).max(255),
  last4: z
    .string()
    .length(4)
    .regex(/^\d{4}$/),
  billingCycle: z.number().int().min(1).max(31),
  creditLimitCents: z.number().int().positive().optional(),
  ownerId: z.string().uuid(),
  isActive: z.boolean(),
});

export class CardAccount extends Entity {
  // Implementation
}
```

### 1.2 Create Card Entity

**Files to create**:

- `shared/entities/card.ts`
  - Interface: cardAccountId, memberId?, nickname?, last4?, isActive
  - Factory method with validation
  - Zod schema
  - Business rules: optional attribution only

**Template**:

```typescript
import { z } from "zod";
import { Entity, type EntityData } from "./base/entity.ts";

export interface CardData extends EntityData {
  cardAccountId: string;
  memberId?: string;
  nickname?: string;
  last4?: string;
  isActive: boolean;
}

export const cardSchema = z.object({
  cardAccountId: z.string().uuid(),
  memberId: z.string().uuid().optional(),
  nickname: z.string().max(100).optional(),
  last4: z
    .string()
    .length(4)
    .regex(/^\d{4}$/)
    .optional(),
  isActive: z.boolean(),
});

export class Card extends Entity {
  // Implementation
}
```

### 1.3 Update Transaction Entity

**Files to update**:

- `shared/entities/transaction.ts`
  - Add `cardAccountId: string` (required)
  - Add `cardId?: string` (optional)
  - Update Zod schema
  - Update factory method

### 1.4 Create Database Tables

**Migration**: `001_add_card_accounts_and_cards.sql`

```sql
-- Create card_accounts table
CREATE TABLE card_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  last4 VARCHAR(4) NOT NULL,
  billing_cycle INTEGER NOT NULL CHECK (billing_cycle >= 1 AND billing_cycle <= 31),
  credit_limit_cents BIGINT CHECK (credit_limit_cents > 0),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_card_accounts_owner_id ON card_accounts(owner_id);
CREATE INDEX idx_card_accounts_is_active ON card_accounts(is_active);

-- Create cards table
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_account_id UUID NOT NULL REFERENCES card_accounts(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  nickname VARCHAR(100),
  last4 VARCHAR(4),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cards_card_account_id ON cards(card_account_id);
CREATE INDEX idx_cards_member_id ON cards(member_id);
CREATE INDEX idx_cards_is_active ON cards(is_active);

-- Add card references to transactions
ALTER TABLE transactions
  ADD COLUMN card_account_id UUID NOT NULL REFERENCES card_accounts(id) ON DELETE RESTRICT,
  ADD COLUMN card_id UUID REFERENCES cards(id) ON DELETE SET NULL;

CREATE INDEX idx_transactions_card_account_id ON transactions(card_account_id);
CREATE INDEX idx_transactions_card_id ON transactions(card_id);
```

### 1.5 Create Database Schema Files

**Files to create**:

- `backend/db/schema/tables/cardAccounts.ts`
- `backend/db/schema/tables/cards.ts`
- `backend/db/schema/relations/cardAccountsRelations.ts`
- `backend/db/schema/relations/cardsRelations.ts`

**Files to update**:

- `backend/db/schema/tables/index.ts` (add exports)
- `backend/db/schema/relations/index.ts` (add exports)
- `backend/db/schema/tables/transactions.ts` (add cardAccountId, cardId fields)
- `backend/db/db.schema.ts` (add exports)

### 1.6 Create Repositories

**Files to create**:

- `backend/repositories/cardAccountRepository.ts`

  - CRUD operations
  - List by owner
  - Check for transactions before delete

- `backend/repositories/cardRepository.ts`
  - CRUD operations
  - List by card account
  - List by member

**Files to update**:

- `backend/repositories/index.ts` (add exports)
- `backend/di/repositories.ts` (add factory functions)

### 1.7 Create Services

**Files to create**:

- `backend/services/cardAccountService.ts`

  - Business logic for card accounts
  - Validation: cannot delete if transactions exist
  - Archive pattern (set isActive = false)

- `backend/services/cardService.ts`
  - Business logic for cards
  - Validation: card must belong to same card account

**Files to update**:

- `backend/services/index.ts` (add exports)
- `backend/di/services.ts` (add factory functions)

### 1.8 Create Routes

**Files to create**:

- `backend/routes/cardAccounts/api_card_accounts_list.ts`
- `backend/routes/cardAccounts/api_card_accounts_create.ts`
- `backend/routes/cardAccounts/api_card_accounts_update.ts`
- `backend/routes/cards/api_cards_list.ts`
- `backend/routes/cards/api_cards_create.ts`
- `backend/routes/cards/api_cards_update.ts`

**Files to update**:

- `backend/routes/index.ts` (add exports)
- `backend/di/routes.ts` (add factory functions)
- `backend/server.ts` (register routes)

### 1.9 Update Transaction Routes

**Files to update**:

- `backend/routes/transactions/api_transactions_create.ts`

  - Add `cardAccountId` to request validation (required)
  - Add `cardId` to request validation (optional)

- `backend/routes/transactions/api_transactions_update.ts`
  - Allow updating `cardAccountId` and `cardId`

### 1.10 Add Tests

**Files to create**:

- `shared/__tests__/entities/cardAccount.test.ts`
- `shared/__tests__/entities/card.test.ts`
- `backend/__tests__/repositories/cardAccountRepository.test.ts`
- `backend/__tests__/repositories/cardRepository.test.ts`
- `backend/__tests__/services/cardAccountService.test.ts`
- `backend/__tests__/services/cardService.test.ts`
- `backend/__tests__/routes/cardAccounts/*.test.ts`
- `backend/__tests__/routes/cards/*.test.ts`

**Files to update**:

- `backend/__tests__/repositories/transactionRepository.test.ts` (add cardAccountId)
- `backend/__tests__/services/transactionService.test.ts` (add cardAccountId)
- `backend/__tests__/routes/transactions/*.test.ts` (add cardAccountId)

### 1.11 Update Entity Exports

**Files to update**:

- `shared/entities/index.ts`
  - Add `export { CardAccount } from "./cardAccount.ts";`
  - Add `export { Card } from "./card.ts";`

---

## Phase 2: Validation & Business Rules ✅

**Goal**: Enforce business rules at entity and service layers.

### 2.1 Update Payment Validation

**Files to update**:

- `shared/entities/payment.ts`

  - ✅ Make potId, transactionId, amountCents, paidOn required (done in Phase 0)
  - Add business rule validation methods

- `backend/services/paymentService.ts`
  - Add validation: payment cannot exceed transaction total
  - Add logic: flag if payment differs from reservations
  - Add logic: payment reduces outstanding balance of linked CardAccount

### 2.2 Update Reservation Validation

**Files to update**:

- `shared/entities/reservation.ts`

  - ✅ Add allocationId and memberId (done in Phase 0)
  - Add validation methods

- `backend/services/reservationService.ts`
  - Add validation: cannot reserve more than pot balance
  - Add validation: cannot reserve more than allocation amount
  - Add validation: reservations must link to correct allocation

### 2.3 Add Transaction Validation

**Files to update**:

- `backend/services/transactionService.ts`
  - Add validation: allocations must sum to transaction total
  - Add validation: transaction must belong to valid CardAccount
  - Add validation: cardId (if provided) must belong to same CardAccount

### 2.4 Add Allocation Validation

**Files to update**:

- `backend/services/transactionService.ts` (or create separate AllocationService)
  - Add validation: allocations must sum to 100% (for percentage-based)
  - Add validation: allocations must sum to transaction total (for fixed amounts)
  - Add validation: cannot mix percentage and fixed amount allocations

### 2.5 Add Pot Validation

**Files to update**:

- `backend/services/potService.ts`
  - Add validation: scope = SOLO pots have visibility restrictions
  - Add ACL enforcement for pot access

---

## Phase 3: Polish & Documentation 📝

**Goal**: Finalize implementation and update documentation.

### 3.1 Service Layer Refinements

**Files to review**:

- `backend/services/ledgerService.ts`
  - Ensure outstanding balance calculation includes CardAccount grouping
  - Formula: `sum(transactions.amountCents) - sum(payments.amountCents)` per CardAccount

### 3.2 Entity Relationships

**Files to update**:

- Update all entity getter methods to expose proper public API
- Ensure private methods stay private
- Document entity relationships in comments

### 3.3 Architecture Documentation

**Files to update**:

- `specs/1. architecture.md`
  - Add CardAccount and Card to domain model section
  - Update database schema section
  - Update API endpoints section (add /api/card-accounts and /api/cards)

### 3.4 Gap Analysis Update

**Files to update**:

- `specs/000-pre-mvp-cleanup/spec.md`
  - Check off completed items as work progresses
  - Document any new gaps discovered during implementation

---

## Migration Strategy

### Migration Order

Execute migrations in this order to avoid dependency issues:

1. **Phase 0 migrations** (cleanup existing tables):

   - `000_cleanup_transfers.sql` - Make pot IDs nullable
   - `000_cleanup_payments.sql` - Fix payment structure
   - `000_cleanup_allocations.sql` - Remove calculated field
   - `000_cleanup_reservations.sql` - Add allocation link

2. **Phase 1 migrations** (add new tables):
   - `001_add_card_accounts_and_cards.sql` - Create CardAccount and Card tables
   - `002_add_card_refs_to_transactions.sql` - Add card references to transactions

### Migration Testing

**Before running migrations**:

1. Backup database
2. Test migrations on local dev database
3. Verify all tests pass
4. Review migration rollback procedures

**Rollback procedures**:

- Each migration should have a corresponding down migration
- Test rollback on dev database before production

---

## Testing Strategy

### Test Phases

**Phase 0 Testing** (after cleanup):

- [ ] All existing entity tests pass
- [ ] All existing repository tests pass
- [ ] All existing service tests pass
- [ ] All existing route tests pass

**Phase 1 Testing** (after adding CardAccount/Card):

- [ ] CardAccount entity tests pass
- [ ] Card entity tests pass
- [ ] Transaction entity tests with cardAccountId pass
- [ ] CardAccount repository tests pass
- [ ] Card repository tests pass
- [ ] CardAccount service tests pass
- [ ] Card service tests pass
- [ ] CardAccount route tests pass
- [ ] Card route tests pass

**Phase 2 Testing** (after validation):

- [ ] Payment validation tests pass
- [ ] Reservation validation tests pass
- [ ] Transaction validation tests pass
- [ ] Allocation validation tests pass

**Phase 3 Testing** (final polish):

- [ ] Integration tests for full workflows
- [ ] End-to-end tests for critical paths
- [ ] Manual testing of UI flows

### Test Coverage Goals

- Entity layer: 100% coverage
- Repository layer: 90%+ coverage
- Service layer: 90%+ coverage
- Route layer: 85%+ coverage

---

## Success Criteria

### Phase 0 Complete When

- [ ] All database migrations run successfully
- [ ] All entity schemas updated and tests pass
- [ ] All repositories handle updated schemas
- [ ] All services enforce updated business rules
- [ ] All routes validate updated request/response structures
- [ ] All existing tests pass with updated schemas

### Phase 1 Complete When

- [x] CardAccount entity created and tested
- [x] Card entity created and tested
- [x] Transaction entity updated with cardAccountId/cardId
- [x] Database tables created and migrated
- [x] Repositories created and tested
- [x] Services created and tested
- [x] Routes created and tested
- [x] All entities exported from index.ts
- [x] All new tests pass

**Phase 1 Status**: ✅ **COMPLETE**

**Completion Date**: 2025-11-07

**Summary**:

- All 11 tasks completed (Tasks 1.1-1.11)
- 106 entity tests passing
- 21 repository tests passing
- 17 service tests passing
- 13 route tests passing
- 16 integration tests passing
- **Total: 173 tests passing**
- All DI wiring verified
- All exports verified
- Commit hashes: Multiple commits from 568fc75 to ed74d96

### Phase 2 Complete When

- [ ] Payment validation enforces business rules
- [ ] Reservation validation enforces allocation linking
- [ ] Transaction validation enforces cardAccount requirements
- [ ] Allocation validation enforces sum rules
- [ ] Pot validation enforces visibility rules
- [ ] All validation tests pass

### Phase 3 Complete When

- [ ] Architecture documentation updated
- [ ] Entity relationships documented
- [ ] Service layer polished
- [ ] Gap analysis checklist complete
- [ ] All tests pass
- [ ] Manual testing complete

---

## Risk Mitigation

### Known Risks

**Risk**: Database migrations fail due to existing data

- **Mitigation**: Test migrations on copy of production data
- **Fallback**: Rollback procedures documented

**Risk**: Breaking changes affect existing functionality

- **Mitigation**: Comprehensive test coverage before Phase 0
- **Fallback**: Feature flags for new functionality

**Risk**: CardAccount requirement blocks existing transaction creation

- **Mitigation**: Create default CardAccount during migration
- **Fallback**: Allow temporary "unassigned" CardAccount

### Data Migration Considerations

**For existing transactions without cardAccountId**:

- Option 1: Create a default "Legacy" CardAccount and assign all existing transactions to it
- Option 2: Require manual assignment before migration (data cleanup task)
- **Recommended**: Option 1 for smooth migration

**Migration SQL**:

```sql
-- Create default card account for existing transactions
INSERT INTO card_accounts (name, issuer, last4, billing_cycle, owner_id, is_active)
VALUES ('Legacy Account', 'Unknown', '0000', 1, (SELECT id FROM users LIMIT 1), true)
RETURNING id;

-- Assign existing transactions to default card account
UPDATE transactions
SET card_account_id = '<default_card_account_id>'
WHERE card_account_id IS NULL;
```

---

## Timeline Estimate

**Phase 0: Cleanup** - 2-3 days

- Day 1: Database migrations and entity updates
- Day 2: Repository and service updates
- Day 3: Test fixes and validation

**Phase 1: CardAccount/Card** - 4-5 days

- Day 1: Entity creation and tests
- Day 2: Database tables and repositories
- Day 3: Services and business logic
- Day 4: Routes and API endpoints
- Day 5: Integration tests and bug fixes

**Phase 2: Validation** - 2-3 days

- Day 1: Payment and reservation validation
- Day 2: Transaction and allocation validation
- Day 3: Test coverage and edge cases

**Phase 3: Polish** - 1-2 days

- Day 1: Documentation updates
- Day 2: Final testing and cleanup

**Total**: 9-13 days for complete implementation

---

## Next Steps

1. **Review this plan** with team/stakeholders
2. **Create migration scripts** for Phase 0
3. **Set up feature branch**: `feature/pre-mvp-cleanup`
4. **Begin Phase 0 implementation**
5. **Checkpoint**: Verify all tests pass before moving to Phase 1

---

This implementation plan provides a clear, sequential roadmap for bringing the codebase into full alignment with the MVP specifications.
