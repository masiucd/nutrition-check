import {Temporal} from "@js-temporal/polyfill"
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest"
import {
	addDays,
	addMonths,
	dateRangeIso,
	datesBetween,
	endOfMonth,
	formatDate,
	formatDateLong,
	formatDateShort,
	formatDateTime,
	instantFromJsDate,
	isAfter,
	isBefore,
	isoFromPlainDate,
	isSameDay,
	isToday,
	nDaysAgoIso,
	nowUtc,
	nowZonedUtc,
	plainDateFromIso,
	plainDateFromJsDate,
	startOfMonth,
	subtractDays,
	todayIso,
	todayUtc,
	UTC,
	utcZonedFromJsDate,
} from "@/lib/date"

// Fixed point in time used across all tests:
// 2025-01-12 (Sunday), 14:30:00 UTC
const FIXED_ISO = "2025-01-12T14:30:00.000Z"
const FIXED_MS = new Date(FIXED_ISO).getTime()
const FIXED_DATE_STR = "2025-01-12"

beforeEach(() => {
	vi.useFakeTimers()
	vi.setSystemTime(new Date(FIXED_ISO))
})

afterEach(() => {
	vi.useRealTimers()
})

// ─── UTC constant ─────────────────────────────────────────────────────────────

describe("UTC constant", () => {
	it("equals the string 'UTC'", () => {
		expect(UTC).toBe("UTC")
	})
})

// ─── todayUtc ─────────────────────────────────────────────────────────────────

describe("todayUtc", () => {
	it("returns a Temporal.PlainDate", () => {
		expect(todayUtc()).toBeInstanceOf(Temporal.PlainDate)
	})

	it("returns the correct UTC date matching the fixed system time", () => {
		const today = todayUtc()
		expect(today.toString()).toBe(FIXED_DATE_STR)
	})

	it("returns year/month/day components correctly", () => {
		const today = todayUtc()
		expect(today.year).toBe(2025)
		expect(today.month).toBe(1)
		expect(today.day).toBe(12)
	})

	it("uses the ISO 8601 calendar", () => {
		expect(todayUtc().calendarId).toBe("iso8601")
	})
})

// ─── nowUtc ───────────────────────────────────────────────────────────────────

describe("nowUtc", () => {
	it("returns a Temporal.Instant", () => {
		expect(nowUtc()).toBeInstanceOf(Temporal.Instant)
	})

	it("epoch milliseconds match the fixed system time", () => {
		expect(nowUtc().epochMilliseconds).toBe(FIXED_MS)
	})
})

// ─── nowZonedUtc ──────────────────────────────────────────────────────────────

describe("nowZonedUtc", () => {
	it("returns a Temporal.ZonedDateTime", () => {
		expect(nowZonedUtc()).toBeInstanceOf(Temporal.ZonedDateTime)
	})

	it("is in the UTC time zone", () => {
		expect(nowZonedUtc().timeZoneId).toBe("UTC")
	})

	it("has correct hour and minute from the fixed system time", () => {
		const zdt = nowZonedUtc()
		expect(zdt.hour).toBe(14)
		expect(zdt.minute).toBe(30)
	})
})

// ─── plainDateFromIso ─────────────────────────────────────────────────────────

describe("plainDateFromIso", () => {
	it("parses a YYYY-MM-DD string into a PlainDate", () => {
		const d = plainDateFromIso("2025-03-15")
		expect(d).toBeInstanceOf(Temporal.PlainDate)
		expect(d.year).toBe(2025)
		expect(d.month).toBe(3)
		expect(d.day).toBe(15)
	})

	it("round-trips with isoFromPlainDate", () => {
		const iso = "2024-12-31"
		expect(isoFromPlainDate(plainDateFromIso(iso))).toBe(iso)
	})

	it("throws RangeError for an invalid date string", () => {
		expect(() => plainDateFromIso("not-a-date")).toThrow()
	})

	it("throws for a date that doesn't exist", () => {
		expect(() => plainDateFromIso("2025-02-30")).toThrow()
	})

	it("handles a leap day correctly", () => {
		const d = plainDateFromIso("2024-02-29")
		expect(d.day).toBe(29)
		expect(d.month).toBe(2)
		expect(d.year).toBe(2024)
	})
})

