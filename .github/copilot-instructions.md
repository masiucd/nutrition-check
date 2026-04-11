# CalorieTracker — GitHub Copilot Instructions

## Project Overview

**CalorieTracker** is a personal, single-user, desktop-web calorie tracking application. Users search a locally-managed food database, log meals against a daily entry, and view weekly/monthly summaries of their calorie intake.

- **Platform:** Desktop web browser only — no mobile-first concerns
- **Users:** Single user (personal tool, not a product)
- **Core value:** Fast, frictionless daily food logging with instant calorie totals

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start (`@tanstack/react-start` v1) + TanStack Router (file-based routing) |
| UI | React 19, ShadCN/ui, Tailwind CSS v4, Radix UI, Lucide React |
| Database | PostgreSQL — **raw SQL only** via the `postgres` package (sql template tag) |
| Cache | Redis via `ioredis` |
| Auth | httpOnly cookie session via `useSession` from `@tanstack/react-start/server` |
| Migrations | dbmate (`pnpm migrate:up / down / status / new`) |
| Linter / Formatter | Biome v2 (replaces ESLint + Prettier entirely) |
| Package manager | pnpm |
| Language | TypeScript (strict mode) |
| Testing | Vitest + Testing Library |

---

## Absolute Rules — Never Violate These

1. **No ORM.** Never suggest or add Prisma, Drizzle, TypeORM, Sequelize, or any other ORM. All database access uses raw SQL via the `postgres` `sql` template tag, and only inside DAO files.
2. **No raw SQL outside DAOs.** Every SQL query lives in `src/db/*.dao.server.ts`. Server functions, route loaders, and helpers never import `sql` or execute a query directly.
3. **Never import `src/db/*` or `src/server/*` in client components or hooks.** These are server-only modules. Access data exclusively through `createServerFn()` handlers.
4. **Always use the `@/` path alias.** Never use relative imports like `../` or `../../`.

---

## Project Structure

```
src/
├── db/
│   ├── index.ts                    # postgres sql client + barrel re-export of all DAOs and types
│   ├── types.ts                    # Row types: User, Food, DailyLog, DailyLogWithFood
│   ├── users.dao.server.ts         # findByEmail, findById, create, updatePassword
│   ├── foods.dao.server.ts         # search, findAll, findById, create, update, delete
│   ├── daily_logs.dao.server.ts    # findByDate, findById, create, update, delete, dailyTotals
│   ├── user_data.dao.server.ts     # cross-entity user data queries
│   └── DAOS.md                     # Full DAO contract documentation
├── server/
│   ├── functions/
│   │   └── user.ts                 # createUser, loginUser, logoutFn, getCurrentUserFn, updateUserEmailFn, updateUserPasswordFn
│   └── utils/
│       ├── password.server.ts      # hashPassword, comparePassword (bcryptjs)
│       ├── redis.server.ts         # storeUserInCache, getUserFromCache, deleteUserFromCache
│       ├── session.ts              # getAppSession() — httpOnly cookie, 7-day expiry
│       └── status_code.ts          # HttpStatusCode enum
├── routes/
│   ├── __root.tsx                  # Root layout: header, nav, footer, auth context via beforeLoad
│   ├── index.tsx                   # Home / dashboard
│   ├── login.tsx                   # Login form
│   ├── signup.tsx                  # Signup form
│   ├── forgot_password.tsx         # Forgot password page
│   ├── food_items.tsx              # Food database management
│   └── auth/
│       ├── _authed.tsx             # Auth guard layout — redirects unauthenticated users
│       └── _authed/                # All protected routes live here
├── components/
│   └── ui/                         # ShadCN components (Button, Card, Input, Label, etc.)
├── lib/
│   ├── types.ts                    # Nullable<T>, Optional<T>, Maybe<T>, AwaitNullable, isNonNullable
│   └── utils.ts                    # cn() — clsx + tailwind-merge
├── env.ts                          # Zod-validated environment schema
├── config.ts                       # App-wide config constants
├── router.tsx                      # TanStack Router configuration
└── styles.css                      # Tailwind v4 entry point + ShadCN CSS variables
db/
├── migrations/                     # dbmate SQL migration files (timestamped)
├── schema.sql                      # Auto-generated schema snapshot — never edit manually
└── README.md                       # Migration usage guide
.planning/
├── PROJECT.md                      # Project vision, constraints, key decisions
├── REQUIREMENTS.md                 # 17 v1 requirements (AUTH, FOOD, LOG, SUM)
├── ROADMAP.md                      # 5-phase roadmap
└── STATE.md                        # Current phase status and task log
```

---

## Database Schema

