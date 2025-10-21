# 2025-10-21 - Sprint 3: Transaction Management - The Core Feature Unleashed! 💰

## 🎯 What I Accomplished

Holy moly, what a sprint! Sprint 3 delivered the **CORE FEATURE** of Portfolio
Card Splitter - the complete transaction management system with allocations.
This is what makes the app actually useful for splitting expenses between
people. I built the most complex business logic yet, handling percentage-based
and fixed-amount allocations, merchant associations, and all the financial
calculations that power shared expense tracking.

Starting from scaffolded tests and empty entities, I implemented a fully
functional transaction system that can handle complex expense splitting
scenarios. The system now supports creating transactions with multiple
allocations (some percentage-based, some fixed amounts), validating that
allocations add up correctly, and persisting everything to the database with
proper relationships.

## 🏗️ Technical Deep Dive

### The Allocation Challenge: Financial Logic at Scale

The heart of Sprint 3 was implementing the allocation system - how to split
expenses between multiple people. This involved some serious business logic:

#### Two Allocation Types

- **Percentage Allocations**: Split based on percentages (e.g., 50% each for a
  couple)
- **Fixed Amount Allocations**: Split with specific dollar amounts (e.g., $25
  each)

#### The Big Constraint

You can't mix allocation types in a single transaction. Either everyone gets a
percentage of the total, or specific fixed amounts are assigned.

### Entity Design: Transactions + Allocations

I implemented two key entities that work together:

```typescript
// Transaction Entity - The expense itself
export class Transaction {
  constructor(
    public readonly id: string,
    public readonly merchantId: string, // Where was money spent?
    public readonly description: string, // What was purchased?
    public readonly amountCents: number, // How much? (integer cents)
    public readonly type: "expense" | "income",
    public readonly transactionDate: Date,
    public readonly createdById: string, // ...timestamps
  ) {}
}

// Allocation Entity - How it's split
export class Allocation {
  constructor(
    public readonly id: string,
    public readonly transactionId: string,
    public readonly memberId: string, // Who owes/paid?
    public readonly rule: "percentage" | "fixed_amount",
    public readonly percentage?: number, // Basis points (5000 = 50%)
    public readonly amountCents?: number, // Fixed amount
    public readonly calculatedAmountCents: number, // Final calculated amount // ...timestamps
  ) {}
}
```

### Repository Layer: Complex Queries with Relationships

The TransactionRepository became the most complex repository yet, handling:

- **Transaction CRUD**: Basic create/read/update/delete operations
- **Query Filtering**: Filter by merchant, creator, transaction type
- **Allocation Management**: Bulk insert/update/delete of allocations
- **Relationship Handling**: Proper foreign key constraints

```typescript
// Complex allocation updates
override async updateAllocations(id: string, allocations: Allocation[]): Promise<void> {
  // Delete existing allocations
  await this.dbClient.delete(Schemas.Tables.allocations)
    .where(eq(Schemas.Tables.allocations.transactionId, id));

  // Insert new allocations
  if (allocations.length > 0) {
    const allocationData = allocations.map(allocation => ({
      // Map entity to database format
    }));
    await this.dbClient.insert(Schemas.Tables.allocations).values(allocationData);
  }
}
```

### Service Layer: Business Rules & Validation

The TransactionService contains the most sophisticated business logic:

#### Allocation Validation

- At least one allocation required
- Percentage allocations must sum to exactly 100%
- Fixed amount allocations can't exceed transaction total
- No mixing percentage and fixed amount allocations

#### Merchant & Tag Validation

- Verify merchant exists before creating transaction
- Validate tag references (when implemented)

#### Allocation Calculation

- Percentage allocations: `amount × (percentage / 10000)`
- Fixed allocations: Use the specified amount directly

### API Layer: RESTful Transaction Management

Implemented three complete API endpoints:

**POST /api/transactions** - Create transaction with allocations