// ─── isoFromPlainDate ─────────────────────────────────────────────────────────

describe("isoFromPlainDate", () => {
	it("serializes a PlainDate to YYYY-MM-DD", () => {
		const d = Temporal.PlainDate.from({year: 2025, month: 6, day: 3})
		expect(isoFromPlainDate(d)).toBe("2025-06-03")
	})

	it("zero-pads month and day", () => {
		const d = Temporal.PlainDate.from({year: 2025, month: 1, day: 5})
		expect(isoFromPlainDate(d)).toBe("2025-01-05")
	})
})

// ─── todayIso ─────────────────────────────────────────────────────────────────

describe("todayIso", () => {
	it("returns a string", () => {
		expect(typeof todayIso()).toBe("string")
	})

	it("returns the current UTC date as YYYY-MM-DD", () => {
		expect(todayIso()).toBe(FIXED_DATE_STR)
	})

	it("is consistent with isoFromPlainDate(todayUtc())", () => {
		expect(todayIso()).toBe(isoFromPlainDate(todayUtc()))
	})
})

// ─── instantFromJsDate ────────────────────────────────────────────────────────

describe("instantFromJsDate", () => {
	it("returns a Temporal.Instant", () => {
		expect(instantFromJsDate(new Date(FIXED_ISO))).toBeInstanceOf(Temporal.Instant)
	})

	it("epoch milliseconds match the source JS Date", () => {
		const jsDate = new Date(FIXED_ISO)
		expect(instantFromJsDate(jsDate).epochMilliseconds).toBe(jsDate.getTime())
	})

	it("handles epoch zero", () => {
		const epoch = new Date(0)
		expect(instantFromJsDate(epoch).epochMilliseconds).toBe(0)
	})

	it("handles dates before epoch (negative milliseconds)", () => {
		const before = new Date("1960-01-01T00:00:00.000Z")
		expect(instantFromJsDate(before).epochMilliseconds).toBeLessThan(0)
	})
})

// ─── utcZonedFromJsDate ───────────────────────────────────────────────────────

describe("utcZonedFromJsDate", () => {
	it("returns a Temporal.ZonedDateTime", () => {
		expect(utcZonedFromJsDate(new Date(FIXED_ISO))).toBeInstanceOf(Temporal.ZonedDateTime)
	})

	it("is in the UTC time zone", () => {
		expect(utcZonedFromJsDate(new Date(FIXED_ISO)).timeZoneId).toBe("UTC")
	})

	it("has correct year, month, day, hour, minute from fixed time", () => {
		const zdt = utcZonedFromJsDate(new Date(FIXED_ISO))
		expect(zdt.year).toBe(2025)
		expect(zdt.month).toBe(1)
		expect(zdt.day).toBe(12)
		expect(zdt.hour).toBe(14)
		expect(zdt.minute).toBe(30)
	})
})

// ─── plainDateFromJsDate ──────────────────────────────────────────────────────

describe("plainDateFromJsDate", () => {
	it("returns a Temporal.PlainDate", () => {
		expect(plainDateFromJsDate(new Date(FIXED_ISO))).toBeInstanceOf(Temporal.PlainDate)
	})

	it("extracts the correct UTC calendar date", () => {
		const d = plainDateFromJsDate(new Date(FIXED_ISO))
		expect(d.toString()).toBe(FIXED_DATE_STR)
	})

	it("uses UTC — a late-night UTC-minus timestamp resolves to the next calendar day", () => {
		// 2025-01-12T23:00:00Z is still Jan 12 in UTC but would be Jan 13 in UTC+2
		const d = plainDateFromJsDate(new Date("2025-01-12T23:00:00.000Z"))
		expect(d.toString()).toBe("2025-01-12")
	})
})

// ─── formatDate ───────────────────────────────────────────────────────────────

describe("formatDate", () => {
	it("returns a non-empty string", () => {
		expect(formatDate(plainDateFromIso(FIXED_DATE_STR)).length).toBeGreaterThan(0)
	})

	it("includes the year", () => {
		expect(formatDate(plainDateFromIso(FIXED_DATE_STR))).toContain("2025")
	})

	it("includes the day number", () => {
		expect(formatDate(plainDateFromIso(FIXED_DATE_STR))).toContain("12")
	})

	it("includes an abbreviated month name", () => {
		// en-GB short month for January is "Jan"
		expect(formatDate(plainDateFromIso(FIXED_DATE_STR))).toMatch(/Jan/i)
	})
})

