/**
 * src/lib/date.ts
 *
 * All date/time utilities for the app.
 *
 * Rules
 * ─────
 * • Always import `Temporal` (and helpers) from "@/lib/date" — never directly
 *   from "@js-temporal/polyfill" or the native global.
 * • All instants / wall-clock math use UTC.
 * • Dates stored in the DB (log_date) are plain ISO strings "YYYY-MM-DD".
 *   Convert them with `plainDateFromIso` / `isoFromPlainDate`.
 * • JS `Date` objects (postgres created_at / updated_at) are converted with
 *   `instantFromJsDate`.  Never use `new Date()` for logic — convert first.
 */

import {Temporal} from "@js-temporal/polyfill"

// Re-export so callers can use Temporal types without touching the polyfill.
export {Temporal}

// ─── Constants ────────────────────────────────────────────────────────────────

export const UTC = "UTC" as const

// ─── Today / now ──────────────────────────────────────────────────────────────

/**
 * Today's date in UTC as a `Temporal.PlainDate`.
 * Use this everywhere you need "today" — never `new Date()`.
 *
 * @example
 * const today = todayUtc()   // Temporal.PlainDate { 2025-01-12 }
 */
export function todayUtc(): Temporal.PlainDate {
	return Temporal.Now.plainDateISO(UTC)
}

/**
 * The current UTC instant.
 * Use for timestamping events; prefer instants over zoned datetimes where
 * timezone-specific display is not needed.
 *
 * @example
 * const now = nowUtc()  // Temporal.Instant
 */
export function nowUtc(): Temporal.Instant {
	return Temporal.Now.instant()
}

/**
 * The current date-time in UTC as a `Temporal.ZonedDateTime`.
 * Use when you need both date and time components in UTC.
 */
export function nowZonedUtc(): Temporal.ZonedDateTime {
	return Temporal.Now.zonedDateTimeISO(UTC)
}

// ─── Conversions from / to DB strings ─────────────────────────────────────────

/**
 * Parse a "YYYY-MM-DD" string (as stored in `daily_logs.log_date`) into a
 * `Temporal.PlainDate`.
 *
 * @throws {RangeError} if the string is not a valid ISO date.
 *
 * @example
 * const d = plainDateFromIso("2025-01-12")
 */
export function plainDateFromIso(iso: string): Temporal.PlainDate {
	return Temporal.PlainDate.from(iso)
}

/**
 * Serialize a `Temporal.PlainDate` back to a "YYYY-MM-DD" string for use in
 * SQL queries and DAO calls.
 *
 * @example
 * isoFromPlainDate(todayUtc())  // "2025-01-12"
 */
export function isoFromPlainDate(date: Temporal.PlainDate): string {
	return date.toString()
}

/**
 * Convenience: today's date as a "YYYY-MM-DD" string, ready for DAO calls.
 *
 * @example
 * await dailyLogsDao.findByDate(userId, todayIso())
 */
export function todayIso(): string {
	return isoFromPlainDate(todayUtc())
}

// ─── Conversions from JS Date (postgres driver output) ────────────────────────

/**
 * Convert a JS `Date` (e.g. `created_at` / `updated_at` from the postgres
 * driver) to a `Temporal.Instant`.
 *
 * @example
 * const ts = instantFromJsDate(row.created_at)
 */
export function instantFromJsDate(date: Date): Temporal.Instant {
	return Temporal.Instant.fromEpochMilliseconds(date.getTime())
}

/**
 * Convert a JS `Date` to a UTC `Temporal.ZonedDateTime`.
 * Use when you need to read individual date/time fields (year, month, hour…).
 *
 * @example
 * const zdt = utcZonedFromJsDate(row.created_at)
 * console.log(zdt.year, zdt.hour)
 */
export function utcZonedFromJsDate(date: Date): Temporal.ZonedDateTime {
	return instantFromJsDate(date).toZonedDateTimeISO(UTC)
}

/**
 * Extract the calendar date (UTC) from a JS `Date`.
 * Useful when you want only the date portion of a `created_at` timestamp.
 *
 * @example
 * const logDay = plainDateFromJsDate(row.created_at) // Temporal.PlainDate
 */
export function plainDateFromJsDate(date: Date): Temporal.PlainDate {
	return utcZonedFromJsDate(date).toPlainDate()
}

// ─── Display formatting ────────────────────────────────────────────────────────

/**
 * Short human-readable date: "12 Jan 2025".
 *
 * @example
 * formatDate(todayUtc())  // "12 Jan 2025"
 */
export function formatDate(date: Temporal.PlainDate): string {
	return date.toLocaleString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
	})
}

/**
 * Long human-readable date: "Monday, 12 January 2025".
 *
 * @example
 * formatDateLong(todayUtc())  // "Monday, 12 January 2025"
 */
export function formatDateLong(date: Temporal.PlainDate): string {
	return date.toLocaleString("en-GB", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	})
}

/**
 * Short weekday + date: "Mon 12 Jan".
 * Useful in compact UI elements like day headers.
 *
 * @example
 * formatDateShort(todayUtc())  // "Mon 12 Jan"
 */
