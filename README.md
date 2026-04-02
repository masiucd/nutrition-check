# CalorieTracker

> **Work in progress** — this project is actively being built and is not yet feature-complete.

A personal calorie tracking web application. Log meals, search a local food database, and view weekly/monthly summaries of your calorie intake.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [TanStack Start](https://tanstack.com/start) |
| Router | [TanStack Router](https://tanstack.com/router) |
| UI Library | [React 19](https://react.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Components | [shadcn/ui](https://ui.shadcn.com) |
| Database | [PostgreSQL](https://www.postgresql.org) (raw SQL, no ORM) |
| Package Manager | [pnpm](https://pnpm.io) |
| Linter / Formatter | [Biome](https://biomejs.dev) |
| Language | TypeScript |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- A running PostgreSQL instance

### Setup

```bash
# Install dependencies
pnpm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env and set DATABASE_URL to your Postgres connection string

# Start the development server
pnpm dev
```

The app will be available at `http://localhost:3000`.

## Scripts

```bash
pnpm dev       # Start development server
pnpm build     # Build for production
pnpm preview   # Preview production build
pnpm check     # Lint, format, and sort imports (Biome)
pnpm lint      # Lint only
pnpm format    # Format only
pnpm typecheck # TypeScript type check
pnpm test      # Run tests
```

## Project Structure

```
src/
├── db/             # PostgreSQL connection pool (server-only)
├── components/
│   └── ui/         # shadcn/ui components
├── lib/            # Shared utilities (cn, etc.)
├── routes/         # File-based routes (TanStack Router)
└── styles.css      # Tailwind CSS entry point
```