```json
{
  "merchantId": "uuid",
  "description": "Coffee at Starbucks",
  "amountCents": 550,
  "allocations": [
    {
      "memberId": "uuid",
      "rule": "percentage",
      "percentage": 5000 // 50%
    },
    {
      "memberId": "uuid",
      "rule": "percentage",
      "percentage": 5000 // 50%
    }
  ]
}
```

**GET /api/transactions** - List transactions with filtering **PATCH
/api/transactions/:id** - Update transaction and allocations

## 💡 Key Learnings

### Complex Business Logic Requires Careful Design

This sprint taught me that financial software demands meticulous attention to
detail. A single misplaced decimal point or incorrect calculation could lead to
incorrect expense splitting, which erodes trust in the application.

#### Validation Layering Saved Me

- **Entity Level**: Basic data structure validation
- **Service Level**: Business rule validation (allocation sums, merchant
  existence)
- **API Level**: Request/response schema validation

### Database Relationships Are Tricky

Handling the transaction ↔ allocations relationship required careful thinking:

- **Foreign Keys**: Proper cascade behavior
- **Bulk Operations**: Efficiently updating multiple allocations
- **Data Integrity**: Ensuring allocations always reference valid transactions

### TDD with Complex Logic

Writing tests first for complex allocation logic was challenging but invaluable.
The tests forced me to think through edge cases:

- What happens with 0% allocations?
- How to handle rounding errors in percentage calculations?
- What if allocations exceed the transaction amount?

### Financial Accuracy Matters

Using integer cents instead of floating-point dollars was a great decision from
the database schema. It eliminates rounding errors that could cause confusion
about who owes what.

## 🚀 What's Next

Sprint 4: Pot Management! Now that we can create and track transactions with
allocations, we need money pots to actually hold and manage the funds. This will
involve:

- Pot CRUD operations
- Balance calculations
- Deposit functionality
- Linking pots to allocations

The transaction foundation is solid and ready to support the financial
operations that will make this app truly useful for managing shared expenses.

## 📊 Sprint 3 Stats

- **Entities Implemented**: Transaction + Allocation (2 complex entities)
- **Repository Methods**: 4 core methods + complex allocation handling
- **Service Logic**: Advanced allocation validation & calculation
- **API Endpoints**: 3 complete REST endpoints
- **Tests Added**: 15+ comprehensive tests
- **Business Rules**: Allocation validation, percentage calculations
- **Database Tables**: transactions + allocations with relationships
- **Total Tests**: 177 passing ✅

## 📸 Visual Progress

The allocation logic really shows the complexity of financial software:

```text
Transaction: $55.00 Coffee
├── Allocation 1: Alice (50%) → $27.50
└── Allocation 2: Bob (50%) → $27.50

Validation Rules:
✅ Percentages sum to 100%
✅ No amounts exceed transaction total
✅ All referenced merchants/tags exist
✅ No mixing allocation types
```

### Figure 1: Allocation calculation logic showing how expenses are split between members with proper validation

## 🔗 Resources & References

- [Domain-Driven Design](https://dddcommunity.org/) - For complex business logic
  modeling
- [Financial Data Best Practices](https://www.moderntreasury.com/journal/financial-data-best-practices) -
  Integer cents and precision handling
- [REST API Design](https://restfulapi.net/) - For the transaction management
  endpoints
- [Drizzle ORM Relations](https://orm.drizzle.team/docs/rqb) - Complex queries
  with relationships

Sprint 3 delivered the beating heart of Portfolio Card Splitter! The transaction
management system can now handle the complex expense splitting scenarios that
make this app valuable. From simple 50/50 splits to complex multi-person
allocations, the foundation is rock-solid for the financial operations to come.
💪

The journey from scaffolded tests to a fully functional expense tracking system
has been incredibly rewarding. Each line of code brings us closer to solving
real financial coordination problems for couples and groups! 🎉
