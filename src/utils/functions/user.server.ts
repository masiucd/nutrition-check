// Here we define only the server-side functions related to users
// Server-only helpers (DB queries, internal logic)
// These functions are not exposed to the client
// They are used internally by the server-side code
// For example, call DB queries or perform internal logic here

import {eq} from "drizzle-orm"
import {db} from "@/db/connect"
import {user} from "@/db/schema"

/**
 * Find a user by their email
 * @param email The email of the user to find
 * @returns The user or null if not found
 */
export async function findUserByEmail(email: string) {
	const existingUser = await db.select().from(user).where(eq(user.email, email)).limit(1)
	return existingUser.at(0) ?? null
}

/**
 * Find a user by their ID
 * @param id The ID of the user to find
 * @returns The user or null if not found
 **/
export async function findUserById(id: number) {
	const existingUser = await db.select().from(user).where(eq(user.id, id)).limit(1)
	return existingUser.at(0) ?? null
}

/**
 * Insert a new user into the database
 * @param userData The user data to insert
 * @returns The inserted user email and username if the insertion was successful, null otherwise
 */
export async function insertUser(userData: {username: string; email: string; password: string}) {
	const result = await db
		.insert(user)
		.values({
			username: userData.username,
			email: userData.email,
			passwordHash: userData.password,
		})
		.returning({
			username: user.username,
			email: user.email,
		})

	if (result.length > 0) {
		return result.at(0) ?? null
	}
	return null
}
