# Introduction to the Dev Log Series

## Welcome to Portfolio Card Splitter

Hey there! I'm excited to share my journey building **Portfolio Card Splitter** - a shared expense management app born from a very real problem in my own life. Let me tell you the story behind it.

## The Story Behind the Project

My partner and I had a problem. We use our shared credit card as a "transactional" card - we pay off everything we purchase immediately to earn credit card points. But we were struggling to keep track of who owed what, when payments needed to be made, and how to allocate money across different accounts to save on interest.

It became a source of frustration and arguments. We'd end up with messy spreadsheets, mental math, and confusion about where our money was and where it was going. We needed a better way.

That's when I decided to build Portfolio Card Splitter. Not just as a solution to our personal problem, but as the perfect opportunity to showcase my full-stack development skills in the TypeScript and React ecosystem. This project would solve our immediate need while demonstrating enterprise-level architecture and modern web development practices.

## What Makes This Project Special

### The Problem I'm Solving

Picture this: My partner and I are trying to maximise our credit card rewards while keeping our finances organised. Who paid for the groceries? How do we split that $247.83 dinner bill? When do payments need to be made? How do we allocate money across accounts to minimise interest? Traditional methods involve spreadsheets, mental math, and arguments. We can do better.

### The Technical Challenge

Building financial software isn't just about CRUD operations. It requires:

- **Financial precision** (no floating-point errors with money)
- **Multi-user complexity** (what happens when 5 people edit the same expense?)
- **Audit trails** (who changed what and when?)
- **Real-time collaboration** (seeing updates as they happen)

### Why I'm Building This

1. **Portfolio Piece**: Demonstrate enterprise-level architecture skills on my GitHub
2. **Learning Journey**: Explore modern web development patterns and deepen my expertise
3. **Educational Content**: Share the development process with other developers
4. **Personal Challenge**: Build something technically complex and meaningful

## The Dev Log Series

### What You'll Learn

Each dev log follows my actual development process, including:

- **Architecture Decisions**: Why I chose certain patterns over others
- **Technical Challenges**: Real problems and how I solved them
- **Lessons Learned**: What worked, what didn't, and why
- **Code Evolution**: How the codebase grows and improves over time

### My Development Philosophy

- **TDD First**: Tests drive the implementation
- **Clean Architecture**: Separation of concerns at every layer
- **SOLID Principles**: Maintainable, extensible code
- **Modern Tech Stack**: Deno, TypeScript, Hono, Drizzle ORM

### Tech Stack Overview

```bash
Frontend: React + TypeScript (planned)
Backend: Deno + Hono framework
Database: PostgreSQL + Drizzle ORM
Testing: Deno's native test runner
Validation: Zod schemas
Real-time: Server-Sent Events
```

## Project Roadmap

### Phase 1: Foundation (Current)

- ✅ Project scaffolding and architecture
- ✅ Comprehensive test infrastructure (258 test files!)
- 🔄 Authentication system implementation

### Phase 2: Core Features

- Transaction management and allocation
- Pot-based money management
- User invitation and member management

### Phase 3: Advanced Features

- Real-time updates via SSE
- Receipt scanning and OCR
- Advanced analytics and reporting

### Phase 4: Production Ready

- Security hardening and rate limiting
- Performance optimisation
- Deployment and monitoring

## How to Follow Along

### Repository Structure

```bash
portfolio-card-splitter-v2/
├── backend/          # Deno + Hono API server
├── frontend/         # React application (planned)
├── shared/           # Common types and business logic
├── specs/            # Requirements and API contracts
└── _devlog/          # These dev logs and assets
```

### Reading the Dev Logs

Each log is structured as a story with:

- **What I Accomplished**: Progress made
- **Technical Deep Dive**: Architecture and code explanations
- **Key Learning's**: Lessons and insights
- **What's Next**: Roadmap and priorities
- **Visual Progress**: Screenshots and diagrams

### Getting Involved

- **GitHub**: Follow the repository for updates
- **Issues**: Suggest improvements or ask questions
- **Pull Requests**: Contribute if you're feeling adventurous
- **Comments**: Share your thoughts on the approach

## Why This Matters

In the world of software development, we often see polished final products but rarely the messy, iterative process that creates them. This dev log series pulls back the curtain to show:

- **Real Development**: Including wrong turns and refactoring
- **Decision Making**: Why certain technologies and patterns were chosen
- **Problem Solving**: How complex issues get broken down and solved
- **Growth Mindset**: Learning happens through experimentation and iteration

Whether you're a junior developer looking to learn, a senior developer exploring new technologies, or just curious about building financial software, I hope these logs provide value and inspiration for your own projects.

## Let's Get Started

The journey begins with [Project Scaffolding Complete](./2025-10-21-project-scaffolding-complete.md) - where I built the foundation that will support everything that comes next.

Thanks for joining me on this adventure! 🚀

---

_Portfolio Card Splitter is a personal portfolio project built with modern web technologies. The goal is to demonstrate advanced software engineering skills while creating a functional expense management application._
