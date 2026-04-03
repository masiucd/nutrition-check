// src/db/users.dao.ts
// SERVER-ONLY
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

	/** Find a user by their primary key. Returns undefined if not found. */
	async findById(id: number): Promise<User | undefined> {
		const rows = await sql<User[]>`
			SELECT id,
			  email,
			  password,
			  created_at
			FROM users
			WHERE id = ${id}
			LIMIT 1
		`
		return rows[0]
	},

	/** Insert a new user. Returns the created row. */
	async create(email: string, hashedPassword: string): Promise<User> {
		const rows = await sql<User[]>`
			INSERT INTO users (email, password)
			VALUES (${email}, ${hashedPassword})
			RETURNING *
		`
		return rows[0]
	},

	/** Update a user's hashed password. Returns the updated row. */
	async updatePassword(id: number, hashedPassword: string): Promise<User> {
		const rows = await sql<User[]>`
			UPDATE users
			SET password = ${hashedPassword}
			WHERE id = ${id}
			RETURNING id,
			  email,
			  password,
			  created_at
		`
		return rows[0]
	},
}
