// src/db/user_data.dao.server.ts
// SERVER-ONLY

import type {AwaitNullable} from "@/lib/types"
import {sql} from "./index"
import type {UserData} from "./types"

export const userDataDao = {
	/** Fetch the profile row for a user. Returns null if it has never been set. */
	async findById(userId: number): AwaitNullable<UserData> {
		const rows = await sql<UserData[]>`
			SELECT id,
			  age,
			  gender,
			  first_name,
			  last_name,
			  occupation,
			  height,
			  weight,
			  city,
			  country
			FROM users_data
			WHERE id = ${userId}
			LIMIT 1
		`
		return rows[0] ?? null
	},

	/** Insert or replace the user's profile (upsert on PK conflict). */
	async upsert(
		userId: number,
		payload: {
			age: number | null
			gender: boolean | null
			firstName?: string
			lastName?: string
			occupation?: string
			height: number | null
			weight: number | null
			city?: string
			country?: string
		},
	): AwaitNullable<UserData> {
		const rows = await sql<UserData[]>`
			INSERT INTO users_data (id, age, gender, first_name, last_name, occupation, height, weight, city, country)
			VALUES (
				${userId},
				${payload.age},
				${payload.gender},
				${payload.firstName ?? null},
				${payload.lastName ?? null},
				${payload.occupation ?? null},
				${payload.height},
				${payload.weight},
				${payload.city ?? null},
				${payload.country ?? null}
			)
			ON CONFLICT (id) DO UPDATE
				SET age        = EXCLUDED.age,
				    gender     = EXCLUDED.gender,
				    first_name = EXCLUDED.first_name,
				    last_name  = EXCLUDED.last_name,
				    occupation = EXCLUDED.occupation,
				    height     = EXCLUDED.height,
				    weight     = EXCLUDED.weight,
				    city       = EXCLUDED.city,
				    country    = EXCLUDED.country
			RETURNING id,
			  age,
			  gender,
			  first_name,
			  last_name,
			  occupation,
			  height,
			  weight,
			  city,
			  country
		`
		return rows[0] ?? null
	},
}
