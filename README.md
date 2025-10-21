# Portfolio Card Splitter

A mobile-first expense sharing application that tracks shared credit card spend
across multiple users. Built with TypeScript, React, and modern web
technologies.

> **🚧 Work in Progress**: This project is under active development and is
> currently being migrated from Node.js to Deno v2.5.x. Features and
> documentation may be incomplete or subject to change.

[![CI](https://github.com/AndrewWilks/portfolio-card-splitter/actions/workflows/ci.yml/badge.svg)](https://github.com/AndrewWilks/portfolio-card-splitter/actions/workflows/ci.yml)
[![Lighthouse Score](https://img.shields.io/badge/lighthouse-95%2B-brightgreen.svg)](https://github.com/AndrewWilks/portfolio-card-splitter/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Deno](https://img.shields.io/badge/Deno-2.5.x-green.svg)](https://deno.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Mobile-First Design**: Optimized for mobile devices with responsive layouts
- **Real-Time Collaboration**: Live updates across devices using Server-Sent
  Events
- **Smart Splitting**: Automatic percentage or fixed amount allocation with
  cent-perfect calculations
- **Australian Locale**: Built for Australian users with AUD currency and local
  timezone
- **Accessibility**: WCAG 2.2 AA compliant with comprehensive accessibility
  features
- **Modern Stack**: TypeScript, React, Vite, TanStack Router/Query, Hono,
  PostgreSQL

## Getting Started

### Prerequisites

- Deno 2.5.x+
- PostgreSQL 15+

### Installation

```bash
# Clone the repository
git clone https://github.com/andrew-wilks/portfolio-card-splitter.git
cd portfolio-card-splitter

# Install dependencies (Deno handles this automatically)
# No npm install needed - Deno downloads dependencies on demand

# Set up environment
cp .env.example .env
# Edit .env with your database and email configuration

# Run database migrations
deno run db:migrate

# Start development servers
deno run dev
```

### Development

```bash
# Run tests
deno test

# Run type checking
deno check

# Run linting
deno lint

# Run build
deno run build

# Database commands
deno run db:generate    # Generate migrations
deno run db:migrate     # Run migrations
deno run db:empty       # Clear database
```

## Tech Stack

- **Runtime**: Deno 2.5.x
- **Frontend**: React 18, TypeScript, Vite, TanStack Router, TanStack Query
- **Backend**: Deno, Hono, PostgreSQL, Drizzle ORM
- **Real-time**: Server-Sent Events with PostgreSQL LISTEN/NOTIFY
- **Email**: React Email + Resend
- **Testing**: Deno test, Testing Library, Playwright
- **CI/CD**: GitHub Actions, Lighthouse CI
- **Deployment**: Coolify + Traefik

## Project Structure

```text
portfolio-card-splitter/
├── backend/             # Hono API server
│   ├── routes/         # API route handlers
│   │   └── root.ts     # Root route handler
│   └── server.ts       # Main server entry point
├── frontend/            # React frontend (work in progress)
│   └── .gitkeep        # Placeholder for future frontend code
├── shared/              # Shared code between frontend/backend
│   └── db/             # Database layer
│       ├── constant/   # Database constants
│       ├── helpers/    # Database helper functions
│       ├── schema/     # Database schemas and migrations
│       ├── _migrations/# Generated migration files
│       ├── db.client.ts # Database client
│       ├── db.schema.ts # Schema exports
│       ├── drizzle.config.ts # Drizzle configuration
│       └── index.ts    # Database exports
├── specs/               # Project specifications
│   └── 001-mvp-specification/ # MVP requirements
├── deno.json            # Deno configuration and tasks
├── deno.lock            # Deno dependency lock file
├── .env                 # Environment variables
├── .env.example         # Environment variables template
└── README.md            # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## Acknowledgments

- Built as a portfolio project showcasing modern web development practices
- Designed with Australian users in mind
- Emphasizes accessibility and mobile-first design
