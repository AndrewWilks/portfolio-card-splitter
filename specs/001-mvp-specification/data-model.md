# Data Model: Portfolio Card Splitter MVP

**Created**: 2025-10-17

## Overview

Normalised PostgreSQL schema designed for financial accuracy using integer cents, with comprehensive audit trail through append-only events. Supports multi-user expense sharing with pot-based money management and real-time collaboration.

## Entity Relationship Diagram

```text
Users (1) ──── (M) Members ──── (M) Allocations ──── (M) Transactions
                                                           │
                                                          (M)
                                                           │
                                               TransactionTags ──── (M) Tags
                                                           │
                                                          (M)
                                                           │
                                                       Merchants

Pots (1) ──── (M) Reservations ──── (M) Transactions
  │
 (M)
  │
Transfers ──── Payments ──── (M) Transactions
  │              │
 (1)            (1)
  │              │
Events ──────────┴─── captures all mutations
```

## Database Tables

### Core Identity

**users**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status user_status NOT NULL DEFAULT 'invited',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE user_status AS ENUM ('invited', 'active', 'archived');
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
```

**members**

```sql
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(255) NOT NULL,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_archived ON members(archived);
```

### Transaction Management

**merchants**

```sql
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  normalized_name VARCHAR(255) NOT NULL, -- for fuzzy matching
  merged_into_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_merchants_normalized_name ON merchants(normalized_name);
CREATE INDEX idx_merchants_merged_into ON merchants(merged_into_id);
```

**tags**

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  color VARCHAR(7) NOT NULL, -- hex color code #RRGGBB
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tags_name ON tags(name);
```

**transactions**

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_on DATE NOT NULL,
  merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_posted_on ON transactions(posted_on);
CREATE INDEX idx_transactions_merchant_id ON transactions(merchant_id);
CREATE INDEX idx_transactions_amount_cents ON transactions(amount_cents);
```

**transaction_tags**

```sql
CREATE TABLE transaction_tags (
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (transaction_id, tag_id)
);

CREATE INDEX idx_transaction_tags_tag_id ON transaction_tags(tag_id);
```

**allocations**

```sql
CREATE TABLE allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  share_type allocation_share_type NOT NULL,
  value INTEGER NOT NULL CHECK (value > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE allocation_share_type AS ENUM ('percent', 'amount');
CREATE INDEX idx_allocations_transaction_id ON allocations(transaction_id);
CREATE INDEX idx_allocations_member_id ON allocations(member_id);
```

### Money Management

**pots**

```sql
CREATE TABLE pots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  scope pot_scope NOT NULL,
  owner_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  account_type pot_account_type NOT NULL,
  institution VARCHAR(255),
  masked_account VARCHAR(20), -- e.g., "****1234"
  physical_location VARCHAR(255),
  visibility_acl JSONB NOT NULL DEFAULT '{}', -- {member_id: "read"|"manage"}
  balance_cents BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE pot_scope AS ENUM ('solo', 'shared');
CREATE TYPE pot_account_type AS ENUM ('savings', 'loan', 'cash', 'other');
CREATE INDEX idx_pots_owner_member_id ON pots(owner_member_id);
CREATE INDEX idx_pots_scope ON pots(scope);
```

**reservations**

```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pot_id UUID NOT NULL REFERENCES pots(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  created_on TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(pot_id, transaction_id)
);

CREATE INDEX idx_reservations_pot_id ON reservations(pot_id);
CREATE INDEX idx_reservations_transaction_id ON reservations(transaction_id);
```

**transfers**

```sql
CREATE TABLE transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_pot_id UUID REFERENCES pots(id) ON DELETE RESTRICT, -- NULL for cash
  to_pot_id UUID REFERENCES pots(id) ON DELETE RESTRICT,   -- NULL for cash
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  occurred_on DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (from_pot_id IS NOT NULL OR to_pot_id IS NOT NULL) -- at least one pot
);

CREATE INDEX idx_transfers_from_pot_id ON transfers(from_pot_id);
CREATE INDEX idx_transfers_to_pot_id ON transfers(to_pot_id);
CREATE INDEX idx_transfers_occurred_on ON transfers(occurred_on);
```

**payments**

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pot_id UUID NOT NULL REFERENCES pots(id) ON DELETE RESTRICT,
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  paid_on DATE NOT NULL,
  note TEXT,
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_pot_id ON payments(pot_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_reservation_id ON payments(reservation_id);
```

### Audit and Events

