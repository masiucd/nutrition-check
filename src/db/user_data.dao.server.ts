// src/db/user_data.dao.server.ts
// SERVER-ONLY

import type {AwaitNullable} from "@/lib/types"
import {sql} from "./index"
import type {UserData, UserProfile} from "./types"

export const userDataDao = {
	/** Fetch the profile row for a user. Returns null if it has never been set. */
	async findById(userId: number): AwaitNullable<UserData> {
		const rows = await sql<UserData[]>`
			SELECT id,
			  data,
			  age,
			  gender
			FROM users_data
			WHERE id = ${userId}
			LIMIT 1
		`
		return rows[0] ?? null
	},

	/** Insert or replace the user's profile (upsert on PK conflict). */
	async upsert(
		userId: number,
		payload: {age: number | null; gender: boolean | null; data: UserProfile},
	): AwaitNullable<UserData> {
		const rows = await sql<UserData[]>`
			INSERT INTO users_data (id, age, gender, data)
			VALUES (${userId}, ${payload.age}, ${payload.gender}, ${sql.json(payload.data)})
			ON CONFLICT (id) DO UPDATE
				SET age    = EXCLUDED.age,
				    gender = EXCLUDED.gender,
				    data   = EXCLUDED.data
			RETURNING id,
			  data,
			  age,
			  gender
		`
		return rows[0] ?? null
	},
}
