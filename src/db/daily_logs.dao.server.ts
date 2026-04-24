// src/db/daily-logs.dao.ts
// SERVER-ONLY
import {sql} from "./index"
import type {DailyLog, DailyLogWithFood, DailyTotalsRow, Meal} from "./types"

export const dailyLogsDao = {
	/**
	 * Fetch all log entries for a user on a given date,
	 * joined with the food name and unit label.
	 * Results are ordered by meal slot then insertion time.
	 */
	async findByDate(userId: number, date: string): Promise<DailyLogWithFood[]> {
		return sql<DailyLogWithFood[]>`
			SELECT
				dl.*,
				f.name       AS food_name,
				f.unit_label AS unit_label
			FROM daily_logs dl
			JOIN foods f ON f.id = dl.food_id
			WHERE dl.user_id  = ${userId}
			  AND dl.log_date = ${date}
			ORDER BY
				CASE dl.meal
					WHEN 'breakfast' THEN 1
					WHEN 'lunch'     THEN 2
					WHEN 'dinner'    THEN 3
					WHEN 'snacks'    THEN 4
				END,
				dl.created_at
		`
	},

	/** Find a single log entry by id. Returns undefined if not found. */
	async findById(id: number): Promise<DailyLog | undefined> {
		const rows = await sql<DailyLog[]>`
			SELECT * FROM daily_logs WHERE id = ${id} LIMIT 1
		`
		return rows[0]
	},

	/** Insert a new log entry. Calories are computed as quantity × calories_per_unit. */
	async create(
		userId: number,
		foodId: number,
		date: string,
		meal: Meal,
		quantity: number,
		caloriesPerUnit: number,
	): Promise<DailyLog> {
		const calories = quantity * caloriesPerUnit
		const rows = await sql<DailyLog[]>`
			INSERT INTO daily_logs (user_id, food_id, log_date, meal, quantity, calories)
			VALUES (${userId}, ${foodId}, ${date}, ${meal}, ${quantity}, ${calories})
			RETURNING *
		`
		return rows[0]
	},

	/** Update the quantity (and re-compute calories) of a log entry. */
	async update(
		id: number,
		quantity: number,
		caloriesPerUnit: number,
		meal: Meal,
	): Promise<DailyLog> {
		const calories = quantity * caloriesPerUnit
		const rows = await sql<DailyLog[]>`
			UPDATE daily_logs
			SET
				quantity   = ${quantity},
				calories   = ${calories},
				meal       = ${meal},
				updated_at = NOW()
			WHERE id = ${id}
			RETURNING *
		`
		return rows[0]
	},

	/** Delete a log entry by id. */
	async delete(id: number): Promise<void> {
		await sql`DELETE FROM daily_logs WHERE id = ${id}`
	},

	/**
	 * Summarise total calories per day for a user over a date range.
	 * Returns rows ordered from oldest to newest.
	 */
	async dailyTotals(userId: number, from: string, to: string): Promise<DailyTotalsRow[]> {
		return sql<DailyTotalsRow[]>`
			SELECT
				log_date,
				SUM(calories)::numeric AS total_calories
			FROM daily_logs
			WHERE user_id  = ${userId}
			  AND log_date BETWEEN ${from} AND ${to}
			GROUP BY log_date
			ORDER BY log_date
		`
	},
}