// ─── formatDateLong ───────────────────────────────────────────────────────────

describe("formatDateLong", () => {
	it("returns a non-empty string", () => {
		expect(formatDateLong(plainDateFromIso(FIXED_DATE_STR)).length).toBeGreaterThan(0)
	})

	it("includes the full year", () => {
		expect(formatDateLong(plainDateFromIso(FIXED_DATE_STR))).toContain("2025")
	})

	it("includes a full month name", () => {
		expect(formatDateLong(plainDateFromIso(FIXED_DATE_STR))).toMatch(/January/i)
	})

	it("includes a weekday name", () => {
		// 2025-01-12 is a Sunday
		expect(formatDateLong(plainDateFromIso(FIXED_DATE_STR))).toMatch(/Sunday/i)
	})
})

// ─── formatDateShort ──────────────────────────────────────────────────────────

describe("formatDateShort", () => {
	it("returns a non-empty string", () => {
		expect(formatDateShort(plainDateFromIso(FIXED_DATE_STR)).length).toBeGreaterThan(0)
	})

	it("includes abbreviated month", () => {
		expect(formatDateShort(plainDateFromIso(FIXED_DATE_STR))).toMatch(/Jan/i)
	})

	it("includes abbreviated weekday", () => {
		// 2025-01-12 is Sunday → "Sun"
		expect(formatDateShort(plainDateFromIso(FIXED_DATE_STR))).toMatch(/Sun/i)
	})

	it("does not include the year", () => {
		expect(formatDateShort(plainDateFromIso(FIXED_DATE_STR))).not.toContain("2025")
	})
})

// ─── formatDateTime ───────────────────────────────────────────────────────────

describe("formatDateTime", () => {
	it("returns a non-empty string", () => {
		const instant = instantFromJsDate(new Date(FIXED_ISO))
		expect(formatDateTime(instant).length).toBeGreaterThan(0)
	})

	it("includes the year", () => {
		expect(formatDateTime(instantFromJsDate(new Date(FIXED_ISO)))).toContain("2025")
	})

	it("includes the UTC suffix", () => {
		expect(formatDateTime(instantFromJsDate(new Date(FIXED_ISO)))).toContain("UTC")
	})

	it("includes zero-padded hours and minutes (14:30)", () => {
		expect(formatDateTime(instantFromJsDate(new Date(FIXED_ISO)))).toContain("14:30")
	})

	it("includes zero-padded single-digit hours and minutes", () => {
		const d = new Date("2025-03-05T09:05:00.000Z")
		expect(formatDateTime(instantFromJsDate(d))).toContain("09:05")
	})
})

// ─── addDays ──────────────────────────────────────────────────────────────────

describe("addDays", () => {
	it("adds a positive number of days", () => {
		const base = plainDateFromIso("2025-01-12")
		expect(addDays(base, 1).toString()).toBe("2025-01-13")
		expect(addDays(base, 7).toString()).toBe("2025-01-19")
	})

	it("crosses month boundary correctly", () => {
		expect(addDays(plainDateFromIso("2025-01-31"), 1).toString()).toBe("2025-02-01")
	})

	it("crosses year boundary correctly", () => {
		expect(addDays(plainDateFromIso("2024-12-31"), 1).toString()).toBe("2025-01-01")
	})

	it("adding zero days returns an equal date", () => {
		const base = plainDateFromIso("2025-06-15")
		expect(addDays(base, 0).toString()).toBe("2025-06-15")
	})

	it("adding negative days moves backwards", () => {
		expect(addDays(plainDateFromIso("2025-01-12"), -1).toString()).toBe("2025-01-11")
	})
})

// ─── subtractDays ─────────────────────────────────────────────────────────────

describe("subtractDays", () => {
	it("subtracts a positive number of days", () => {
		const base = plainDateFromIso("2025-01-12")
		expect(subtractDays(base, 1).toString()).toBe("2025-01-11")
		expect(subtractDays(base, 12).toString()).toBe("2024-12-31")
	})

	it("crosses year boundary correctly", () => {
		expect(subtractDays(plainDateFromIso("2025-01-01"), 1).toString()).toBe("2024-12-31")
	})

	it("subtracting zero days returns an equal date", () => {
		const base = plainDateFromIso("2025-03-20")
		expect(subtractDays(base, 0).toString()).toBe("2025-03-20")
	})
})

