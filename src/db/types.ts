// src/db/types.ts
// Row types that mirror the database schema exactly.
// Use these as return types in DAOs and as input to server functions.

import z from "zod"

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

export const FoodItemSchema = z.object({
	id: z.number(),
	user_id: z.number(),
	food_name: z.string(),
	calories_per_unit: z.string(),
	protein_per_unit: z.string(),
	carbs_per_unit: z.string(),
	fat_per_unit: z.string(),
	unit_label: z.string(),
	food_category: z.string(),
	food_type: z.string(),
})

export type FoodItem = z.infer<typeof FoodItemSchema>

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

// Row type for the users_data table
export type UserData = {
	id: number // same as users.id (FK)
	age: number | null
	gender: boolean | null // false = male · true = female
	first_name: string | null
	last_name: string | null
	occupation: string | null
	height: number | null // centimetres
	weight: number | null // kilograms
	city: string | null
	country: string | null
}