```sql
users
  id            SERIAL PRIMARY KEY
  email         TEXT UNIQUE NOT NULL
  password      TEXT NOT NULL          -- bcrypt hash
  created_at    TIMESTAMPTZ

foods
  id                SERIAL PRIMARY KEY
  user_id           INTEGER REFERENCES users(id)
  name              TEXT NOT NULL
  calories_per_unit NUMERIC NOT NULL
  unit_label        TEXT DEFAULT 'serving'
  created_at        TIMESTAMPTZ
  updated_at        TIMESTAMPTZ

daily_logs
  id          SERIAL PRIMARY KEY
  user_id     INTEGER REFERENCES users(id)
  food_id     INTEGER REFERENCES foods(id)
  log_date    DATE NOT NULL
  meal        TEXT CHECK (meal IN ('breakfast','lunch','dinner','snacks'))
  quantity    NUMERIC NOT NULL
  calories    NUMERIC NOT NULL         -- quantity × calories_per_unit, computed on write
  created_at  TIMESTAMPTZ
  updated_at  TIMESTAMPTZ
```

---

## Architecture Rules

### DAOs are the only database layer

All SQL lives in `src/db/*.dao.server.ts`. Import DAOs from the barrel `@/db` — never from the individual file paths.

```ts
// Correct
import { foodsDao } from "@/db"
const foods = await foodsDao.findAll(userId)

// Wrong — raw sql outside a DAO
import { sql } from "@/db"
const foods = await sql`SELECT * FROM foods`

// Wrong — importing directly from the file
import { foodsDao } from "@/db/foods.dao.server"
```

### Server functions own auth, validation, and orchestration

`createServerFn()` handlers are responsible for: reading the session, verifying ownership, validating input with Zod, calling DAOs, and returning results. DAOs do none of these things.

```ts
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { foodsDao } from "@/db"
import { getAppSession } from "@/server/utils/session"
import { HttpStatusCode } from "@/server/utils/status_code"

export const getFoods = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getAppSession()
  const userId = session.data.userId
  if (!userId) {
    return { error: "Unauthenticated", data: null, status: HttpStatusCode.UNAUTHORIZED }
  }
  const data = await foodsDao.findAll(userId)
  return { error: null, data, status: HttpStatusCode.OK }
})
```

### Response shape convention

Server functions return a typed object — never throw for expected/business-logic errors:

```ts
// Success
return { error: null, data: result, status: HttpStatusCode.OK }

// Expected failure
return { error: "Food not found", data: null, status: HttpStatusCode.NOT_FOUND }
```

`HttpStatusCode` is imported from `@/server/utils/status_code`.

### Session pattern

```ts
const session = await getAppSession()
const userId = session.data.userId  // number | undefined
```

Session is an httpOnly encrypted cookie with a 7-day expiry, keyed by `SESSION_SECRET`. Call `getAppSession()` at the top of every protected server function.

### Auth-protected routes

Protected routes live under `src/routes/auth/_authed/`. The `_authed.tsx` layout handles redirect guards automatically. Do not add manual auth checks inside routes under this layout.

```ts
// Correct — create file at src/routes/auth/_authed/my-page.tsx
export const Route = createFileRoute('/auth/my-page')({ ... })

// Wrong — manual redirect guard inside a protected route
if (!user) redirect({ to: '/login' })
```

### Ownership verification before mutations

`findById` methods do not scope by `userId`. Always verify ownership after fetching:

```ts
const food = await foodsDao.findById(id)
if (!food || food.user_id !== userId) {
  return { error: "Not found", data: null, status: HttpStatusCode.NOT_FOUND }
}
await foodsDao.delete(id)
```

### Redis user cache

After login and on `getCurrentUserFn`, the user row is stored in Redis under `user:{userId}` with a 1-hour TTL.

- **On logout:** call `deleteUserFromCache(userId)`
- **On profile update:** call `storeUserInCache(user)`
- **Redis failures must never crash a request** — wrap Redis calls in try/catch and log the error

```ts
import { storeUserInCache, getUserFromCache, deleteUserFromCache } from "@/server/utils/redis.server"
```

---

## Coding Conventions

### TypeScript

- Strict mode is enabled — no `any`, no `!` non-null assertions unless unavoidable
- `moduleResolution: Bundler`, path alias `@/*` → `src/*`
- Use types from `@/lib/types` for nullable patterns: `Nullable<T>`, `Maybe<T>`, `isNonNullable`
- Import types from `@/db` alongside DAOs: `import type { Food, DailyLogWithFood } from "@/db"`

### Formatting (Biome)

- **Indentation:** tabs
- **Quotes:** double quotes
- **Semicolons:** none
- **Trailing commas:** always
- Run `pnpm check` to lint, format, and sort imports in one step

