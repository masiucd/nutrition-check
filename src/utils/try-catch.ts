// Type definitions for the result
type Success<T> = [T, null]
type Failure = [null, Error]
type Result<T> = Success<T> | Failure

// Overloaded function signatures
export function tryCatch<T>(fn: () => T): Result<T>
export function tryCatch<T>(fn: () => Promise<T>): Promise<Result<T>>
export function tryCatch<T, Args extends any[]>(fn: (...args: Args) => T, ...args: Args): Result<T>
export function tryCatch<T, Args extends any[]>(
	fn: (...args: Args) => Promise<T>,
	...args: Args
): Promise<Result<T>>

/**
 * Executes a function and returns a `Result` tuple where the first element is the value (or `null` on error) and the second is the error (or `null` on success).
 * @param fn
 * @param args
 * @returns  A `Result` tuple where the first element is the value (or `null` on error) and the second is the error (or `null` on success).
 * @example
 * ```ts
 * const [result, error] = tryCatch(() => {
 *    if (error) {
 *        // Handle error
 *    }
 *  // Use result
 * });
 * ```
 */
export function tryCatch<T, Args extends any[]>(
	fn: (...args: Args) => T | Promise<T>,
	...args: Args
): Result<T> | Promise<Result<T>> {
	try {
		const result = fn(...args)

		// Check if the result is a promise
		if (result instanceof Promise) {
			return result
				.then((value): Success<T> => [value, null])
				.catch(
					(error): Failure => [null, error instanceof Error ? error : new Error(String(error))],
				)
		}

		// Synchronous result
		return [result, null]
	} catch (error) {
		// Synchronous error
		return [null, error instanceof Error ? error : new Error(String(error))]
	}
}
