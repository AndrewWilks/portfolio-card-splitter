# Phase 1 Implementation Summary

**Date**: November 7, 2025  
**Phase**: 1 - Entities (CardAccount, CardAccountSettings, Card)  
**Status**: Ready for Implementation

## Overview

Phase 1 adds credit card account management to the Portfolio Card Splitter MVP. This includes:

1. **CardAccount** - Core entity representing credit card accounts
2. **CardAccountSettings** - Configuration layer with Australian credit card defaults
3. **Card** - Optional entity for card attribution to members
4. **Transaction Updates** - Links to CardAccounts and Cards

## Decisions Made

### 1. Factory Pattern: Constructor (Not Static create())

**Decision**: Use `constructor()` directly as the factory method.

**Rationale**:

- Matches 80% of existing entities (Merchant, Pot, Transaction)
- Simpler pattern, less code duplication
- Standard approach for Phase 1 forward

**Example**:

```typescript
const cardAccount = new CardAccount({
  name: "Chase Sapphire",
  issuer: "Chase",
  last4: "1234",
  billingCycle: 15,
  ownerId: userId,
  isActive: true,
});
```

### 2. Schema Pattern: Dual (createSchema + schema)

**Decision**: Include both `createSchema` and `schema` for API compatibility.

**Rationale**:

- `createSchema` - Used for API create requests (may have different required fields)
- `schema` - Used for validation and reconstruction
- Provides flexibility for API evolution

**Example**:

```typescript
class CardAccount extends Entity {
  static override get schema() {
    return z.object({
      /* full schema */
    });
  }

  static readonly createSchema = this.schema; // For now, identical

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
```

### 3. Soft Delete: isActive Flag

**Decision**: Use soft delete via `isActive` flag, cron jobs for cleanup later (post-MVP).

**Rationale**:

- Inherited from Entity base class
- Preserves data for audit trail
- Enables "archive" functionality without data loss
- Cleanup can be implemented as background job after MVP

**Implementation**:

```typescript
archive(): void {
  this.toggleActive();
}
```

### 4. CardAccount Settings: Separate Entity (Phase 1)

**Decision**: Implement CardAccountSettings as a separate entity in Phase 1.

**Rationale**:

- Keeps CardAccount entity focused and lean
- Allows users to accept defaults without configuration
- Supports Australian credit card patterns (CommBank, ANZ, Westpac, NAB)
- Extensible for future features (statement tracking, reminders)

**Configuration Fields**:

- Statement cycles (close day, frequency, due date offset)
- Interest-free periods (days, enabled/disabled)
- Payment rules (minimum percentage, floor amount)
- Notifications (reminder days before due)

**Defaults** (Australian CommBank Pattern):

```typescript
{
  statementCloseDayOfMonth: 15,
  statementFrequencyDays: 30,
  paymentDueDaysAfterClose: 21,
  interestFreeDays: 55,
  hasInterestFreePeriod: true,
  minimumPaymentPercentage: 2,
  minimumPaymentFloorCents: 2500, // $25 AUD
  reminderDaysBeforeDue: 3,
}
```

### 5. Settings Creation: Application Layer (MVP)

**Decision**: CardAccountService creates both CardAccount and CardAccountSettings in a transaction.

**Rationale**:

- Explicit control over settings initialization
- Easier to test and debug
- Can be replaced with database trigger post-MVP if needed
- Transactional integrity (both succeed or both fail)

**Implementation**:

```typescript
async createCardAccount(data: CardAccountData, settingsOverrides?: Partial<CardAccountSettingsData>) {
  // Start transaction
  const cardAccount = await cardAccountRepo.create(data);

  const settings = await cardAccountSettingsRepo.create({
    cardAccountId: cardAccount.id,
    ...DEFAULT_AUSTRALIAN_SETTINGS,
    ...settingsOverrides,
  });

  // Commit transaction
  return { cardAccount, settings };
}
```

## Task Breakdown (Updated)

### Entities (Tasks 1.1-1.4)

1. **Task 1.1**: CardAccount Entity (2-3 hrs)

   - Fields: name, issuer, last4, billingCycle, creditLimitCents, ownerId, isActive
   - Constructor factory
   - Dual schema (createSchema + schema)
   - 15+ tests

2. **Task 1.2**: CardAccountSettings Entity (3-4 hrs)

   - Fields: statement cycles, interest-free periods, payment rules, reminders
   - Business logic: calculateDueDate, isInInterestFreePeriod, calculateMinimumPayment
   - Australian defaults (CommBank, ANZ, Westpac, NAB presets)
   - 20+ tests

3. **Task 1.3**: Card Entity (2-3 hrs)

   - Fields: cardAccountId, memberId, nickname, last4, isActive
   - Optional entity for attribution
   - displayName getter helper
   - 15+ tests

4. **Task 1.4**: Update Transaction Entity (1-2 hrs)
   - Add cardAccountId (required)
   - Add cardId (optional)
   - Update all tests with new required field
   - 5+ new tests

### Database (Task 1.5)

