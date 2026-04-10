# Date & Time Handling — Project Guidelines

All date and time work in this project uses the **TC39 Temporal API** via the
`@js-temporal/polyfill` package. Native `Date` objects are only acceptable as
raw values coming out of the `postgres` driver (i.e. `created_at` / `updated_at`
columns). Convert them to Temporal types immediately at the boundary.

---

## Golden rules

1. **Never create a `new Date()`** anywhere in application code.
2. **Never use `Date.now()`** — use `Temporal.Now.instant()` instead.
3. **All logic runs in UTC.** No local-timezone arithmetic anywhere.
4. **`log_date` in the DB is a plain date string `"YYYY-MM-DD"`.** It has no
   time component and no timezone. Treat it with `Temporal.PlainDate`.
5. **`created_at` / `updated_at` from the DB are JS `Date` objects** returned
   by the `postgres` driver. Convert them with `instantFromJsDate()` at the DAO
   boundary, before passing values to server functions or the UI.
6. **Always import from `@/lib/date`**, never directly from
   `@js-temporal/polyfill`. This keeps the polyfill swap-out to a single file.

---

## Import pattern

```ts
// ✅ Correct — always import from the project's date module
import { Temporal, todayUtc, plainDateFromIso, formatDate } from "@/lib/date"

// ❌ Wrong — never import directly from the polyfill
import { Temporal } from "@js-temporal/polyfill"
```

---

## Type quick-reference

| Situation | Temporal type | Helper to create it |
|---|---|---|
| A calendar date with no time (`log_date`) | `Temporal.PlainDate` | `todayUtc()` · `plainDateFromIso(str)` |
| An exact point in time (`created_at`) | `Temporal.Instant` | `instantFromJsDate(date)` |
| An exact point in time + UTC offset info | `Temporal.ZonedDateTime` | `utcZonedFromJsDate(date)` |
| A wall-clock time only (no date) | `Temporal.PlainTime` | `Temporal.PlainTime.from(...)` |
| A duration / difference | `Temporal.Duration` | `Temporal.Duration.from(...)` |

---

## Common tasks

### Get today's date (UTC)

```ts
import { todayUtc } from "@/lib/date"

const today = todayUtc()          // Temporal.PlainDate
const iso   = today.toString()    // "2025-01-12"
```

### Convert a DB `log_date` string to a Temporal date

```ts
import { plainDateFromIso } from "@/lib/date"

const date = plainDateFromIso(log.log_date)  // Temporal.PlainDate
```

### Convert a Temporal date back to a DB string

```ts
import { isoFromPlainDate } from "@/lib/date"

const iso = isoFromPlainDate(date)  // "2025-01-12"  — pass to DAO
```

### Convert a DB `created_at` / `updated_at` JS Date

```ts
import { instantFromJsDate } from "@/lib/date"

const instant = instantFromJsDate(row.created_at)  // Temporal.Instant
```

### Format a date for display

```ts
import { formatDate, formatDateLong } from "@/lib/date"

formatDate(date)      // "12 Jan 2025"
formatDateLong(date)  // "Sunday, 12 January 2025"
```

### Format an instant (timestamp) for display

```ts
import { formatDateTime } from "@/lib/date"

formatDateTime(instant)  // "12 Jan 2025, 14:30 UTC"
```

### Navigate to the previous / next day

```ts
import { addDays, subtractDays } from "@/lib/date"

const tomorrow  = addDays(today, 1)
const yesterday = subtractDays(today, 1)

// or use Temporal directly
const yesterday = today.subtract({ days: 1 })
```

### Build a date range for `dailyTotals`

```ts
import { todayUtc, dateRangeIso, subtractDays } from "@/lib/date"

const today  = todayUtc()
const range  = dateRangeIso(subtractDays(today, 6), today)
// → { from: "2025-01-06", to: "2025-01-12" }

await dailyLogsDao.dailyTotals(userId, range.from, range.to)
```

### Check if a date is today

```ts
import { isToday } from "@/lib/date"

if (isToday(plainDateFromIso(log.log_date))) {
  // highlight today's entry
}
```

### Compare two dates

```ts
import { isBefore, isAfter } from "@/lib/date"

isBefore(a, b)  // true if a is earlier than b
isAfter(a, b)   // true if a is later than b

// Temporal also has a built-in comparator
Temporal.PlainDate.compare(a, b)  // -1 | 0 | 1
```

---

## DAO boundary pattern

DAOs receive and return plain strings for dates and JS `Date` objects for
timestamps. The conversion to Temporal always happens **outside** the DAO —
either in the server function or the component.

```ts
// server function — correct pattern
export const getLogsForDate = createServerFn({ method: "GET" })
  .validator(z.object({ date: z.string() }))
  .handler(async ({ data }) => {
    const session = await getAppSession()
    const userId  = session.data.userId
    if (!userId) throw new Error("Unauthenticated")

    // validate the incoming date string is a real calendar date
    const plainDate = plainDateFromIso(data.date)  // throws if invalid

    const rows = await dailyLogsDao.findByDate(userId, isoFromPlainDate(plainDate))
    return { error: null, data: rows, status: HttpStatusCode.OK }
  })
```

```ts
// component — convert timestamps at render time, never in the DAO
import { instantFromJsDate, formatDateTime } from "@/lib/date"

const createdAt = formatDateTime(instantFromJsDate(log.created_at))
```

---

## What NOT to do

```ts
// ❌ Using legacy Date
const today = new Date()
const iso   = today.toISOString().split("T")[0]

// ❌ Local-timezone arithmetic
const d = new Date()
d.setDate(d.getDate() + 1)

// ❌ String manipulation for date math
const tomorrow = `${year}-${month}-${day + 1}`

// ❌ Importing from the polyfill directly
import { Temporal } from "@js-temporal/polyfill"

// ❌ Passing a Temporal object to a DAO
await dailyLogsDao.findByDate(userId, plainDate)  // wrong — pass string
await dailyLogsDao.findByDate(userId, isoFromPlainDate(plainDate))  // ✅
```

---

## Switching to native Temporal

When Node ships stable Temporal (post-flag), the only file that needs updating
is `src/lib/date.ts`. Change the single import line:

```ts
// before
import { Temporal } from "@js-temporal/polyfill"

// after
// (no import needed — Temporal is a global)
```

Everything else in the codebase continues to work unchanged because all code
imports from `@/lib/date`.
