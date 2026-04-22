// src/db/foods.dao.ts
// SERVER-ONLY

import {sql} from "./index"
import type {Food, FoodItem} from "./types"

export const foodsDao = {
	/** Search foods by name for a given user (case-insensitive, partial match). */
	async search(userId: number, query: string) {
		return sql<Food[]>`
			SELECT *
			FROM foods
			WHERE user_id = ${userId}
				AND name ILIKE ${`%${query}%`}
			ORDER BY name
		`
		// using ILIKE for case-insensitive partial matching
	},

	/** List all foods for a user, ordered alphabetically. */
	async findAllForUser(userId: number) {
		return sql<Food[]>`
			SELECT *
			FROM foods
			WHERE user_id = ${userId}
			ORDER BY name
		`
	},

	async getAllFoods(start = 0, limit = 20) {
		return sql<FoodItem[]>`
			SELECT
				f.id,
				f.user_id,
				f.name AS food_name,
				f.calories_per_unit,
				f.protein_per_unit,
				f.carbs_per_unit,
				f.fat_per_unit,
				f.unit_label,
				fc.name AS food_category,
				ft.name AS food_type
			FROM foods f
				LEFT JOIN food_categories fc ON f.category_id = fc.id
				LEFT JOIN food_types ft ON f.type_id = ft.id
			ORDER BY f.name
			LIMIT ${limit} OFFSET ${start}
		`
	},

	/** Find a single food by id. Returns undefined if not found. */
	async findById(id: number) {
		const rows = await sql<FoodItem[]>`
			SELECT
				f.id,
				f.user_id,
				f.name AS food_name,
				f.calories_per_unit,
				f.protein_per_unit,
				f.carbs_per_unit,
				f.fat_per_unit,
				f.unit_label,
				fc.name AS food_category,
				ft.name AS food_type
			FROM foods f
				LEFT JOIN food_categories fc ON f.category_id = fc.id
				LEFT JOIN food_types ft ON f.type_id = ft.id
			WHERE f.id = ${id}
		`
		return rows.at(0) ?? null
	},

	/** Insert a new food item. Returns the created row. */
	async create(
		userId: number,
		name: string,
		caloriesPerUnit: number,
		unitLabel = "serving",
	): Promise<Food> {
		const rows = await sql<Food[]>`
			INSERT INTO foods (
				user_id,
				name,
				calories_per_unit,
				unit_label
			)
			VALUES (
				${userId},
				${name},
				${caloriesPerUnit},
				${unitLabel}
			)
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
				name = COALESCE(${fields.name ?? null}, name),
				calories_per_unit = COALESCE(${fields.calories_per_unit ?? null}, calories_per_unit),
				unit_label = COALESCE(${fields.unit_label ?? null}, unit_label),
				updated_at = NOW()
			WHERE id = ${id}
			RETURNING *
		`
		return rows[0]
	},

	/** Delete a food item by id. */
	async delete(id: number): Promise<void> {
		await sql`
			DELETE FROM foods
			WHERE id = ${id}
		`
	},
}
