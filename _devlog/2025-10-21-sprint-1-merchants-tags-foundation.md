# 2025-10-21 - Sprint 1: Merchants & Tags Foundation - Building the Cornerstones 🏗️

## 🎯 What I Accomplished

Oh man, what a foundational sprint this was! Sprint 1 wasn't about flashy
features or complex business logic - it was about laying the groundwork that
everything else would build upon. I established the TDD (Test-Driven
Development) patterns, implemented the Merchants and Tags entities, and created
the architectural foundation that would support the entire Portfolio Card
Splitter application.

Coming off the project scaffolding phase where I had 258 empty test files
staring at me, Sprint 1 was my first real implementation sprint. I went from red
failing tests to green passing ones, building out the complete CRUD operations
for both Merchants (where you spent money) and Tags (how you categorize
expenses). It felt like constructing the foundation of a house - not glamorous,
but absolutely essential.

The sprint delivered a fully functional Merchants & Tags management system with
proper validation, database persistence, and API endpoints. More importantly, it
established the development rhythm and architectural patterns that would carry
through the entire project.

## 🏗️ Technical Deep Dive

### Clean Architecture: From Theory to Practice

Remember that layered architecture I talked about in the scaffolding devlog?
Sprint 1 was where I actually built it out. I implemented the four-layer
architecture for both Merchants and Tags:

```
Routes (API Layer)
    ↓
Services (Business Logic)
    ↓
Repositories (Data Access)
    ↓
Entities (Core Business Rules)
```

**Why this matters for financial software**: When you're dealing with money and
shared expenses, you need bulletproof separation of concerns. The API layer
handles HTTP requests, the service layer contains business rules (like
preventing duplicate merchant names), the repository layer manages database
operations, and the entity layer encapsulates the core business logic.

### TDD: Red, Green, Refactor - The Development Dance

This was my first real TDD experience at scale. I started with failing tests
(red), wrote minimal code to make them pass (green), then cleaned up the
implementation (refactor). It felt awkward at first - writing tests for code
that doesn't exist yet? But wow, did it pay off.

Take the Merchant entity creation test:

```typescript
Deno.test("Merchant - can be created with required fields", () => {
  const merchant = Merchant.create({
    name: "Starbucks",
    isActive: true,
  });

  assert(merchant.id.length > 0);
  assert(merchant.name === "Starbucks");
  assert(merchant.isActive === true);
});
```

This test drove me to implement the `Merchant.create()` factory method with
proper validation. No more guessing what the API should look like - the tests
told me exactly what I needed to build.

### Drizzle ORM: Type-Safe Database Operations

I chose Drizzle ORM for its TypeScript-first approach, and Sprint 1 proved it
was the right choice. The type safety caught so many potential bugs before they
could happen.

```typescript
override async save(merchant: Merchant): Promise<void> {
  const data = merchant.toJSON();
  await this.dbClient
    .insert(Schemas.Tables.merchants)
    .values({
      id: data.id,
      name: data.name,
      location: data.location || null,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })
    .onConflictDoUpdate({
      target: Schemas.Tables.merchants.id,
      set: {
        name: data.name,
        location: data.location || null,
        isActive: data.isActive,
        updatedAt: data.updatedAt,
      },
    });
}
```

The `onConflictDoUpdate` pattern handles both inserts and updates elegantly - no
more manual existence checks or separate update logic.

### Zod Validation: Runtime Type Safety

Financial data can't afford to be wrong. I implemented Zod schemas at multiple
layers:

- **Entity Level**: Core data structure validation
- **Service Level**: Business rule validation (like merchant name uniqueness)
- **API Level**: Request/response validation

```typescript
const CreateMerchantRequestSchema = z.object({
  name: z.string().min(1).max(255),
  location: z.string().max(255).optional(),
});
```

This caught validation issues at runtime rather than letting bad data corrupt
the financial calculations that would come later.

### SOLID Principles in Action

I applied all five SOLID principles throughout the implementation:

- **Single Responsibility**: Each class has one clear job (MerchantRepository
  only handles data access)
