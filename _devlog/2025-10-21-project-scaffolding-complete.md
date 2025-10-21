# 2025-10-21 - Project Scaffolding Complete: From Concept to Clean Architecture

Hey everyone! Today marks a pretty amazing milestone in my Portfolio Card Splitter journey. I've gone from a spark of an idea about splitting credit card expenses to having a fully scaffolded, enterprise-grade application architecture. And let me tell you, the journey has been equal parts challenging, exciting, and deeply educational.

## 🎯 What I Accomplished

Picture this: My partner and I had a problem. We use our shared credit card as a "transactional" card - we pay off everything we purchase immediately to earn credit card points. But we were struggling to keep track of who owed what, when payments needed to be made, and how to allocate money across different accounts to save on interest.

It became a source of frustration and arguments. We'd end up with messy spreadsheets, mental math, and confusion about where our money was and where it was going. We needed a better way.

That's when I decided to build Portfolio Card Splitter. Not just as a solution to our personal problem, but as the perfect opportunity to showcase my full-stack development skills in the TypeScript and React ecosystem. This project would solve our immediate need while demonstrating enterprise-level architecture and modern web development practices.

What began as a solution to our personal finance tracking woes has evolved into a comprehensive system with **258 test files**, clean architecture layers, and a tech stack that scales. I now have:

- A complete backend API structure with Hono
- Database schema designed for financial accuracy
- Comprehensive test infrastructure ready for TDD
- Clean separation between frontend, backend, and shared logic
- Event-driven architecture for real-time features

## 🏗️ Technical Deep Dive

### The Architecture That Makes It All Work

One of the biggest "aha!" moments came when I realised that financial software demands a different approach than regular web apps. You can't have floating-point errors when dealing with money, and you need rock-solid audit trails. This became especially clear when thinking about my partner's and my credit card situation - we couldn't afford confusion about who owed what or when payments were due.

I landed on **Clean Architecture** - think of it like building a house with proper foundations:

```Text
Entities (Core Business Logic)
    ↓
Repositories (Data Access)
    ↓
Services (Business Operations)
    ↓
Routes (API Endpoints)
```

**Why this matters**: Each layer has a single responsibility. If I need to change how I store data (say, from PostgreSQL to MongoDB), only the repository layer changes. The business logic stays pristine.

### The Test-First Philosophy

Here's something that surprised me: I wrote **258 test files** before writing a single line of implementation code. That's not overkill - that's smart financial software development.

```typescript
Deno.test("allocation tests", () => {
  // TODO: Implement tests for allocation.ts
});
```

**The educational twist**: TDD isn't just about catching bugs. It's about designing your API from the outside-in. When you write the test first, you're forced to think: "How will other developers actually use this code?"

### Database Design for Financial Accuracy

My schema uses integer cents instead of floating-point dollars. Why? Because `0.1 + 0.2 = 0.30000000000000004` in JavaScript. That's not okay when you're tracking who owes what for that $47.83 dinner bill - or in my case, ensuring my partner and I are accurately splitting our credit card rewards and payments.

```sql
CREATE TABLE transactions (
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0)
);
```

**Real-world lesson**: Financial software requires different thinking. Precision matters, and the cost of bugs is measured in real dollars and relationships. For my partner and me, this means the difference between earning the right credit card points and avoiding arguments about who paid for what.

## 💡 Key Learning's

### The Power of Scaffolding

I used to think scaffolding was boring preliminary work. Now I see it as the foundation that enables everything else. With my 258 test files in place, implementing features becomes a focused, confident process.

### Technology Choice Matters

Choosing Deno, Hono, and Drizzle wasn't random. Each tool serves a specific purpose:

- **Deno**: Security-first runtime with excellent TypeScript support
- **Hono**: Lightweight framework that doesn't get in your way
- **Drizzle**: Type-safe ORM that prevents SQL injection and typos

### The Value of Event-Driven Thinking

From day one, I designed for events. Every transaction, every allocation change - it all generates events. This gives me audit trails and enables real-time features later.

**Pro tip for fellow developers**: When building collaborative apps, think about events first. It changes how you architect everything.

## 🚀 What's Next

I'm standing at an exciting crossroads. The foundation is solid, the architecture is proven. Now comes the fun part: **bringing it to life**.

### Immediate Priorities

1. **Authentication System**: Users need to log in, invite friends, and manage their groups
2. **Transaction Management**: The core feature - adding expenses and splitting them
3. **Basic UI**: Getting something visual that people can interact with

### The TDD Workflow Begins

Each feature now follows this rhythm:

1. Write failing tests (red)
2. Implement just enough code to pass (green)
3. Refactor for clarity and performance (refactor)

It's methodical, it's deliberate, and it produces incredibly reliable code.

## 📸 Visual Progress

_Coming soon: Screenshots of the architecture diagrams, database schema visualisations, and the comprehensive test file structure that makes this all possible._

## 🔗 Resources & References

- **Clean Architecture**: Uncle Bob's original book that inspired my layered approach
- **Domain-Driven Design**: Eric Evans' work on modelling complex business domains
- **Deno Manual**: Excellent documentation for my runtime choice
- **Hono Documentation**: Lightweight web framework that powers my API

## Final Thoughts

Building Portfolio Card Splitter has been a masterclass in thoughtful software development. What started as a solution to my partner and my credit card tracking frustrations has become a comprehensive demonstration of enterprise-level architecture and modern web development practices.

I've proven that starting with solid architecture and comprehensive testing creates a foundation that can support real financial software. The dual purpose - solving our personal finance challenges while showcasing my full-stack TypeScript and React skills - has made this project incredibly motivating.

The journey from concept to scaffolded architecture took time and careful planning, but now I'm positioned to build features quickly and confidently. Every line of code I write next will have tests guiding it, architectural principles supporting it, and a clear purpose driving it.

Stay tuned for the next chapter: **Authentication Implementation** - where I start turning this scaffold into a living, breathing application that people can actually use to split their expenses!

What's been your experience with project scaffolding? Have you found that investing time upfront pays dividends later? I'd love to hear your thoughts in the comments.

---

_This dev log represents the completion of Phase 1: Foundation. The codebase now has enterprise-grade architecture ready for feature implementation. Next up: Making users can actually log in and start managing their shared expenses._</content>