**events**

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(100) NOT NULL,
  actor_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_entity_type_id ON events(entity_type, entity_id);
CREATE INDEX idx_events_actor_user_id ON events(actor_user_id);
CREATE INDEX idx_events_created_at ON events(created_at);
CREATE INDEX idx_events_type ON events(type);
```

## Business Rule Invariants

### Allocation Constraints

**Rule**: Allocations must sum to transaction total

```sql
-- Enforced by application logic, verified by domain tests
-- For percent allocations: SUM(value) = 100
-- For amount allocations: SUM(value * amount_cents / 100) = amount_cents
```

**Rule**: Mixed allocation types prohibited per transaction

```sql
-- Enforced by application logic:
-- All allocations for a transaction must have same share_type
```

### Pot and Reservation Constraints

**Rule**: Reservations cannot exceed transaction amount

```sql
ALTER TABLE reservations ADD CONSTRAINT check_reservation_amount
CHECK (amount_cents <= (
  SELECT amount_cents FROM transactions
  WHERE id = reservation.transaction_id
));
```

**Rule**: Reservations cannot exceed pot available balance

```sql
-- Enforced by application logic:
-- reservation.amount_cents <= pot.balance_cents - SUM(existing_reservations)
```

### Transfer Constraints

**Rule**: Transfers require sufficient source balance

```sql
-- Enforced by application logic:
-- transfer.amount_cents <= from_pot.balance_cents
```

**Rule**: Payment amounts respect reservation and pot limits

```sql
-- Enforced by application logic:
-- If linked to reservation: payment.amount_cents <= reservation.amount_cents
-- Otherwise: payment.amount_cents <= pot.balance_cents
```

## Derived Views and Calculations

### Member Balance Ledger

```sql
CREATE VIEW member_balances AS
WITH allocation_totals AS (
  SELECT
    a.member_id,
    SUM(
      CASE
        WHEN a.share_type = 'percent' THEN (t.amount_cents * a.value) / 100
        WHEN a.share_type = 'amount' THEN a.value
      END
    ) as total_allocated_cents
  FROM allocations a
  JOIN transactions t ON a.transaction_id = t.id
  GROUP BY a.member_id
),
payment_totals AS (
  SELECT
    m.id as member_id,
    COALESCE(SUM(p.amount_cents), 0) as total_paid_cents
  FROM members m
  LEFT JOIN pots pot ON pot.owner_member_id = m.id
  LEFT JOIN payments p ON p.pot_id = pot.id
  GROUP BY m.id
)
SELECT
  m.id,
  m.display_name,
  COALESCE(at.total_allocated_cents, 0) as allocated_cents,
  COALESCE(pt.total_paid_cents, 0) as paid_cents,
  COALESCE(at.total_allocated_cents, 0) - COALESCE(pt.total_paid_cents, 0) as net_balance_cents
FROM members m
LEFT JOIN allocation_totals at ON m.id = at.member_id
LEFT JOIN payment_totals pt ON m.id = pt.member_id
WHERE m.archived = FALSE;
```

### Pot Available Balances

```sql
CREATE VIEW pot_available_balances AS
SELECT
  p.id,
  p.name,
  p.balance_cents,
  COALESCE(SUM(r.amount_cents), 0) as reserved_cents,
  p.balance_cents - COALESCE(SUM(r.amount_cents), 0) as available_cents
FROM pots p
LEFT JOIN reservations r ON p.id = r.pot_id
GROUP BY p.id, p.name, p.balance_cents;
```

## Migration Strategy

### Phase 1: Core Schema

1. Create base tables: users, members, merchants, tags
2. Create transaction and allocation tables
3. Implement basic constraints and indexes

### Phase 2: Money Management

1. Create pots, reservations, transfers, payments tables
2. Add balance tracking and constraints
3. Implement pot visibility ACL structure

### Phase 3: Audit Infrastructure

1. Create events table with proper indexing
2. Add event emission triggers (application-level)
3. Implement real-time notification system

### Data Integrity Checks

**Deployment Validation**

- Verify all foreign key constraints are properly enforced
- Test allocation sum validation in application layer
- Validate pot balance calculations with reserved amounts
- Confirm event emission for all mutation operations

**Performance Considerations**

- Index on transaction posted_on for date-range queries
- Index on events created_at for audit pagination
- Composite indexes on allocation transaction_id and member_id
- Consider partitioning events table for large datasets

This data model provides a solid foundation for financial accuracy, audit trail completeness, and real-time collaboration while maintaining referential integrity and supporting the application's business rules.
