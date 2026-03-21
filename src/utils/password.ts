import {compare, hash} from "bcryptjs"

/**
 *
 * @param password The password to hash
 * @param salt The number of salt rounds to use
 * @returns The hashed password
 */
export async function hashPassword(password: string, salt = 8): Promise<string> {
	return hash(password, salt)
}

/**
 *
 * @param password The password to compare
 * @param hash The hashed password to compare against
 * @returns True if the password matches the hash, false otherwise
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
	return compare(password, hash)
}
