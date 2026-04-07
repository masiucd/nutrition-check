# CalorieTracker — Agent Context

Personal calorie tracking web app. Single user. Desktop web only.

**Dev server:** `pnpm dev` → http://localhost:4444  
**Typecheck:** `pnpm typecheck`  
**Lint/format:** `pnpm check`

---

## Stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start (`@tanstack/react-start` v1) + TanStack Router |
| UI | React 19, ShadCN, Tailwind CSS v4, Radix UI |
| Database | PostgreSQL — **raw SQL only via `postgres` (sql template tag)** |
| Cache | Redis via `ioredis` |
| Auth | httpOnly cookie session (`useSession` from `@tanstack/react-start/server`) |
| Migrations | dbmate (`pnpm migrate:up / down / status / new`) |
| Linter | Biome v2 (replaces ESLint + Prettier) |
| Package manager | pnpm |

**No ORM.** Never suggest or add Prisma, Drizzle, TypeORM, or any other ORM.

---

## Project structure

```
src/
├── db/
│   ├── index.ts              # postgres sql client + barrel re-export of all DAOs and types
│   ├── types.ts              # Row types: User, Food, DailyLog, DailyLogWithFood
│   ├── users.dao.ts          # findByEmail, findById, create, updatePassword, updateEmail
│   ├── foods.dao.ts          # search, findAll, findById, create, update, delete
│   └── daily-logs.dao.ts     # findByDate, findById, create, update, delete, dailyTotals
├── server/
│   ├── functions/
│   │   └── user.ts           # createUser, loginUser, logoutFn, getCurrentUserFn, updateUserEmailFn, updateUserPasswordFn
│   └── utils/
│       ├── password.server.ts  # hashPassword, comparePassword (bcryptjs)
│       ├── redis.server.ts     # storeUserInCache, getUserFromCache, deleteUserFromCache
│       ├── session.ts          # getAppSession() — httpOnly cookie, 7-day expiry
│       └── status_code.ts      # HttpStatusCode enum
├── routes/
│   ├── __root.tsx            # Root layout: header, nav, footer, auth context via beforeLoad
│   ├── index.tsx             # Home / dashboard
│   ├── login.tsx             # Login form
│   ├── signup.tsx            # Signup form
│   ├── forgot_password.tsx   # Forgot password page
│   └── auth/
│       ├── _authed.tsx       # Auth guard layout — redirects unauthenticated users
│       └── _authed/          # Protected routes live here
├── components/
│   └── ui/                   # ShadCN components: Button, Card, Input, Label
├── lib/
│   ├── types.ts              # Nullable, Optional, Maybe, AwaitNullable, isNonNullable
│   └── utils.ts              # cn() (clsx + tailwind-merge)
├── env.ts                    # Zod-validated env schema (DB_*, JWT_*, SESSION_SECRET, REDIS_URL)
├── router.tsx                # TanStack Router config
└── styles.css                # Tailwind v4 entry point + ShadCN CSS variables
db/
├── migrations/               # dbmate SQL migration files
│   └── 20260402000000_initial_schema.sql
├── schema.sql                # Auto-generated full schema snapshot — never edit manually
└── README.md                 # Migration usage guide
.planning/
├── PROJECT.md                # Project vision, constraints, key decisions
├── REQUIREMENTS.md           # 17 v1 requirements (AUTH, FOOD, LOG, SUM)
├── ROADMAP.md                # 5-phase roadmap
├── STATE.md                  # Current phase status and quick tasks log
└── config.json               # GSD workflow config
```

---

## Database schema

```
users        — id, email, password (bcrypt), created_at
foods        — id, user_id, name, calories_per_unit, unit_label, created_at, updated_at
daily_logs   — id, user_id, food_id, log_date (DATE), meal (breakfast|lunch|dinner|snacks),
               quantity, calories, created_at, updated_at
```

---

## Architecture rules

### DAOs are the only database layer

All SQL lives in `src/db/*.dao.ts`. Server functions call DAOs. Nothing else touches `sql` directly.

