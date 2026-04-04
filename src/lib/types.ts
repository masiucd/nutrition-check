export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Maybe<T> = T | null | undefined
export type Either<T, U> = T | U
export type NonEmptyArray<T> = [T, ...T[]]

export type AwaitNullable<T> = Promise<Nullable<T>>
/**
 * Make all properties of T NonNullable. This removes both null and undefined.
 */
export type NonNullableProps<T> = {
	[P in keyof T]: T[P] extends null | undefined ? never : T[P]
}

/**
 * Checks if a value is non-nullable (i.e., not null or undefined).
 * Acts as a type guard, narrowing the type of `value` to `NonNullableProps<T>`
 * when the function returns `true`.
 *
 * @template T - The type of the value being checked.
 * @param {T} value - The value to check for nullability.
 * @returns {value is NonNullableProps<T>} `true` if the value is neither `null` nor `undefined`, otherwise `false`.
 *
 * @example
 * const value: string | null = "hello";
 * if (isNonNullable(value)) {
 *     console.log(value); // value is narrowed to string here
 * }
 */
export function isNonNullable<T>(value: T): value is NonNullableProps<T> {
	return value !== null && value !== undefined
}
