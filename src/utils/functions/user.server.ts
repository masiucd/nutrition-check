// Here we define only the server-side functions related to users
// Server-only helpers (DB queries, internal logic)
// These functions are not exposed to the client
// They are used internally by the server-side code
// For example, call DB queries or perform internal logic here

import {eq} from "drizzle-orm"
import {db} from "@/db/connect"
import {user, userInfo} from "@/db/schema"

/**
 * Find a user by their email
 * @param email The email of the user to find
 * @returns The user or null if not found
 */
export async function findUserByEmail(email: string) {
	const existingUser = await db
		.select({
			userId: user.id,
			username: user.username,
			email: user.email,
			firstName: userInfo.firstName,
			lastName: userInfo.lastName,
			age: userInfo.age,
			gender: userInfo.gender,
			password: user.passwordHash,
		})
		.from(user)
		.leftJoin(userInfo, eq(user.id, userInfo.id))
		.where(eq(user.email, email))
		.limit(1)
	return existingUser.at(0) ?? null
}

/**
 * Find a user by their ID
 * @param id The ID of the user to find
 * @returns The user or null if not found
 **/
export async function findUserById(id: number) {
	const existingUser = await db
		.select({
			userId: user.id,
			username: user.username,
			email: user.email,
			firstName: userInfo.firstName,
			lastName: userInfo.lastName,
			age: userInfo.age,
			gender: userInfo.gender,
		})
		.from(user)
		.leftJoin(userInfo, eq(user.id, userInfo.id))
		.where(eq(user.id, id))
		.limit(1)
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

interface UpdateUserRecord {
	userId: number
	username?: string
	email?: string
	firstName?: string
	lastName?: string
	age?: number
	gender?: "female" | "male"
}

export async function updateUser(record: UpdateUserRecord) {
	console.log(record)

	const result = await db.transaction(async tx => {
		const _userRows = await tx
			.update(user)
			.set({
				username: record.username,
				email: record.email,
			})
			.where(eq(user.id, record.userId))
			.returning({
				username: user.username,
				email: user.email,
			})
		const _userInfosRows = await tx
			.update(userInfo)
			.set({
				firstName: record.firstName,
				lastName: record.lastName,
				age: record.age,
				gender: !record ? null : record.gender === "female" ? 1 : 0,
			})
			.where(eq(userInfo.id, record.userId))
			.returning({
				firstName: userInfo.firstName,
				lastName: userInfo.lastName,
				age: userInfo.age,
				gender: userInfo.gender,
			})

		const updatedUser = _userRows.at(0) ?? null
		const updatedUserInfo = _userInfosRows.at(0) ?? null
		return updatedUser && updatedUserInfo ? {...updatedUser, ...updatedUserInfo} : null
	})

	return result
}
