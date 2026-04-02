# Byte&Bite

A modern calorie tracking application

> ⚠️ **Work in Progress** - This project is currently under active development.

## Tech Stack

### Frontend

- **React 19** - UI library
- **TanStack Router** - Type-safe routing with SSR support
- **TanStack Start** - Full-stack React framework
- **Tailwind CSS 4** - Utility-first styling
- **Radix UI** - Accessible UI primitives
- **Lucide React** - Icon library

### Backend & Database

- **Prisma ORM** - Type-safe database ORM
- **PostgreSQL** - Relational database
- **Zod** - Schema validation

### Development & Tooling

- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Biome** - Linting and formatting
- **Vitest** - Testing framework
- **Docker** - Containerization

## Getting Started

### Prerequisites

- Node.js
- pnpm
- Docker (for PostgreSQL)

### Installation

```bash
# Install dependencies
pnpm install

# Start the database
docker-compose up -d

# Run database migrations
pnpm prisma migrate dev

# Start the development server
pnpm dev
```

The app will be available at `http://localhost:3000`.

## Scripts

| Command                 | Description                             |
| ----------------------- | --------------------------------------- |
| `pnpm dev`              | Start development server                |
| `pnpm build`            | Build for production                    |
| `pnpm preview`          | Preview production build                |
| `pnpm test`             | Run tests                               |
| `pnpm check`            | Run Biome linting and formatting checks |
| `pnpm prisma migrate dev` | Run Prisma migrations               |
| `pnpm prisma generate`    | Generate Prisma client              |

## License

MIT