### Imports

- Always use the `@/` alias — never relative paths with `../`
- Imports are sorted automatically by Biome — do not manually reorder
- Never import `src/db/*` or `src/server/*` in any client-side file

### Styling

- Tailwind v4 utility classes only — no custom CSS except in `styles.css`
- ShadCN component variants use `cva` from `class-variance-authority`
- Use `cn()` from `@/lib/utils` for conditional class merging

```ts
import { cn } from "@/lib/utils"
<div className={cn("base-class", isActive && "active-class")} />
```

### Forms

- Use `@tanstack/react-form` for all form state management
- Validate with Zod schemas — share the same schema between client and server where possible

---

## Common Tasks

### Add a new protected route

1. Create `src/routes/auth/_authed/my-page.tsx`
2. Use `createFileRoute('/auth/my-page')` — `_authed` handles auth automatically

### Add a new server function

1. Create or extend a file in `src/server/functions/`
2. Pattern: get session → check userId → validate input → call DAO → return `{ error, data, status }`

### Add a new DAO method

1. Add the method to the relevant `src/db/*.dao.server.ts`
2. If it returns a new shape, add the type to `src/db/types.ts`
3. Re-export the new type from `src/db/index.ts`

### Add a new database table

1. Run `pnpm migrate:new <description>` — creates `db/migrations/<timestamp>_<description>.sql`
2. Fill in the `-- migrate:up` and `-- migrate:down` blocks
3. Run `pnpm migrate:up`
4. Add the row type to `src/db/types.ts`
5. Create `src/db/<table>.dao.server.ts` with the DAO object
6. Re-export from `src/db/index.ts`

### Add a new ShadCN component

```sh
pnpm dlx shadcn@latest add
 <component-name>
```

Components are placed in `src/components/ui/` automatically.

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `DB_USER / DB_PASSWORD / DB_HOST / DB_PORT / DB_NAME` | PostgreSQL connection parts |
| `DATABASE_URL` | Full connection string used by dbmate for migrations |
| `DBMATE_MIGRATIONS_DIR` | `db/migrations` |
| `SESSION_SECRET` | Cookie encryption key (min 32 chars) |
| `JWT_ACCESS_SECRET / JWT_REFRESH_SECRET` | Reserved for future JWT use |
| `REDIS_URL` | Redis connection (default: `redis://localhost:6379`) |
| `ENVIRONMENT` | `development` or `production` |

All variables are validated at startup via Zod in `src/env.ts`. If a required variable is missing, the app will fail fast with a clear error.

---

## Dev Scripts

```sh
pnpm dev           # Start development server on http://localhost:4444
pnpm build         # Production build
pnpm preview       # Preview production build
pnpm check         # Lint + format + sort imports (Biome) — run before committing
pnpm lint          # Lint only
pnpm format        # Format only
pnpm typecheck     # TypeScript type check (tsc --noEmit)
pnpm test          # Run Vitest test suite

pnpm migrate:up    # Apply pending migrations
pnpm migrate:down  # Roll back last migration
pnpm migrate:status # Show migration status
pnpm migrate:new <name>  # Scaffold a new migration file
```

> **To run the app locally:** Start PostgreSQL on port 5444 and Redis on port 6379 first, then run `pnpm dev`.

---

## v1 Feature Requirements (for context)

| ID | Feature | Phase |
|---|---|---|
| AUTH-01 | Sign up with email and password | 1 |
| AUTH-02 | Log in with email and password | 1 |
| AUTH-03 | Session persists across browser refresh | 1 |
| AUTH-04 | Log out from any page | 1 |
| FOOD-01 | Search food database by name | 2 |
| FOOD-02 | Add a new custom food item | 2 |
| FOOD-03 | Edit an existing food item | 2 |
| FOOD-04 | Delete a food item | 2 |
| LOG-01 | Log a food item with quantity to today's entry | 3 |
| LOG-02 | Edit a logged entry | 3 |
| LOG-03 | Delete a logged entry | 3 |
| LOG-04 | View today's log with running calorie total | 3 |
| LOG-05 | Categorize entries by meal (breakfast/lunch/dinner/snacks) | 3 |
| SUM-01 | Weekly summary — calories per day for past 7 days | 4 |
| SUM-02 | Monthly summary — total and average calories | 4 |
| SUM-03 | Visual chart (bar or line) of calorie intake over time | 4 |
| SUM-04 | View full food log for any past day | 4 |

**Out of scope for v1:** macro tracking, barcode scanning, multi-user access, external food APIs (USDA, Open Food Facts), OAuth, mobile native app, password reset via email.
