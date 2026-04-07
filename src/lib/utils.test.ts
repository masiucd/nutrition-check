import {describe, expect, it} from "vitest"
import {cn} from "./utils"

describe("cn", () => {
	it("returns an empty string when no inputs are provided", () => {
		expect(cn()).toBe("")
	})

	it("merges multiple class names into a single string", () => {
		expect(cn("foo", "bar")).toBe("foo bar")
	})

	it("ignores falsy values", () => {
		expect(cn("foo", false && "bar", "baz")).toBe("foo baz")
		expect(cn("foo", undefined, null, "baz")).toBe("foo baz")
	})

	it("resolves tailwind conflicts by keeping the last value", () => {
		expect(cn("p-2", "p-4")).toBe("p-4")
		expect(cn("text-sm", "text-lg")).toBe("text-lg")
	})

	it("handles object syntax from clsx", () => {
		expect(cn({foo: true, bar: false})).toBe("foo")
	})
})
