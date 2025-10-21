# 2025-10-21 - Sprint 4: Pot Account Management - Money Buckets for Credit Card Payback! 🏦

## 🎯 What I Accomplished

Sprint 4 brought **MONEY MANAGEMENT** to Portfolio Card Splitter! I implemented
a complete pot account system that serves as financial buckets for storing
allocated funds, specifically designed for credit card payback scenarios. These
aren't just generic containers - they're purpose-built money accounts that track
balances and enable users to deposit funds for paying off credit card
transactions.

The sprint delivered a fully functional account management system with CRUD
operations, balance tracking, deposit functionality, and comprehensive
validation. Users can now create solo or shared pots, deposit funds, and track
balances - perfect for the "save up to pay off credit card" use case that
inspired this feature.

## 🏗️ Technical Deep Dive

### The Money Account Concept: Beyond Simple Containers

Early in the sprint, I had a crucial realization - pots aren't just generic
containers for grouping transactions. They're **money accounts** specifically
designed for credit card payback tracking. This shifted my entire approach:

- **Balance Tracking**: Direct balance storage instead of calculating from
  transactions
- **Deposit Operations**: Explicit fund addition with validation
- **Account Management**: Full CRUD with ownership and activity status
- **Credit Card Focus**: Designed for the "save allocated money to pay off
  cards" workflow

### Entity Design: Financial Account Structure

The Pot entity represents a money account with all necessary financial tracking:

```typescript
export class Pot {
  constructor(
    public readonly id: string,
    public readonly name: string, // Account name (e.g., "Credit Card Payback")
    public readonly description?: string, // Optional description
    public readonly type: "solo" | "shared", // Ownership model
    public readonly location?: string, // Where funds are stored
    public readonly ownerId: string, // Account owner
    public readonly balanceCents: number = 0, // Current balance (integer cents)
    public readonly isActive: boolean = true, // Account status
  ) // ...timestamps
  {}
}
```

### Database Schema: Balance-First Design

Unlike the transaction system that calculates allocations, pots store balance
directly:

```sql
CREATE TABLE pots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  type VARCHAR(50) NOT NULL CHECK (type IN ('solo', 'shared')),
  location VARCHAR(200),
  owner_id UUID NOT NULL REFERENCES members(id),
  balance_cents BIGINT NOT NULL DEFAULT 0 CHECK (balance_cents >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Repository Layer: Account Operations

The PotRepository handles all account management operations:

```typescript
class PotRepository {
  async save(pot: Pot): Promise<void>; // Create/update account
  async findById(id: string): Promise<Pot | null>; // Get account details
  async findByOwner(ownerId: string): Promise<Pot[]>; // List user's accounts
  async updateBalance(id: string, amount: number): Promise<void>; // Update balance
  async findAvailableBalances(): Promise<Record<string, number>>; // Get all balances
}
```

### Service Layer: Business Rules & Validation

The PotService enforces financial integrity and business rules:

### Account Creation & Validation

- Required fields validation (name, owner, type)
- Balance initialization to zero
- Type constraints (solo/shared)

### Deposit Operations

- Positive amount validation
- Active account checks
- Balance updates with integrity

### Ownership & Access Control

- Owner-based filtering for account access
- Proper error handling for unauthorized operations

### API Design: RESTful Account Management

Complete REST API for account operations:

```typescript
// List accounts
GET /api/pots?ownerId=<uuid>

// Create account
POST /api/pots
{
  "name": "Credit Card Payback",
  "type": "solo",
  "ownerId": "<uuid>"
}

// Update account
PATCH /api/pots/<id>
{
  "name": "Updated Name",
  "isActive": false
}

// Deposit funds
POST /api/pots/<id>/deposit
{
  "amountCents": 5000
}
```

## 💡 Key Learnings

### Financial Data Integrity

Working with money taught me the importance of:

- **Integer Precision**: Using cents to avoid floating-point errors
- **Non-negative Balances**: Database constraints prevent invalid states
- **Atomic Operations**: Balance updates must be consistent

### Business Logic vs. Data Logic

The pot system clarified the distinction between:

- **Business Rules**: "Can only deposit to active accounts" (service layer)
- **Data Integrity**: "Balance cannot be negative" (database constraints)
- **Validation**: "Amount must be positive" (entity/schema level)

### Account Ownership Models

Designing for both solo and shared accounts required thinking about:

- **Access Patterns**: Owner-based filtering
- **Future Extensibility**: Shared account permissions
- **Data Relationships**: Foreign key constraints

## 🚀 What's Next

With Sprint 4 complete, Portfolio Card Splitter now has all core financial
primitives:

- ✅ Merchants & Tags (foundation)
- ✅ People & Members (users)
- ✅ Transactions & Allocations (expense splitting)
- ✅ Pots & Balances (money management)

The system can now handle the complete credit card payback workflow:

1. Create shared expense transactions
2. Allocate costs between members
3. Members deposit funds into pots
4. Use pot balances to pay off credit cards

Future sprints could add:

- **Transfer System**: Move money between pots
- **Payment Integration**: Link pots to actual credit card payments
- **Reporting**: Balance history and spending analytics
- **Frontend**: React UI for all these features

## 📸 Visual Progress

_Architecture diagram updated with pot account entities, repositories, services,
and API endpoints_

_Database schema expanded with pots table including balance tracking_

_Test coverage increased to 200+ tests including comprehensive pot account
validation_

## 🔗 Resources & References

- [Drizzle ORM Documentation](https://orm.drizzle.team/) - Type-safe SQL queries
- [Zod Schema Validation](https://zod.dev/) - Runtime type checking
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) -
  System design principles
- [REST API Design](https://restfulapi.net/) - HTTP API best practices