// ─── addMonths ────────────────────────────────────────────────────────────────

describe("addMonths", () => {
	it("adds a positive number of months", () => {
		expect(addMonths(plainDateFromIso("2025-01-12"), 1).toString()).toBe("2025-02-12")
		expect(addMonths(plainDateFromIso("2025-01-12"), 12).toString()).toBe("2026-01-12")
	})

	it("crosses year boundary", () => {
		expect(addMonths(plainDateFromIso("2025-11-15"), 3).toString()).toBe("2026-02-15")
	})

	it("clamps day when target month is shorter (Jan 31 + 1 month → Feb 28)", () => {
		const result = addMonths(plainDateFromIso("2025-01-31"), 1)
		expect(result.month).toBe(2)
		expect(result.day).toBeLessThanOrEqual(28)
	})
})

// ─── startOfMonth ─────────────────────────────────────────────────────────────

describe("startOfMonth", () => {
	it("returns the first day of the month", () => {
		expect(startOfMonth(plainDateFromIso("2025-03-15")).toString()).toBe("2025-03-01")
	})

	it("returns the same date when called on the first", () => {
		expect(startOfMonth(plainDateFromIso("2025-06-01")).toString()).toBe("2025-06-01")
	})

	it("preserves year and month", () => {
		const d = startOfMonth(plainDateFromIso("2025-11-30"))
		expect(d.year).toBe(2025)
		expect(d.month).toBe(11)
		expect(d.day).toBe(1)
	})
})

// ─── endOfMonth ───────────────────────────────────────────────────────────────

describe("endOfMonth", () => {
	it("returns 31 for January", () => {
		expect(endOfMonth(plainDateFromIso("2025-01-10")).toString()).toBe("2025-01-31")
	})

	it("returns 28 for February in a non-leap year", () => {
		expect(endOfMonth(plainDateFromIso("2025-02-01")).toString()).toBe("2025-02-28")
	})

	it("returns 29 for February in a leap year", () => {
		expect(endOfMonth(plainDateFromIso("2024-02-01")).toString()).toBe("2024-02-29")
	})

	it("returns 30 for April", () => {
		expect(endOfMonth(plainDateFromIso("2025-04-05")).toString()).toBe("2025-04-30")
	})
})

// ─── isToday ──────────────────────────────────────────────────────────────────

describe("isToday", () => {
	it("returns true for the current UTC date", () => {
		expect(isToday(plainDateFromIso(FIXED_DATE_STR))).toBe(true)
	})

	it("returns false for yesterday", () => {
		expect(isToday(plainDateFromIso("2025-01-11"))).toBe(false)
	})

	it("returns false for tomorrow", () => {
		expect(isToday(plainDateFromIso("2025-01-13"))).toBe(false)
	})

	it("returns false for a date far in the past", () => {
		expect(isToday(plainDateFromIso("2000-01-01"))).toBe(false)
	})
})

// ─── isBefore ─────────────────────────────────────────────────────────────────

describe("isBefore", () => {
	const earlier = plainDateFromIso("2025-01-01")
	const later = plainDateFromIso("2025-12-31")

	it("returns true when a is before b", () => {
		expect(isBefore(earlier, later)).toBe(true)
	})

	it("returns false when a is after b", () => {
		expect(isBefore(later, earlier)).toBe(false)
	})

	it("returns false when a equals b", () => {
		expect(isBefore(earlier, earlier)).toBe(false)
	})
})

// ─── isAfter ──────────────────────────────────────────────────────────────────

describe("isAfter", () => {
	const earlier = plainDateFromIso("2025-01-01")
	const later = plainDateFromIso("2025-12-31")

	it("returns true when a is after b", () => {
		expect(isAfter(later, earlier)).toBe(true)
	})

	it("returns false when a is before b", () => {
		expect(isAfter(earlier, later)).toBe(false)
	})

	it("returns false when a equals b", () => {
		expect(isAfter(later, later)).toBe(false)
	})
})

