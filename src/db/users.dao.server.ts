// src/db/users.dao.ts
// SERVER-ONLY

import type {AwaitNullable} from "@/lib/types"
import {sql} from "./index"
import type {Food, User} from "./types"

export const usersDao = {
	/** Find a user by their email address. Returns undefined if not found. */
	async findByEmail(email: string): AwaitNullable<User> {
		const rows = await sql<User[]>`
			SELECT id,
			  email,
			  password,
			  is_admin,
			  created_at
			FROM users
			WHERE email = ${email}
			LIMIT 1
		`
		return firstItemOrNull(rows)
	},

	/** Find a user by their primary key. Returns null if not found. */
	async findById(id: number): AwaitNullable<User> {
		const rows = await sql<User[]>`
			SELECT
            u.id,
            u.email,
            u.password,
            u.is_admin,
            created_at,
            ud.first_name,
            ud.last_name
   			FROM users u
   			LEFT JOIN users_data ud ON u.id = ud.id
   			WHERE u.id = ${id}
   			LIMIT 1
		`
		return firstItemOrNull(rows)
	},

	/** Insert a new user. Returns the created row. */
	async create(email: string, hashedPassword: string): AwaitNullable<User> {
		const rows = await sql<User[]>`
			INSERT INTO users (email, password)
			VALUES (${email}, ${hashedPassword})
			RETURNING id,
			  email,
			  password,
			  is_admin,
			  created_at
		`
		return firstItemOrNull(rows)
	},

	/** Update a user's hashed password. Returns the updated row. */
	async updatePassword(id: number, hashedPassword: string): AwaitNullable<User> {
		const rows = await sql<User[]>`
			UPDATE users
			SET password = ${hashedPassword}
			WHERE id = ${id}
			RETURNING id,
			  email,
			  password,
			  is_admin,
			  created_at
		`
		return firstItemOrNull(rows)
	},

	/** Update a user's email address. Returns the updated row. */
	async updateEmail(id: number, email: string): AwaitNullable<User> {
		const rows = await sql<User[]>`
			UPDATE users
			SET email = ${email}
			WHERE id = ${id}
			RETURNING id,
			  email,
			  password,
			  is_admin,
			  created_at
		`
		return firstItemOrNull(rows)
	},

	// function to get all users food items
	async findAllFoodItems(userId: number): Promise<Food[]> {
		const rows = await sql<Food[]>`
			SELECT id,
			  user_id,
			  name,
			  calories_per_unit,
			  unit_label,
			  created_at,
			  updated_at
			FROM foods
			WHERE user_id = ${userId}
		`
		return rows
	},
}

function firstItemOrNull<T>(arr: T[]): T | null {
	return arr.length > 0 ? arr[0] : null
}