5. **Task 1.5**: Create Database Tables (3-4 hrs)
   - card_accounts table with constraints
   - card_account_settings table (one-to-one with card_accounts)
   - cards table
   - Update transactions table (add cardAccountId, cardId)
   - Create "Legacy Account" for existing transactions
   - Rollback migration
   - Test on local database

### Backend (Tasks 1.6-1.10)

6. **Task 1.6**: Create Schema Files (3-4 hrs)

   - Drizzle schema definitions
   - Relations between tables
   - Type exports

7. **Task 1.7**: Create Repositories (4-5 hrs)

   - CardAccountRepository (CRUD + findByOwner)
   - CardAccountSettingsRepository (CRUD + findByCardAccountId)
   - CardRepository (CRUD + findByCardAccount, findByMember)
   - Tests for all repositories

8. **Task 1.8**: Create Services (4-5 hrs)

   - CardAccountService (create with settings, update, archive, canDelete check)
   - CardAccountSettingsService (update, reset to defaults)
   - CardService (create, update, archive)
   - Validation logic
   - Tests for all services

9. **Task 1.9**: Create Routes (5-6 hrs)

   - CardAccount routes (CRUD, list by owner)
   - CardAccountSettings routes (get, update, reset)
   - Card routes (CRUD, list by account/member)
   - Tests for all routes

10. **Task 1.10**: Update Transaction Routes (2-3 hrs)
    - Accept cardAccountId in create/update
    - Validate CardAccount exists
    - Optional Card validation
    - Update tests

### Final Tasks (1.11-1.12)

11. **Task 1.11**: Add Tests (5-7 hrs)

    - Comprehensive entity tests
    - Repository integration tests
    - Service business logic tests
    - Route API tests
    - Edge cases and error handling

12. **Task 1.12**: Update Exports (1 hr)
    - Add CardAccount to shared/entities/index.ts
    - Add CardAccountSettings to shared/entities/index.ts
    - Add Card to shared/entities/index.ts
    - Verify exports

**Total**: 12 tasks, ~35-47 hours (~5-7 days)

## Files to Create

### Entities

- `shared/entities/cardAccount.ts`
- `shared/entities/cardAccountSettings.ts`
- `shared/entities/card.ts`

### Tests (Entities)

- `shared/__tests__/entities/cardAccount.test.ts`
- `shared/__tests__/entities/cardAccountSettings.test.ts`
- `shared/__tests__/entities/card.test.ts`

### Database

- `backend/db/migrations/001_add_card_accounts_and_cards.sql`
- `backend/db/migrations/rollback/001_rollback_card_accounts_and_cards.sql`
- `backend/db/schema/tables/cardAccounts.ts`
- `backend/db/schema/tables/cardAccountSettings.ts`
- `backend/db/schema/tables/cards.ts`

### Repositories

- `backend/repositories/cardAccountRepository.ts`
- `backend/repositories/cardAccountSettingsRepository.ts`
- `backend/repositories/cardRepository.ts`

### Tests (Repositories)

- `backend/__tests__/repositories/cardAccountRepository.test.ts`
- `backend/__tests__/repositories/cardAccountSettingsRepository.test.ts`
- `backend/__tests__/repositories/cardRepository.test.ts`

### Services

- `backend/services/cardAccountService.ts`
- `backend/services/cardAccountSettingsService.ts`
- `backend/services/cardService.ts`

### Tests (Services)

- `backend/__tests__/services/cardAccountService.test.ts`
- `backend/__tests__/services/cardAccountSettingsService.test.ts`
- `backend/__tests__/services/cardService.test.ts`

### Routes

- `backend/routes/cardAccounts/create.ts`
- `backend/routes/cardAccounts/get.ts`
- `backend/routes/cardAccounts/update.ts`
- `backend/routes/cardAccounts/delete.ts`
- `backend/routes/cardAccounts/list.ts`
- `backend/routes/cardAccounts/index.ts`
- `backend/routes/cardAccounts/settings/get.ts`
- `backend/routes/cardAccounts/settings/update.ts`
- `backend/routes/cardAccounts/settings/reset.ts`
- `backend/routes/cardAccounts/settings/index.ts`
- `backend/routes/cards/create.ts`
- `backend/routes/cards/get.ts`
- `backend/routes/cards/update.ts`
- `backend/routes/cards/delete.ts`
- `backend/routes/cards/list.ts`
- `backend/routes/cards/index.ts`

### Tests (Routes)

- `backend/__tests__/routes/cardAccounts/create.test.ts`
- `backend/__tests__/routes/cardAccounts/get.test.ts`
- `backend/__tests__/routes/cardAccounts/update.test.ts`
- `backend/__tests__/routes/cardAccounts/delete.test.ts`
- `backend/__tests__/routes/cardAccounts/list.test.ts`
- `backend/__tests__/routes/cards/create.test.ts`
- `backend/__tests__/routes/cards/get.test.ts`
- `backend/__tests__/routes/cards/update.test.ts`
- `backend/__tests__/routes/cards/delete.test.ts`
- `backend/__tests__/routes/cards/list.test.ts`

**Total**: ~55 new files

## Files to Modify

### Entities

- `shared/entities/transaction.ts` - Add cardAccountId, cardId
- `shared/entities/index.ts` - Export new entities