- **Open/Closed**: Extended shared interfaces without modifying existing code
- **Liskov Substitution**: Backend implementations work seamlessly with shared
  interfaces
- **Interface Segregation**: Small, focused interfaces rather than bloated ones
- **Dependency Inversion**: Dependencies flow toward abstractions, not
  concretions

## 💡 Key Learnings

### The Power of Shared Interfaces

One of the smartest architectural decisions was defining interfaces in the
`shared/` directory and implementing them in `backend/`. This allowed me to
write tests against interfaces before the implementations existed, and it
created a clear contract between layers.

The shared `MerchantRepository` interface defined the API, and the backend
implementation provided the actual database operations. This separation made
testing so much easier and prevented tight coupling.

### Repository Pattern Benefits

The repository pattern really shone here. By abstracting away the database
operations, I could focus on business logic in the services without worrying
about SQL queries. The `save()` method with upsert logic was particularly
elegant - it handles both creating new records and updating existing ones.

### Test Organization Matters

I learned that test files should mirror the source code structure. Having
`backend/__tests__/repositories/merchantRepository.test.ts` right next to
`backend/repositories/merchantRepository.ts` made it easy to keep tests and
implementations in sync.

### Async/Await Gotchas

I ran into some interesting async issues with the route handlers. The Hono
framework expects either synchronous responses or proper Promise handling.
Learning to properly type async route handlers was a valuable lesson in API
design.

### Validation Layering

Having validation at multiple layers (entity, service, route) created a robust
defense-in-depth approach. Entity-level validation catches basic data issues,
service-level validation enforces business rules, and route-level validation
ensures proper API contracts.

## 🚀 What's Next

Sprint 2: People/Members Management! Now that I have the foundational entities
working, I need to implement the user/member system that will own all these
merchants and tags. This will involve more complex relationships and the
authentication system I scaffolded earlier.

The patterns I established in Sprint 1 will make Sprint 2 much smoother - I now
have proven TDD workflows, clean architecture layers, and a solid foundation to
build upon. The Merchants & Tags foundation is ready to support the complex
financial operations that will make this app actually useful for tracking shared
expenses.

## 📊 Sprint 1 Stats

- **Files Implemented**: 12 core files + 8 test files
- **Tests Passing**: 18/18 for Merchants & Tags ✅
- **API Endpoints**: 6 (GET/POST/PATCH for both Merchants and Tags)
- **Business Rules**: Duplicate prevention, active/inactive status
- **Architecture Layers**: All 4 layers implemented and tested
- **Commits**: Following TDD pattern (red → green → refactor)

## 📸 Visual Progress

The architecture diagram really helped visualize what I was building:

```
┌─────────────────┐
│   Routes        │  ← API endpoints (/api/merchants, /api/tags)
│   (Hono)        │
└─────────────────┘
         ↓
┌─────────────────┐
│   Services      │  ← Business logic & validation
│   (Zod schemas) │
└─────────────────┘
         ↓
┌─────────────────┐
│ Repositories    │  ← Database operations
│   (Drizzle ORM) │
└─────────────────┘
         ↓
┌─────────────────┐
│   Entities      │  ← Core business rules
│   (Factory methods)
└─────────────────┘
```

_Figure 1: Clean Architecture layers implemented in Sprint 1, showing the
separation of concerns that will support the entire application_

## 🔗 Resources & References

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) -
  The architectural foundation that guided every decision
- [Drizzle ORM Documentation](https://orm.drizzle.team/) - Type-safe database
  operations that prevented so many bugs
- [Zod Validation](https://zod.dev/) - Runtime type validation that caught
  issues before they became problems
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID) - The design
  principles that keep code maintainable and extensible
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html) -
  The development methodology that drove the implementation quality

Sprint 1 established the patterns and foundation that will carry this project to
completion. The cornerstones are solid, and I'm excited to build the features
that will make Portfolio Card Splitter actually useful for managing shared
expenses! 💪</content>
<parameter name="filePath">d:\Users\Andrew
Wilks\Projects\portfolio-card-splitter-v2_devlog\2025-10-21-sprint-1-merchants-tags-foundation.md