```ts
// Correct
import { foodsDao } from "@/db"
const foods = await foodsDao.findAll(userId)

// Wrong — raw sql outside a DAO
import { sql } from "@/db"
const foods = await sql`SELECT * FROM foods`
```

See `src/db/DAOS.md` for the full DAO contract.

### Server functions own auth + validation

`createServerFn()` handlers are responsible for: reading the session, checking ownership, validating input with Zod, calling DAOs, and returning results. DAOs do none of these things.

```ts
import { createServerFn } from "@tanstack/react-start"
import { foodsDao } from "@/db"
import { getAppSession } from "@/server/utils/session"

export const getFoods = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getAppSession()
  const userId = session.data.userId
  if (!userId) throw new Error("Unauthenticated")
  return foodsDao.findAll(userId)
})
```

### Session pattern

```ts
const session = await getAppSession()
const userId = session.data.userId   // number | undefined
```

Session is an httpOnly encrypted cookie. 7-day expiry. Stored in `SESSION_SECRET`.

### Auth-protected routes

Protected routes live under `src/routes/auth/_authed/`. The `_authed.tsx` layout handles the redirect guard. Do not add manual auth checks in routes that live under this layout.

### User cache (Redis)

After login and on `getCurrentUserFn`, the user row is stored in Redis under `user:{userId}` with a 1-hour TTL. Always invalidate on logout (`deleteUserFromCache`) and refresh on profile updates (`storeUserInCache`). Redis failures are caught and logged — they must never crash a request.

---

## Environment variables

| Variable | Purpose |
|---|---|
| `DB_USER / DB_PASSWORD / DB_HOST / DB_PORT / DB_NAME` | Postgres connection |
| `DATABASE_URL` | Used by dbmate for migrations |
| `DBMATE_MIGRATIONS_DIR` | `db/migrations` |
| `SESSION_SECRET` | Cookie encryption key |
| `JWT_ACCESS_SECRET / JWT_REFRESH_SECRET` | Reserved for future JWT use |
| `REDIS_URL` | Redis connection (default: `redis://localhost:6379`) |
| `ENVIRONMENT` | `development` or `production` |

---

## Response shape convention

Server functions return a typed object — never throw for expected errors:

```ts
return { error: "Reason", data: null, status: HttpStatusCode.BAD_REQUEST }
return { error: null, data: result, status: HttpStatusCode.OK }
```

`HttpStatusCode` is at `@/server/utils/status_code`.

---

## Coding conventions

- **TypeScript:** strict mode, `moduleResolution: Bundler`, path alias `@/*` → `src/*`
- **Formatting:** Biome — tabs, double quotes, no semicolons, trailing commas
- **Imports:** sorted by Biome; always use `@/` alias, never relative `../`
- **CSS:** Tailwind v4 utility classes only; ShadCN component variants via `cva`
- **`cn()`** for conditional class merging: `import { cn } from "@/lib/utils"`
- **Nullable utilities:** use `isNonNullable`, `Nullable<T>`, `Maybe<T>` from `@/lib/types`
- Never import `src/db/*` or `src/server/*` in client components or hooks

---

## Common tasks

**Add a new protected route:**
1. Create file under `src/routes/auth/_authed/my-page.tsx`
2. Use `createFileRoute('/auth/my-page')` — the `_authed` layout handles auth automatically

**Add a new server function:**
1. Create or extend a file in `src/server/functions/`
2. Get session → check userId → call DAO → return `{ error, data, status }`

**Add a new DAO method:**
1. Add method to the relevant `src/db/*.dao.ts`
2. If it returns a new shape, add the type to `src/db/types.ts`
3. Re-export from `src/db/index.ts` if it's a new type

**Add a new migration:**
```sh
pnpm migrate:new <description>   # creates db/migrations/<timestamp>_<description>.sql
# fill in -- migrate:up and -- migrate:down blocks
pnpm migrate:up
```

**Run the app:**
```sh
# Start Postgres (port 5444) and Redis (port 6379) first
pnpm dev
```
