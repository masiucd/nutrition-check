export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Maybe<T> = T | null | undefined
export type Either<T, U> = T | U
export type NonEmptyArray<T> = [T, ...T[]]
/**
 * Make all properties of T NonNullable. This removes both null and undefined.
 */
export type NonNullableProps<T> = {
	[P in keyof T]: T[P] extends null | undefined ? never : T[P]
}