export function formatDateShort(date: Temporal.PlainDate): string {
	return date.toLocaleString("en-GB", {
		weekday: "short",
		day: "numeric",
		month: "short",
	})
}

/**
 * Format a `Temporal.Instant` (or `created_at` JS Date) as a UTC datetime
 * string: "12 Jan 2025, 14:30 UTC".
 *
 * @example
 * formatDateTime(instantFromJsDate(row.created_at))  // "12 Jan 2025, 14:30 UTC"
 */
export function formatDateTime(instant: Temporal.Instant): string {
	const zdt = instant.toZonedDateTimeISO(UTC)
	const datePart = zdt.toPlainDate().toLocaleString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
	})
	const hh = String(zdt.hour).padStart(2, "0")
	const mm = String(zdt.minute).padStart(2, "0")
	return `${datePart}, ${hh}:${mm} UTC`
}

// ─── Date arithmetic ───────────────────────────────────────────────────────────

/**
 * Return a new `PlainDate` that is `days` calendar days after `date`.
 *
 * @example
 * addDays(todayUtc(), 7)   // one week from today
 */
export function addDays(date: Temporal.PlainDate, days: number): Temporal.PlainDate {
	return date.add({days})
}

/**
 * Return a new `PlainDate` that is `days` calendar days before `date`.
 *
 * @example
 * subtractDays(todayUtc(), 1)  // yesterday
 */
export function subtractDays(date: Temporal.PlainDate, days: number): Temporal.PlainDate {
	return date.subtract({days})
}

/**
 * Return a new `PlainDate` that is `months` calendar months after `date`.
 * The day is clamped when the target month is shorter (e.g. Jan 31 + 1 month → Feb 28/29).
 */
export function addMonths(date: Temporal.PlainDate, months: number): Temporal.PlainDate {
	return date.add({months})
}

/**
 * Return the first day of the month for a given `PlainDate`.
 *
 * @example
 * startOfMonth(plainDateFromIso("2025-03-15"))  // 2025-03-01
 */
export function startOfMonth(date: Temporal.PlainDate): Temporal.PlainDate {
	return date.with({day: 1})
}

/**
 * Return the last day of the month for a given `PlainDate`.
 *
 * @example
 * endOfMonth(plainDateFromIso("2025-03-15"))  // 2025-03-31
 */
export function endOfMonth(date: Temporal.PlainDate): Temporal.PlainDate {
	return date.with({day: date.daysInMonth})
}

// ─── Comparisons ──────────────────────────────────────────────────────────────

/**
 * Returns `true` if `date` equals today in UTC.
 *
 * @example
 * isToday(plainDateFromIso(log.log_date))
 */
export function isToday(date: Temporal.PlainDate): boolean {
	return Temporal.PlainDate.compare(date, todayUtc()) === 0
}

/**
 * Returns `true` if `a` is strictly before `b`.
 *
 * @example
 * isBefore(plainDateFromIso("2025-01-01"), todayUtc())  // true
 */
export function isBefore(a: Temporal.PlainDate, b: Temporal.PlainDate): boolean {
	return Temporal.PlainDate.compare(a, b) < 0
}

/**
 * Returns `true` if `a` is strictly after `b`.
 */
export function isAfter(a: Temporal.PlainDate, b: Temporal.PlainDate): boolean {
	return Temporal.PlainDate.compare(a, b) > 0
}

/**
 * Returns `true` if `a` and `b` represent the same calendar date.
 */
export function isSameDay(a: Temporal.PlainDate, b: Temporal.PlainDate): boolean {
	return Temporal.PlainDate.compare(a, b) === 0
}

// ─── Range helpers ─────────────────────────────────────────────────────────────

/**
 * Produce the ISO string pair `{ from, to }` expected by DAO range queries
 * (e.g. `dailyLogsDao.dailyTotals`).
 *
 * @example
 * const range = dateRangeIso(startOfMonth(todayUtc()), todayUtc())
 * await dailyLogsDao.dailyTotals(userId, range.from, range.to)
 */
export function dateRangeIso(
	from: Temporal.PlainDate,
	to: Temporal.PlainDate,
): {from: string; to: string} {
	return {
		from: isoFromPlainDate(from),
		to: isoFromPlainDate(to),
	}
}

/**
 * Generate every `PlainDate` between `from` and `to` (inclusive) in
 * chronological order.
 * Useful for building calendar UIs or filling gaps in chart data.
 *
 * @example
 * const days = datesBetween(startOfMonth(todayUtc()), todayUtc())
 */
export function datesBetween(
	from: Temporal.PlainDate,
	to: Temporal.PlainDate,
): Temporal.PlainDate[] {
	const result: Temporal.PlainDate[] = []
	let cursor = from
	while (!isAfter(cursor, to)) {
		result.push(cursor)
		cursor = addDays(cursor, 1)
	}
	return result
}

/**
 * Return the ISO string for `n` days ago from today in UTC.
 * Handy shortcut for quick range queries.
 *
 * @example
 * nDaysAgoIso(7)  // "2025-01-05"  (if today is 2025-01-12)
 */
export function nDaysAgoIso(n: number): string {
	return isoFromPlainDate(subtractDays(todayUtc(), n))
}
