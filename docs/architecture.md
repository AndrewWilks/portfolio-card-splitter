# Portfolio Card Splitter - Architecture Documentation

## Overview

Portfolio Card Splitter is a web application for managing shared expenses and
payments among groups. This document describes the system architecture following
Clean Architecture principles.

## Technology Stack

### Backend

- **Runtime**: Deno 2.5.x (JavaScript/TypeScript runtime)
- **Web Framework**: Hono (lightweight web framework for APIs)
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM (type-safe SQL query builder)
- **Validation**: Zod (TypeScript-first schema validation)
- **Testing**: Deno's built-in test runner

### Frontend

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS modules with Tailwind CSS

### Development Tools

- **Version Control**: Git with GitHub
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint, Prettier
- **Containerization**: Docker (planned)

## Architecture Principles

The system follows **Clean Architecture** principles with clear separation of
concerns:

1. **Entities**: Core business objects with validation and business rules
2. **Repositories**: Data access layer abstracting database operations
3. **Services**: Business logic layer orchestrating operations
4. **Routes**: HTTP API endpoints handling requests/responses
5. **Shared**: Common code shared between backend and frontend

### Dependency Direction

```Text
Routes → Services → Repositories → Entities
    ↓         ↓         ↓         ↓
  Shared ← Shared ← Shared ← Shared
```

## Project Structure

```Text
portfolio-card-splitter-v2/
├── backend/                 # Backend application
│   ├── __tests__/          # Unit tests
│   │   ├── repositories/   # Repository tests
│   │   ├── services/       # Service tests
│   │   └── db/            # Database integration tests
│   ├── repositories/       # Data access layer
│   ├── services/          # Business logic layer
│   ├── routes/            # HTTP API routes
│   ├── config.ts          # Configuration
│   ├── main.ts            # Application entry point
│   └── deno.json          # Deno configuration
├── frontend/               # Frontend application
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   └── package.json       # Node.js dependencies
├── shared/                 # Shared code
│   ├── entities/          # Domain entities
│   ├── services/          # Shared service interfaces
│   ├── repositories/      # Repository interfaces
│   └── db/                # Database schema and client
├── specs/                 # Specifications and requirements
├── docs/                  # Documentation
└── .github/               # GitHub Actions workflows
```

## Core Components

### Entities

Entities represent the core business objects with built-in validation and
factory methods.

#### Merchant Entity

```typescript
class Merchant {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly location?: string,
    public readonly mergedIntoId?: string,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(data): Merchant; // Factory method with validation
  static from(data): Merchant; // Reconstruct from persisted data
  toJSON(): MerchantData; // Serialize for API responses
}
```

#### Tag Entity

```typescript
class Tag {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly color: string = "#3b82f6",
    public readonly isActive: boolean = true,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(data): Tag; // Factory method with validation
  static from(data): Tag; // Reconstruct from persisted data
  toJSON(): TagData; // Serialize for API responses
}
```

#### Member Entity

```typescript
class Member {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly role: "admin" | "member" = "member",
    public readonly isActive: boolean = true,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(data): Member; // Factory method with validation
  static from(data): Member; // Reconstruct from persisted data
  toJSON(): MemberData; // Serialize for API responses
}
```

#### Transaction Entity

```typescript
class Transaction {
  constructor(
    public readonly id: string,
    public readonly merchantId: string,
    public readonly description: string,
    public readonly amountCents: number,
    public readonly type: "expense" | "income",
    public readonly transactionDate: Date,
    public readonly createdById: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(data): Transaction; // Factory method with validation
  static from(data): Transaction; // Reconstruct from persisted data
  toJSON(): TransactionData; // Serialize for API responses
}
```

#### Allocation Entity

```typescript
class Allocation {
  constructor(
    public readonly id: string,
    public readonly transactionId: string,
    public readonly memberId: string,
    public readonly rule: "percentage" | "fixed_amount",
    public readonly percentage?: number, // Basis points (5000 = 50%)
    public readonly amountCents?: number,
    public readonly calculatedAmountCents: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(data): Allocation; // Factory method with validation
  static from(data): Allocation; // Reconstruct from persisted data
  toJSON(): AllocationData; // Serialize for API responses
}
```

#### Pot Entity

```typescript
class Pot {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description?: string,
    public readonly type: "solo" | "shared",
    public readonly location?: string,
    public readonly ownerId: string,
    public readonly balanceCents: number = 0,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(data): Pot; // Factory method with validation
  static from(data): Pot; // Reconstruct from persisted data
  toJSON(): PotData; // Serialize for API responses
}
```

