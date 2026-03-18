import {compare, hash} from "bcryptjs"

/**
 * Creates a secure bcrypt hash for a plain-text password.
 *
 * Use this before storing a user's password in the database.
 *
 * @param password - The plain-text password to hash.
 * @param salt - Number of bcrypt salt rounds (cost factor). Higher values are more secure but slower.
 * @returns A promise that resolves to the bcrypt hash of the password.
 */
export async function hashPassword(password: string, salt = 10): Promise<string> {
	return await hash(password, salt)
}

/**
 * Verifies whether a plain-text password matches a previously generated bcrypt hash.
 *
 * Use this during login/authentication checks.
 *
 * @param password - The plain-text password provided by the user.
 * @param hashedPassword - The stored bcrypt hash to compare against.
 * @returns A promise that resolves to `true` if the password matches, otherwise `false`.
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
	return await compare(password, hashedPassword)
}
