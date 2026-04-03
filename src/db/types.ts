// src/db/types.ts
// Row types that mirror the database schema exactly.
// Use these as return types in DAOs and as input to server functions.

export type User = {
	id: number
	email: string
	password: string
	created_at: Date
}

export type Food = {
	id: number
	user_id: number
	name: string
	calories_per_unit: number
	unit_label: string
	created_at: Date
	updated_at: Date
}

export type DailyLog = {
	id: number
	user_id: number
	food_id: number
	log_date: string // ISO date string: "YYYY-MM-DD"
	meal: "breakfast" | "lunch" | "dinner" | "snacks"
	quantity: number
	calories: number
	created_at: Date
	updated_at: Date
}

// Joined shape returned by dailyLogsDao.findByDate — includes food name and unit
export type DailyLogWithFood = DailyLog & {
	food_name: string
	unit_label: string
}