### Repositories

Repositories handle data persistence using Drizzle ORM with type-safe queries.

#### MerchantRepository

```typescript
class MerchantRepository {
  async save(merchant: Merchant): Promise<void>;
  async findById(id: string): Promise<Merchant | null>;
  async findByName(name: string): Promise<Merchant | null>;
  async findAll(): Promise<Merchant[]>;
}
```

#### TagRepository

```typescript
class TagRepository {
  async save(tag: Tag): Promise<void>;
  async findById(id: string): Promise<Tag | null>;
  async findAll(): Promise<Tag[]>;
  async findByName(name: string): Promise<Tag | null>;
}
```

#### MemberRepository

```typescript
class MemberRepository {
  async save(member: Member): Promise<void>;
  async findById(id: string): Promise<Member | null>;
  async findAll(): Promise<Member[]>;
  async findByEmail(email: string): Promise<Member | null>;
}
```

#### TransactionRepository

```typescript
class TransactionRepository {
  async save(transaction: Transaction): Promise<void>;
  async findById(id: string): Promise<Transaction | null>;
  async findByQuery(query: TransactionQuery): Promise<Transaction[]>;
  async updateAllocations(id: string, allocations: Allocation[]): Promise<void>;
}
```

#### PotRepository

```typescript
class PotRepository {
  async save(pot: Pot): Promise<void>;
  async findById(id: string): Promise<Pot | null>;
  async findByOwner(ownerId: string): Promise<Pot[]>;
  async updateBalance(id: string, amount: number): Promise<void>;
  async findAvailableBalances(): Promise<Record<string, number>>;
}
```

### Services

Services contain business logic and orchestrate operations between repositories.

#### MerchantService

```typescript
class MerchantService {
  constructor(
    protected merchantRepository: MerchantRepository,
    protected tagRepository: TagRepository
  ) {}

  async createMerchant(request): Promise<Merchant>;
  async updateMerchant(id, request): Promise<Merchant>;
  async listMerchants(query): Promise<Merchant[]>;
  async createTag(request): Promise<Tag>;
  async updateTag(id, request): Promise<Tag>;
  async listTags(): Promise<Tag[]>;
}
```

#### MemberService

```typescript
class MemberService {
  constructor(protected memberRepository: MemberRepository) {}

  async createMember(request): Promise<Member>;
  async updateMember(id, request): Promise<Member>;
  async listMembers(): Promise<Member[]>;
  async getMember(id): Promise<Member>;
}
```

#### TransactionService

```typescript
class TransactionService {
  constructor(
    protected transactionRepository: TransactionRepository,
    protected merchantRepository: MerchantRepository
  ) {}

  async createTransaction(request): Promise<Transaction>;
  async updateTransaction(id, request): Promise<Transaction>;
  async listTransactions(query): Promise<Transaction[]>;
  async getTransaction(id): Promise<Transaction>;
}
```

#### PotService

```typescript
class PotService {
  constructor(protected potRepository: PotRepository) {}

  async createPot(request): Promise<Pot>;
  async updatePot(id, request): Promise<Pot>;
  async listPots(query): Promise<Pot[]>;
  async deposit(id, request): Promise<void>;
}
```

### Routes

HTTP API routes handle requests, validate input, and return responses.

#### Route Structure

```typescript
// merchants/api_merchants_list.ts
export default (service: MerchantService) =>
  HonoApp.get("/api/merchants", async (c) => {
    const merchants = await service.listMerchants({});
    return c.json({ merchants });
  });
```

## Database Schema

### Merchants Table