### Tests (Entities)

- `shared/__tests__/entities/transaction.test.ts` - Add tests for new fields

### Database

- `backend/db/schema/tables/transactions.ts` - Add columns

### Repositories

- `backend/repositories/index.ts` - Export new repositories
- `backend/repositories/transactionRepository.ts` - Include new fields in queries

### Services

- `backend/services/index.ts` - Export new services
- `backend/services/transactionService.ts` - Validate CardAccount exists

### Routes

- `backend/routes/index.ts` - Mount new routes
- `backend/routes/transactions/*.ts` - Accept cardAccountId

### Dependency Injection

- `backend/di/repositories.ts` - Register new repositories
- `backend/di/services.ts` - Register new services
- `backend/di/routes.ts` - Register new routes

**Total**: ~15 modified files

## Success Criteria

### Entity Layer

- [x] CardAccount entity created with validation
- [x] CardAccountSettings entity created with business logic
- [x] Card entity created with helper methods
- [x] Transaction entity updated with cardAccountId/cardId
- [x] All entity tests pass (65+ tests total)
- [x] Entities exported from index.ts

### Database Layer

- [ ] Migration creates all tables successfully
- [ ] One-to-one constraint enforced (CardAccount ↔ CardAccountSettings)
- [ ] Foreign keys with correct ON DELETE actions
- [ ] Indexes created for common queries
- [ ] Legacy Account created for existing transactions
- [ ] Rollback migration works

### Repository Layer

- [ ] All repositories implement CRUD operations
- [ ] Custom queries (findByOwner, findByCardAccount, etc.)
- [ ] All repository tests pass

### Service Layer

- [ ] CardAccountService creates account with settings
- [ ] Settings can be updated independently
- [ ] Settings can be reset to defaults
- [ ] Validation logic prevents invalid states
- [ ] All service tests pass

### Route Layer

- [ ] All routes accept/return correct data
- [ ] Authentication/authorization enforced
- [ ] Error handling works correctly
- [ ] All route tests pass

### Integration

- [ ] Can create CardAccount via API (auto-creates settings)
- [ ] Can retrieve settings for CardAccount
- [ ] Can update settings
- [ ] Can create Card linked to CardAccount
- [ ] Can create Transaction with cardAccountId
- [ ] Dashboard displays CardAccount data

## Next Steps

1. **Immediate**: Begin Task 1.1 (Create CardAccount Entity)
2. **Day 1-2**: Complete Tasks 1.1-1.4 (All entities)
3. **Day 3**: Complete Task 1.5 (Database migration)
4. **Day 4**: Complete Tasks 1.6-1.7 (Schema and repositories)
5. **Day 5-6**: Complete Tasks 1.8-1.10 (Services and routes)
6. **Day 7**: Complete Tasks 1.11-1.12 (Tests and exports)

## Risk Mitigation

### Breaking Changes

- **Transaction entity**: All Transaction creation requires cardAccountId
- **Mitigation**: Update all tests in Phase 1 Task 1.11
- **Helper**: Create test utilities for generating test CardAccounts

### Database Migration

- **Risk**: Existing transactions have no CardAccount
- **Mitigation**: Create "Legacy Account" and assign all existing transactions
- **Rollback**: Full rollback migration provided

### Settings Management

- **Risk**: Settings not created when CardAccount is created
- **Mitigation**: Service layer enforces settings creation in transaction
- **Future**: Can add database trigger for additional safety

### Performance

- **Risk**: Additional joins for CardAccount data
- **Mitigation**: Indexes on foreign keys (owner_id, card_account_id, member_id)
- **Future**: Consider caching for frequently accessed CardAccounts

## Documentation Updates

- [x] Task 1.1 spec updated (constructor pattern, dual schema)
- [x] Task 1.2 spec created (CardAccountSettings)
- [x] Task 1.3 spec created (Card, renumbered)
- [x] Task 1.4 spec created (Update Transaction, renumbered)
- [x] Task 1.5 spec updated (Database tables including settings, renumbered)
- [x] Phase 1 README updated (new task breakdown, success criteria)
- [x] Implementation summary created (this document)

## Alignment with Product Spec

From `0. high level.md`:

> **CardAccounts** represent credit card accounts (issuer, name, last4, billing cycle, credit limit)
>
> **Cards** (optional) represent physical/virtual card numbers within an account

**Alignment**: ✅ Complete

> **Rules:**
>
> - Every transaction belongs to exactly one CardAccount
> - If only one CardAccount exists, it's selected by default
> - Cards are for attribution only; they don't affect splits or payments

**Alignment**: ✅ Complete

> CardAccounts with transactions cannot be deleted, archive instead

**Alignment**: ✅ Implemented via soft delete (isActive) and canDelete() checks

**Additional Features** (Approved by User):

- CardAccountSettings for Australian credit card configuration
- CommBank-style defaults (statement dates, interest-free periods, minimum payments)
- Business logic methods for date calculations and payment validation
- Preset configurations (CommBank, ANZ, Westpac, NAB)

**Status**: All specifications written, ready for implementation.
