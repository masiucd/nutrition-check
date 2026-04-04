// src/db/foods.dao.ts
// SERVER-ONLY
import {sql} from "./index"
import type {Food} from "./types"

export const foodsDao = {
	/** Search foods by name for a given user (case-insensitive, partial match). */
	async search(userId: number, query: string): Promise<Food[]> {
		return sql<Food[]>`
			SELECT * FROM foods
			WHERE user_id = ${userId}
			  AND name ILIKE ${"%" + query + "%"}
			ORDER BY name
		`
	},

	/** List all foods for a user, ordered alphabetically. */
	async findAll(userId: number): Promise<Food[]> {
		return sql<Food[]>`
			SELECT * FROM foods
			WHERE user_id = ${userId}
			ORDER BY name
		`
	},

	/** Find a single food by id. Returns undefined if not found. */
	async findById(id: number): Promise<Food | undefined> {
		const rows = await sql<Food[]>`
			SELECT * FROM foods WHERE id = ${id} LIMIT 1
		`
		return rows[0]
	},

	/** Insert a new food item. Returns the created row. */
	async create(
		userId: number,
		name: string,
		caloriesPerUnit: number,
		unitLabel = "serving",
	): Promise<Food> {
		const rows = await sql<Food[]>`
			INSERT INTO foods (user_id, name, calories_per_unit, unit_label)
			VALUES (${userId}, ${name}, ${caloriesPerUnit}, ${unitLabel})
			RETURNING *
		`
		return rows[0]
	},

	/** Update a food's name, calorie value, and/or unit label. Returns the updated row. */
	async update(
		id: number,
		fields: Partial<Pick<Food, "name" | "calories_per_unit" | "unit_label">>,
	): Promise<Food> {
		const rows = await sql<Food[]>`
			UPDATE foods
			SET
				name              = COALESCE(${fields.name ?? null}, name),
				calories_per_unit = COALESCE(${fields.calories_per_unit ?? null}, calories_per_unit),
				unit_label        = COALESCE(${fields.unit_label ?? null}, unit_label),
				updated_at        = NOW()
			WHERE id = ${id}
			RETURNING *
		`
		return rows[0]
	},

	/** Delete a food item by id. */
	async delete(id: number): Promise<void> {
		await sql`DELETE FROM foods WHERE id = ${id}`
	},
}
