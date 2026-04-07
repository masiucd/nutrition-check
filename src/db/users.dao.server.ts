// src/db/users.dao.ts
// SERVER-ONLY

import type {AwaitNullable} from "@/lib/types"
import {sql} from "./index"
import type {User} from "./types"

export const usersDao = {
	/** Find a user by their email address. Returns undefined if not found. */
	async findByEmail(email: string): Promise<User | undefined> {
		const rows = await sql<User[]>`
			SELECT id,
			  email,
			  password,
			  created_at
			FROM users
			WHERE email = ${email}
			LIMIT 1
		`
		return rows[0]
	},

	/** Find a user by their primary key. Returns null if not found. */
	async findById(id: number): AwaitNullable<User> {
		const rows = await sql<User[]>`
			SELECT id,
			  email,
			  password,
			  created_at
			FROM users
			WHERE id = ${id}
			LIMIT 1
		`
		return rows.at(0) ?? null
	},

	/** Insert a new user. Returns the created row. */
	async create(email: string, hashedPassword: string): AwaitNullable<User> {
		const rows = await sql<User[]>`
			INSERT INTO users (email, password)
			VALUES (${email}, ${hashedPassword})
			RETURNING id,
			  email,
			  password,
			  created_at
		`
		return rows[0] ?? null
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
			  created_at
		`
		return rows[0] ?? null
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
			  created_at
		`
		return rows[0] ?? null
	},
}