```sql
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  location VARCHAR(255),
  merged_into_id UUID REFERENCES merchants(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tags Table

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  color CHAR(7) DEFAULT '#3b82f6' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Members Table

```sql
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Transactions Table

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  description VARCHAR(500) NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  type VARCHAR(50) NOT NULL CHECK (type IN ('expense', 'income')),
  transaction_date DATE NOT NULL,
  created_by_id UUID NOT NULL REFERENCES members(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Allocations Table

```sql
CREATE TABLE allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id),
  rule VARCHAR(50) NOT NULL CHECK (rule IN ('percentage', 'fixed_amount')),
  percentage INTEGER CHECK (percentage >= 0 AND percentage <= 10000),
  amount_cents INTEGER CHECK (amount_cents >= 0),
  calculated_amount_cents INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CHECK (
    (rule = 'percentage' AND percentage IS NOT NULL AND amount_cents IS NULL) OR
    (rule = 'fixed_amount' AND amount_cents IS NOT NULL AND percentage IS NULL)
  )
);
```

### Pots Table

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

## API Design

### RESTful Endpoints

#### Merchants

- `GET /api/merchants` - List all merchants
- `POST /api/merchants` - Create a new merchant
- `PATCH /api/merchants/:id` - Update a merchant

#### Tags

- `GET /api/tags` - List all tags
- `POST /api/tags` - Create a new tag
- `PATCH /api/tags/:id` - Update a tag

#### Members

- `GET /api/people` - List all members
- `POST /api/people` - Create a new member
- `PATCH /api/people/:id` - Update a member

#### Transactions

- `GET /api/transactions` - List transactions with filtering
- `POST /api/transactions` - Create a transaction with allocations
- `PATCH /api/transactions/:id` - Update a transaction and allocations

#### Pots

- `GET /api/pots` - List pots for an owner
- `POST /api/pots` - Create a new pot
- `PATCH /api/pots/:id` - Update a pot
- `POST /api/pots/:id/deposit` - Deposit funds to a pot

### Request/Response Format

All API responses follow a consistent JSON structure:

```json
{
  "merchants": [
    {
      "id": "uuid",
      "name": "Merchant Name",
      "location": "Location",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "tags": [
    {
      "id": "uuid",
      "name": "Tag Name",
      "color": "#3b82f6",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "members": [
    {
      "id": "uuid",
      "name": "Member Name",
      "email": "member@example.com",
      "role": "member",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "transactions": [
    {
      "id": "uuid",
      "merchantId": "uuid",
      "description": "Coffee purchase",
      "amountCents": 550,
      "type": "expense",
      "transactionDate": "2025-01-01",
      "createdById": "uuid",
      "allocations": [
        {
          "id": "uuid",
          "memberId": "uuid",
          "rule": "percentage",
          "percentage": 5000,
          "calculatedAmountCents": 275
        }
      ],
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pots": [
    {
      "id": "uuid",
      "name": "Credit Card Payback",
      "description": "Funds for paying off credit card",
      "type": "solo",
      "location": "Bank Account",
      "ownerId": "uuid",
      "balanceCents": 15000,
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### Error Handling

Errors return appropriate HTTP status codes with error messages:

```json
{
  "error": "Merchant with name 'Test' already exists"
}
```

## Testing Strategy

### Unit Tests

- **Entities**: Test factory methods and validation
- **Repositories**: Test database operations with mock data
- **Services**: Test business logic with mock repositories
- **Routes**: Test HTTP endpoints with mock services

### Test Structure

```typescript
Deno.test("MerchantService - createMerchant validates input", async () => {
  const service = new MerchantService(mockRepo, mockTagRepo);
  // Test validation logic
});
```

### Mock Implementation

Tests use mock repositories to isolate business logic:

```typescript
class MockMerchantRepository extends MerchantRepository {
  private merchants: Merchant[] = [];
  // Mock implementations...
}
```

## Development Workflow

### Sprint-Based Development

1. **Planning**: Define sprint scope and acceptance criteria
2. **Implementation**: Follow TDD (Test → Code → Refactor)
3. **Testing**: Ensure all tests pass and code is linted
4. **Review**: Create PR and get feedback
5. **Merge**: Deploy and move to next sprint

### Code Quality

- **Linting**: ESLint with Deno rules
- **Formatting**: Prettier for consistent code style
- **Type Safety**: Strict TypeScript configuration
- **Testing**: 100% test coverage for business logic

### Git Workflow

```text
master (protected)
├── feature/merchants-tags-foundation (Sprint 1 - ✅ Completed)
├── feature/people-members-management (Sprint 2 - ✅ Completed)
├── feature/transactions-management (Sprint 3 - ✅ Completed)
└── feature/pots-management (Sprint 4 - ✅ Completed)
```

## Deployment

### Environment Configuration

- **Development**: Local PostgreSQL with .env file
- **Staging**: Docker container with test database
- **Production**: Managed PostgreSQL with environment variables

### CI/CD Pipeline

- **Lint**: Check code quality
- **Test**: Run unit tests
- **Build**: Create deployable artifacts
- **Deploy**: Automated deployment to staging/production

## Future Considerations

### Scalability

- Database connection pooling
- Caching layer (Redis)
- Horizontal scaling with load balancer

### Security

- Authentication and authorization
- Input sanitization and validation
- Rate limiting and CORS

### Monitoring

- Application logging
- Error tracking
- Performance monitoring

---

This architecture provides a solid foundation for building a scalable,
maintainable expense management application following industry best practices.
