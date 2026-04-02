import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import type {NonEmptyArray} from "./types"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function notUndefined<T>(value: T | undefined): value is T {
	return value !== undefined
}

export function notNull<T>(value: T | null): value is T {
	return value !== null
}

export function isDefined<T>(value: T | null | undefined): value is T {
	return value != null
}

export function isFiniteNumber(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value)
}

export function isNonEmptyArray<T>(array: Array<T>): array is NonEmptyArray<T> {
	return array.length > 0
}

// Strips keys whose value is `undefined`, leaving null-valued keys intact.
// Drizzle only updates columns that appear in `.set()`, so this lets you
// distinguish "clear to null" (pass null) from "leave unchanged" (pass undefined).
export function omitUndefined<T extends Record<string, unknown>>(obj: T) {
	return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as {
		[K in keyof T]: Exclude<T[K], undefined>
	}
}

// Strips keys whose value is `null`, leaving undefined-valued keys intact.
// Drizzle only updates columns that appear in `.set()`, so this lets you
// distinguish "clear to undefined" (pass undefined) from "leave unchanged" (pass null).
export function omitNull<T extends Record<string, unknown>>(obj: T) {
	return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null)) as {
		[K in keyof T]: Exclude<T[K], null>
	}
}
