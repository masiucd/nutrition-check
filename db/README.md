# Database Migrations

This project uses **[dbmate](https://github.com/amacneil/dbmate)** for schema migrations. Migrations are plain `.sql` files — no ORM, no DSL. dbmate tracks which migrations have been applied and generates a `schema.sql` snapshot after every run.

---

## Table of contents

1. [Prerequisites](#prerequisites)
2. [Configuration](#configuration)
3. [Commands](#commands)
4. [How to create and apply a migration](#how-to-create-and-apply-a-migration)
5. [How to roll back a migration](#how-to-roll-back-a-migration)
6. [Migration file format](#migration-file-format)
7. [Step-by-step patterns](#step-by-step-patterns)
   - [Adding a new table](#pattern-adding-a-new-table)
   - [Adding a column](#pattern-adding-a-column)
   - [Renaming a column](#pattern-renaming-a-column)
   - [Dropping a column](#pattern-dropping-a-column)
   - [Adding an index](#pattern-adding-an-index)
   - [Changing a constraint](#pattern-changing-a-constraint)
8. [The schema.sql file](#the-schemasql-file)
9. [Rules](#rules)
10. [Current schema](#current-schema)

---

## Prerequisites

- PostgreSQL running locally at `localhost:5444`
- `.env` present at the project root (see [Configuration](#configuration))
- Dependencies installed: `pnpm install`

---

## Configuration

Two variables in `.env` control dbmate. Both are already set:

```sh
DATABASE_URL=postgresql://root:root@localhost:5444/postgres
DBMATE_MIGRATIONS_DIR=db/migrations
```

dbmate reads `.env` automatically — no extra flags or env exports needed.

---

## Commands

| Script | What it does |
|---|---|
| `pnpm migrate:status` | Show all migrations and whether each is applied or pending |
| `pnpm migrate:up` | Apply every pending migration in order |
| `pnpm migrate:down` | Roll back the single most recently applied migration |
| `pnpm migrate:new <name>` | Create a new blank migration file with a UTC timestamp |

---

## How to create and apply a migration

### Step 1 — generate the file

```sh
pnpm migrate:new <descriptive_name>
```

Use `snake_case` and describe what the migration does, not what table it touches.

```sh
pnpm migrate:new add_calorie_goal_to_users
pnpm migrate:new create_sessions_table
pnpm migrate:new drop_legacy_api_key_column
```

This creates a file in `db/migrations/` with a UTC timestamp prefix:

```
db/migrations/20260403153000_add_calorie_goal_to_users.sql
```

### Step 2 — write the SQL

Open the generated file and fill in both blocks:

```sql
-- migrate:up

ALTER TABLE users ADD COLUMN calorie_goal INTEGER;

-- migrate:down

ALTER TABLE users DROP COLUMN calorie_goal;
```

Both blocks are required. See [Migration file format](#migration-file-format) for detail.

### Step 3 — verify it shows as pending

```sh
pnpm migrate:status
```

Expected output:

```
[X] 20260402000000_initial_schema.sql
[ ] 20260403153000_add_calorie_goal_to_users.sql

Applied: 1
Pending: 1
```

### Step 4 — apply

```sh
pnpm migrate:up
```

Expected output:

```
Applying: 20260403153000_add_calorie_goal_to_users.sql
Applied:  20260403153000_add_calorie_goal_to_users.sql in 23ms
Writing:  ./db/schema.sql
```

### Step 5 — commit

Always commit the migration file and the updated `schema.sql` together:

```sh
git add db/migrations/20260403153000_add_calorie_goal_to_users.sql db/schema.sql
git commit -m "add calorie_goal column to users"
```

---

## How to roll back a migration

`migrate:down` rolls back exactly **one** migration — the most recently applied one.

```sh
pnpm migrate:down
```

Expected output:

```
Rolling back: 20260403153000_add_calorie_goal_to_users.sql
Rolled back:  20260403153000_add_calorie_goal_to_users.sql in 18ms
Writing:      ./db/schema.sql
```

To roll back multiple migrations, run `migrate:down` once per migration in reverse order. There is no "roll back everything" command — this is intentional.

After rolling back, verify the state:

```sh
pnpm migrate:status
```

> **Never roll back a migration that has been applied on another machine or pushed to a shared environment.** Roll back is a local development tool. In production, always move forward with a new corrective migration.

---

## Migration file format

Every migration file has exactly two sections separated by SQL comments:

```sql
-- migrate:up

<SQL to apply the change>

-- migrate:down

<SQL to reverse the change>
```

Both sections are mandatory. The `-- migrate:up` and `-- migrate:down` markers must appear exactly as shown — dbmate parses them literally.

Multiple statements are allowed in each block. They all run inside a single transaction, so if any statement fails the entire migration is rolled back automatically.

```sql
-- migrate:up

CREATE TABLE sessions (
  id         TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX sessions_user_id_idx ON sessions(user_id);
CREATE INDEX sessions_expires_at_idx ON sessions(expires_at);

-- migrate:down

DROP TABLE IF EXISTS sessions;
```

---

## Step-by-step patterns

### Pattern: adding a new table

```sh
pnpm migrate:new create_<table_name>
```

```sql
-- migrate:up

CREATE TABLE weight_logs (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  logged_at  DATE NOT NULL,
  weight_kg  NUMERIC(5, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX weight_logs_user_id_idx ON weight_logs(user_id);

-- migrate:down

DROP TABLE IF EXISTS weight_logs;
```

Down migration: drop the table. `IF EXISTS` prevents an error if the down migration is run twice by accident.

---

### Pattern: adding a column

```sh
pnpm migrate:new add_<column>_to_<table>
```

```sql
-- migrate:up

ALTER TABLE users ADD COLUMN calorie_goal INTEGER;

-- migrate:down

ALTER TABLE users DROP COLUMN calorie_goal;
```

If the column must be `NOT NULL` on a table that already has rows, provide a default so existing rows are valid:

```sql
-- migrate:up

ALTER TABLE users
  ADD COLUMN calorie_goal INTEGER NOT NULL DEFAULT 2000;

-- migrate:down

ALTER TABLE users DROP COLUMN calorie_goal;
```

---

### Pattern: renaming a column

```sh
pnpm migrate:new rename_<old>_to_<new>_in_<table>
```

```sql
-- migrate:up

ALTER TABLE foods RENAME COLUMN calories_per_unit TO kcal_per_unit;

-- migrate:down

ALTER TABLE foods RENAME COLUMN kcal_per_unit TO calories_per_unit;
```

---

### Pattern: dropping a column

```sh
pnpm migrate:new drop_<column>_from_<table>
```

```sql
-- migrate:up

ALTER TABLE users DROP COLUMN IF EXISTS legacy_token;

-- migrate:down

-- Data is permanently lost on up; restore the column structure only.
ALTER TABLE users ADD COLUMN legacy_token TEXT;
```

> Dropping a column is destructive. The down migration can recreate the column but cannot restore the data. Make sure you no longer need the data before applying.

---

### Pattern: adding an index

```sh
pnpm migrate:new add_index_on_<table>_<column>
```

```sql
-- migrate:up

CREATE INDEX daily_logs_meal_idx ON daily_logs(user_id, meal);

-- migrate:down

DROP INDEX IF EXISTS daily_logs_meal_idx;
```

For a large table where you cannot afford a full table lock during the migration, use `CONCURRENTLY`. Note that `CONCURRENTLY` cannot run inside a transaction, so you must disable the transaction wrapper:

```sql
-- migrate:up

-- dbmate:disable-transaction
CREATE INDEX CONCURRENTLY daily_logs_meal_idx ON daily_logs(user_id, meal);

-- migrate:down

DROP INDEX CONCURRENTLY IF EXISTS daily_logs_meal_idx;
```

---

### Pattern: changing a constraint

To change a `CHECK` constraint you must drop and recreate it. Constraints cannot be altered in-place in PostgreSQL.

```sh
pnpm migrate:new update_meal_check_constraint
```

```sql
-- migrate:up

ALTER TABLE daily_logs DROP CONSTRAINT daily_logs_meal_check;
ALTER TABLE daily_logs ADD CONSTRAINT daily_logs_meal_check
  CHECK (meal IN ('breakfast', 'lunch', 'dinner', 'snacks', 'drinks'));

-- migrate:down

ALTER TABLE daily_logs DROP CONSTRAINT daily_logs_meal_check;
ALTER TABLE daily_logs ADD CONSTRAINT daily_logs_meal_check
  CHECK (meal IN ('breakfast', 'lunch', 'dinner', 'snacks'));
```

---

## The schema.sql file

`db/schema.sql` is a full dump of the current database schema. dbmate regenerates it automatically after every `migrate:up` and `migrate:down`.

- **Commit it.** It provides a single-file view of the current schema without needing to run any migrations or connect to a database.
- **Never edit it manually.** It is always overwritten by dbmate.
- It includes the contents of the `schema_migrations` table at the bottom, so you can see exactly which migrations have been applied.

---

## Rules

1. **Never edit an applied migration.** Once a migration has been committed and run, treat it as immutable. To change something, create a new migration.
2. **Always write both `up` and `down` blocks.** Even for destructive operations — document what the reversal looks like.
3. **Commit migration files and `schema.sql` together** in the same commit.
4. **Use descriptive names.** The filename is the only documentation at a glance. `add_calorie_goal_to_users` is good; `update_users` is not.
5. **Do not run `migrate:down` in shared environments.** Roll back is for local development only. In staging or production, always move forward.
6. **One logical change per migration.** Keep migrations focused. Mixing unrelated changes makes rollbacks harder.

---

## Current schema

| Table | Purpose |
|---|---|
| `users` | Registered accounts — email and hashed password |
| `foods` | User's personal food library — name, calories per unit, unit label |
| `daily_logs` | Individual log entries — food, date, meal slot, quantity, computed calories |

Full column definitions, constraints, and indexes are in `db/schema.sql`.
