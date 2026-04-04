import {compare, hash} from "bcryptjs"

/**
 * Hashes a plain-text password using bcrypt.
 *
 * @param password - The plain-text password to hash.
 * @param salt - The salt rounds to use for hashing. Defaults to 8.
 * @returns A promise that resolves to the hashed password string.
 */
export async function hashPassword(password: string, salt = 8) {
	return await hash(password, salt)
}

/**
 * Compares a plain-text password against a hashed password.
 *
 * @param password - The plain-text password to verify.
 * @param hash - The hashed password to compare against.
 * @returns A promise that resolves to `true` if the password matches the hash, or `false` otherwise.
 */
export async function comparePassword(password: string, hash: string) {
	return await compare(password, hash)
}
