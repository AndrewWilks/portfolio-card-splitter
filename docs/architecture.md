# Portfolio Card Splitter - Architecture Documentation

## Overview

Portfolio Card Splitter is a web application for managing shared expenses and
payments among groups. This document describes the system architecture following
Clean Architecture principles.

## Technology Stack

### Backend

- **Runtime**: Deno 1.x (JavaScript/TypeScript runtime)
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

```Text
main (protected)
├── feature/sprint-1-merchants-tags
├── feature/sprint-2-members-users
└── feature/sprint-3-payments
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