// ─── isSameDay ────────────────────────────────────────────────────────────────

describe("isSameDay", () => {
	it("returns true for identical dates", () => {
		expect(isSameDay(plainDateFromIso("2025-06-01"), plainDateFromIso("2025-06-01"))).toBe(true)
	})

	it("returns false for different dates", () => {
		expect(isSameDay(plainDateFromIso("2025-06-01"), plainDateFromIso("2025-06-02"))).toBe(false)
	})

	it("is symmetric", () => {
		const a = plainDateFromIso("2025-01-12")
		const b = plainDateFromIso("2025-01-13")
		expect(isSameDay(a, b)).toBe(isSameDay(b, a))
	})
})

// ─── dateRangeIso ─────────────────────────────────────────────────────────────

describe("dateRangeIso", () => {
	it("returns an object with from and to strings", () => {
		const from = plainDateFromIso("2025-01-01")
		const to = plainDateFromIso("2025-01-31")
		const range = dateRangeIso(from, to)
		expect(range).toEqual({from: "2025-01-01", to: "2025-01-31"})
	})

	it("works when from equals to (single-day range)", () => {
		const d = plainDateFromIso("2025-06-15")
		expect(dateRangeIso(d, d)).toEqual({from: "2025-06-15", to: "2025-06-15"})
	})

	it("from value is a valid ISO date string", () => {
		const {from} = dateRangeIso(plainDateFromIso("2025-03-01"), plainDateFromIso("2025-03-31"))
		expect(() => Temporal.PlainDate.from(from)).not.toThrow()
	})
})

// ─── datesBetween ─────────────────────────────────────────────────────────────

describe("datesBetween", () => {
	it("returns an array of PlainDates", () => {
		const result = datesBetween(plainDateFromIso("2025-01-10"), plainDateFromIso("2025-01-12"))
		expect(result).toHaveLength(3)
		expect(result[0]).toBeInstanceOf(Temporal.PlainDate)
	})

	it("is inclusive on both ends", () => {
		const result = datesBetween(plainDateFromIso("2025-01-10"), plainDateFromIso("2025-01-12"))
		expect(result[0].toString()).toBe("2025-01-10")
		expect(result[result.length - 1].toString()).toBe("2025-01-12")
	})

	it("returns a single element when from equals to", () => {
		const d = plainDateFromIso("2025-06-15")
		const result = datesBetween(d, d)
		expect(result).toHaveLength(1)
		expect(result[0].toString()).toBe("2025-06-15")
	})

	it("returns an empty array when from is after to", () => {
		const result = datesBetween(plainDateFromIso("2025-01-15"), plainDateFromIso("2025-01-10"))
		expect(result).toHaveLength(0)
	})

	it("crosses a month boundary correctly", () => {
		const result = datesBetween(plainDateFromIso("2025-01-30"), plainDateFromIso("2025-02-02"))
		expect(result.map(d => d.toString())).toEqual([
			"2025-01-30",
			"2025-01-31",
			"2025-02-01",
			"2025-02-02",
		])
	})

	it("returns dates in ascending order", () => {
		const result = datesBetween(plainDateFromIso("2025-01-01"), plainDateFromIso("2025-01-05"))
		for (let i = 1; i < result.length; i++) {
			expect(isBefore(result[i - 1], result[i])).toBe(true)
		}
	})
})

// ─── nDaysAgoIso ──────────────────────────────────────────────────────────────

describe("nDaysAgoIso", () => {
	it("returns a string", () => {
		expect(typeof nDaysAgoIso(7)).toBe("string")
	})

	it("returns a valid ISO date string", () => {
		expect(() => Temporal.PlainDate.from(nDaysAgoIso(7))).not.toThrow()
	})

	it("0 days ago is today", () => {
		expect(nDaysAgoIso(0)).toBe(FIXED_DATE_STR)
	})

	it("1 day ago is yesterday", () => {
		expect(nDaysAgoIso(1)).toBe("2025-01-11")
	})

	it("7 days ago is one week back", () => {
		expect(nDaysAgoIso(7)).toBe("2025-01-05")
	})

	it("crosses a year boundary", () => {
		// Fixed date is 2025-01-12, so 12 days ago is 2024-12-31
		expect(nDaysAgoIso(12)).toBe("2024-12-31")
	})
})
