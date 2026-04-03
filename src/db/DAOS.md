# Data Access Objects (DAOs)

DAOs are the only layer in this project that is allowed to talk to the database. Every SQL query lives in a DAO. Nothing else — not server functions, not route loaders, not business logic helpers — should import `sql` or execute a query directly.

---

## Table of contents

1. [What a DAO is](#what-a-dao-is)
2. [File structure](#file-structure)
3. [How to import and use a DAO](#how-to-import-and-use-a-dao)
4. [DAO reference](#dao-reference)
   - [usersDao](#usersdao)
   - [foodsDao](#foodsdao)
   - [dailyLogsDao](#dailylogsdao)
5. [Types](#types)
6. [Patterns to follow](#patterns-to-follow)
7. [What to avoid](#what-to-avoid)
8. [Adding a new DAO](#adding-a-new-dao)

---

## What a DAO is

A **Data Access Object** is a plain object with async methods. Each method maps to one database operation — a query, an insert, an update, or a delete. The DAO knows how to talk to the database. Everything above it does not.

This separation has three practical benefits:

- **One place to change SQL.** When a query needs to change, you change it in the DAO. Server functions never need to be touched.
- **One place to reason about data access.** If there is a performance problem or a bug in a query, you know exactly where to look.
- **Testability.** DAOs can be swapped out or mocked in tests without touching server function logic.

The concept is identical to a DAO in Kotlin or Java — a focused class (here, an object) responsible solely for persistence operations on one entity.

---

## File structure

```
src/db/
├── index.ts              — db connection (sql) + barrel re-export
├── types.ts              — TypeScript types mirroring every table's row shape
├── users.dao.ts          — queries against the users table
├── foods.dao.ts          — queries against the foods table
└── daily-logs.dao.ts     — queries against the daily_logs table
```

`index.ts` is the single import point for the rest of the application. You never import from the individual DAO files directly.

> **All files in `src/db/` are server-only.** They must never be imported in client components, hooks, or any file that runs in the browser. Always access them through a `createServerFn()` handler.

---

## How to import and use a DAO

Import from `@/db` — the barrel — inside a `createServerFn` handler:

```ts
import { createServerFn } from "@tanstack/react-start"
import { foodsDao } from "@/db"

export const searchFoods = createServerFn({ method: "GET" })
  .validator((query: string) => query)
  .handler(async ({ data: query, context }) => {
    const userId = context.session.userId
    return foodsDao.search(userId, query)
  })
```

The server function owns validation, authentication checks, and authorisation. The DAO owns the query. Neither does the other's job.

---

## DAO reference

### usersDao

**File:** `src/db/users.dao.ts`

Manages the `users` table. Used exclusively by authentication server functions.

| Method | Signature | Returns |
|---|---|---|
| `findByEmail` | `(email: string)` | `Promise<User \| undefined>` |
| `findById` | `(id: number)` | `Promise<User \| undefined>` |
| `create` | `(email: string, hashedPassword: string)` | `Promise<User>` |
| `updatePassword` | `(id: number, hashedPassword: string)` | `Promise<User>` |

**Notes:**
- `findByEmail` and `findById` return `undefined` when no row is found. Always check before using the result.
- `create` accepts a **pre-hashed** password. Password hashing is the server function's responsibility, not the DAO's.
- `updatePassword` similarly accepts an already-hashed value.

---

### foodsDao

**File:** `src/db/foods.dao.ts`

Manages the `foods` table. All queries are scoped to a `userId` — the DAO never queries across users.

| Method | Signature | Returns |
|---|---|---|
| `search` | `(userId: number, query: string)` | `Promise<Food[]>` |
| `findAll` | `(userId: number)` | `Promise<Food[]>` |
| `findById` | `(id: number)` | `Promise<Food \| undefined>` |
| `create` | `(userId: number, name: string, caloriesPerUnit: number, unitLabel?: string)` | `Promise<Food>` |
| `update` | `(id: number, fields: Partial<Pick<Food, 'name' \| 'calories_per_unit' \| 'unit_label'>>)` | `Promise<Food>` |
| `delete` | `(id: number)` | `Promise<void>` |

**Notes:**
- `search` performs a case-insensitive partial match (`ILIKE`) on the food name.
- `update` uses `COALESCE` — only fields present in the `fields` object are changed. Omitting a field leaves the existing value intact.
- `unitLabel` defaults to `"serving"` in `create`.
- `findById` does **not** scope by `userId`. The server function must verify ownership before calling it.

---

### dailyLogsDao

**File:** `src/db/daily-logs.dao.ts`

Manages the `daily_logs` table. Handles individual log entries and date-range aggregations.

| Method | Signature | Returns |
|---|---|---|
| `findByDate` | `(userId: number, date: string)` | `Promise<DailyLogWithFood[]>` |
| `findById` | `(id: number)` | `Promise<DailyLog \| undefined>` |
| `create` | `(userId, foodId, date, meal, quantity, caloriesPerUnit)` | `Promise<DailyLog>` |
| `update` | `(id, quantity, caloriesPerUnit, meal)` | `Promise<DailyLog>` |
| `delete` | `(id: number)` | `Promise<void>` |
| `dailyTotals` | `(userId: number, from: string, to: string)` | `Promise<Array<{ log_date: string, total_calories: number }>>` |

**Notes:**
- `findByDate` returns `DailyLogWithFood` — a joined shape that includes `food_name` and `unit_label` from the `foods` table. Results are ordered by meal slot (breakfast → lunch → dinner → snacks) then insertion time.
- `create` and `update` compute the `calories` column internally as `quantity × caloriesPerUnit`. The caller provides the unit rate; the DAO stores the result.
- `date`, `from`, and `to` are ISO date strings in `"YYYY-MM-DD"` format.
- `dailyTotals` is used by the summary views. It returns one row per day that has at least one log entry — days with no entries are not included.

---

## Types

**File:** `src/db/types.ts`

| Type | Mirrors |
|---|---|
| `User` | `users` table row |
| `Food` | `foods` table row |
| `DailyLog` | `daily_logs` table row |
| `DailyLogWithFood` | `DailyLog` extended with `food_name` and `unit_label` from a JOIN |

Import types from `@/db` alongside the DAOs:

```ts
import type { Food, DailyLogWithFood } from "@/db"
```

Types are used as the return types of DAO methods and as inputs to server functions. They should not leak into client components — define separate view-model types for data that crosses the server/client boundary if the shapes diverge.

---

## Patterns to follow

### Always import from the barrel

```ts
// Correct
import { foodsDao } from "@/db"

// Wrong — bypasses the barrel, couples to the file path
import { foodsDao } from "@/db/foods.dao"
```

### Scope reads to the authenticated user

Every read query that returns user data must include a `userId` filter. Never fetch a row and then check ownership in JavaScript — filter in the query.

```ts
// Correct — the query only returns rows belonging to the user
const foods = await foodsDao.findAll(userId)

// Wrong — fetches all foods then filters in memory
const all = await foodsDao.findAll()
const mine = all.filter(f => f.user_id === userId)
```

### Verify ownership before mutations

`findById` and `delete` do not scope by `userId`. After fetching a row by id, confirm the calling user owns it before proceeding.

```ts
const food = await foodsDao.findById(id)
if (!food || food.user_id !== userId) {
  throw new Error("Not found")
}
await foodsDao.delete(id)
```

### Always use `RETURNING *` on writes

Insert and update methods return the persisted row. This ensures the caller always has the final state from the database (including server-side defaults like `created_at`) without a second query.

### Keep methods focused on a single operation

One method = one SQL statement. If you need to do two things, call two DAO methods from the server function. Do not write DAO methods that chain multiple queries unless they represent a genuine atomic operation that requires a transaction.

### Return `undefined` for missing single rows, not `null`

`findById` and `findByEmail` return `User | undefined` and `Food | undefined`. Returning `undefined` (not `null`) is consistent with the TypeScript convention of using `undefined` for "not present". The caller uses an explicit check before using the result.

---

## What to avoid

### Do not put business logic in a DAO

A DAO is not the right place to hash a password, validate input, enforce a calorie limit, or make decisions about what to do when a row is missing. That logic belongs in the server function.

```ts
// Wrong — hashing inside the DAO couples it to a security concern
async create(email: string, rawPassword: string): Promise<User> {
  const hashed = await bcrypt.hash(rawPassword, 10) // ← not here
  ...
}

// Correct — the server function hashes, the DAO stores
async create(email: string, hashedPassword: string): Promise<User> {
  ...
}
```

### Do not import DAOs in client code

Files in `src/db/` run only on the server. Importing them in a component, a hook, or any file without a `.server.ts` / `createServerFn` boundary will either crash at runtime or expose database credentials to the client bundle.

```ts
// Wrong — inside a React component or client-side hook
import { foodsDao } from "@/db"

// Correct — inside a createServerFn handler
import { foodsDao } from "@/db"
export const getFoods = createServerFn(...).handler(async () => {
  return foodsDao.findAll(userId)
})
```

### Do not write raw SQL outside of DAOs

If a server function needs data, add a method to the relevant DAO. Do not inline a `sql` template tag in a route loader or server function.

```ts
// Wrong — raw SQL leaking out of the DAO layer
import { sql } from "@/db"
const rows = await sql`SELECT * FROM foods WHERE user_id = ${id}`

// Correct — go through the DAO
import { foodsDao } from "@/db"
const foods = await foodsDao.findAll(id)
```

### Do not add a method for every conceivable query upfront

Only add DAO methods when there is a concrete server function that needs them. Adding unused query methods speculatively creates dead code and makes the DAO harder to read.

### Do not catch errors inside a DAO

Let errors propagate to the server function. The server function is responsible for deciding whether an error should return a 404, a 400, or be re-thrown. A DAO that swallows errors hides failures.

```ts
// Wrong
async findById(id: number) {
  try {
    const rows = await sql<Food[]>`SELECT * FROM foods WHERE id = ${id}`
    return rows[0]
  } catch {
    return undefined // ← silently hides a database error
  }
}

// Correct — let it throw
async findById(id: number) {
  const rows = await sql<Food[]>`SELECT * FROM foods WHERE id = ${id} LIMIT 1`
  return rows[0]
}
```

---

## Adding a new DAO

When a new database table is added via migration, follow these steps:

1. **Add the row type to `src/db/types.ts`**

```ts
export type WeightLog = {
  id: number
  user_id: number
  logged_at: string // "YYYY-MM-DD"
  weight_kg: number
  created_at: Date
}
```

2. **Create `src/db/weight-logs.dao.ts`**

```ts
// src/db/weight-logs.dao.ts
// SERVER-ONLY
import { sql } from "./index"
import type { WeightLog } from "./types"

export const weightLogsDao = {
  async findByUser(userId: number): Promise<WeightLog[]> {
    return sql<WeightLog[]>`
      SELECT * FROM weight_logs
      WHERE user_id = ${userId}
      ORDER BY logged_at DESC
    `
  },

  async create(userId: number, loggedAt: string, weightKg: number): Promise<WeightLog> {
    const rows = await sql<WeightLog[]>`
      INSERT INTO weight_logs (user_id, logged_at, weight_kg)
      VALUES (${userId}, ${loggedAt}, ${weightKg})
      RETURNING *
    `
    return rows[0]
  },

  async delete(id: number): Promise<void> {
    await sql`DELETE FROM weight_logs WHERE id = ${id}`
  },
}
```

3. **Re-export from `src/db/index.ts`**

```ts
export { weightLogsDao } from "./weight-logs.dao"
export type { WeightLog } from "./types"
```

4. **Use in a server function**

```ts
import { weightLogsDao } from "@/db"
```
