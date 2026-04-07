import {describe, expect, it} from "vitest"
import {isNonNullable} from "./types"

describe("isNonNullable", () => {
	it("returns true for a non-empty string", () => {
		expect(isNonNullable("hello")).toBe(true)
	})

	it("returns true for the number zero", () => {
		expect(isNonNullable(0)).toBe(true)
	})

	it("returns true for false", () => {
		expect(isNonNullable(false)).toBe(true)
	})

	it("returns true for an object", () => {
		expect(isNonNullable({})).toBe(true)
	})

	it("returns true for an empty array", () => {
		expect(isNonNullable([])).toBe(true)
	})

	it("returns false for null", () => {
		expect(isNonNullable(null)).toBe(false)
	})

	it("returns false for undefined", () => {
		expect(isNonNullable(undefined)).toBe(false)
	})
})
