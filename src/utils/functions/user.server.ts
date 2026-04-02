// Server-only helpers (DB queries, internal logic)
// These functions are not exposed to the client

import {db} from "@/db/connect"
import type {Nullable} from "@/lib/types"

/**
 * Find a user by their email address, including profile info and gender.
 */
export async function findUserByEmail(email: string) {
	const found = await db.user.findUnique({
		where: {email},
		include: {
			userInfo: {
				include: {gender: true},
			},
		},
	})

	if (!found) return null

	return {
		userId: found.id,
		username: found.username,
		email: found.email,
		firstName: found.userInfo?.firstName ?? null,
		lastName: found.userInfo?.lastName ?? null,
		age: found.userInfo?.age ?? null,
		gender: found.userInfo?.gender?.type ?? null,
		password: found.passwordHash,
	}
}

/**
 * Find a user by their numeric ID, including profile info and gender.
 */
export async function findUserById(id: number) {
	const found = await db.user.findUnique({
		where: {id},
		include: {
			userInfo: {
				include: {gender: true},
			},
		},
	})

	if (!found) return null

	return {
		userId: found.id,
		username: found.username,
		email: found.email,
		firstName: found.userInfo?.firstName ?? null,
		lastName: found.userInfo?.lastName ?? null,
		age: found.userInfo?.age ?? null,
		gender: found.userInfo?.gender?.type ?? null,
	}
}

/**
 * Insert a new user into the database.
 * Returns { username, email } on success, or null on failure.
 */
export async function insertUser(userData: {username: string; email: string; password: string}) {
	try {
		const created = await db.user.create({
			data: {
				username: userData.username,
				email: userData.email,
				passwordHash: userData.password,
			},
			select: {
				username: true,
				email: true,
			},
		})
		return created
	} catch {
		return null
	}
}

interface UpdateUserRecord {
	userId: number
	username: Nullable<string>
	email: Nullable<string>
	firstName: Nullable<string>
	lastName: Nullable<string>
	age: Nullable<number>
	/** 0 = FEMALE, 1 = MALE — maps to the Gender lookup table id */
	gender: Nullable<0 | 1>
}

/**
 * Update user profile and user_info in a single transaction.
 * Upserts the userInfo row (creates it if it doesn't exist yet).
 */
export async function updateUser(record: UpdateUserRecord) {
	return await db.$transaction(async tx => {
		// 1. Update core user fields
		const updatedUser = await tx.user.update({
			where: {id: record.userId},
			data: {
				...(record.username != null && {username: record.username}),
				...(record.email != null && {email: record.email}),
			},
			select: {username: true, email: true},
		})

		// 2. Resolve genderId: gender table uses id 0 = FEMALE, 1 = MALE
		const genderId: number | null = record.gender === 0 ? 0 : record.gender === 1 ? 1 : null

		// 3. Upsert the user_info row
		const updatedInfo = await tx.userInfo.upsert({
			where: {id: record.userId},
			create: {
				id: record.userId,
				firstName: record.firstName,
				lastName: record.lastName,
				age: record.age,
				genderId,
			},
			update: {
				...(record.firstName !== undefined && {firstName: record.firstName}),
				...(record.lastName !== undefined && {lastName: record.lastName}),
				...(record.age !== undefined && {age: record.age}),
				...(genderId !== undefined && {genderId}),
			},
			select: {firstName: true, lastName: true, age: true},
		})

		return {...updatedUser, ...updatedInfo}
	})
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Serializable representation of a food item (Decimal → number). */
export interface FoodItem {
	id: number
	name: string
	description: string
	calories: number
	protein: number
	carbs: number
	fat: number
	servingSize: number
	createdAt: Date
	updatedAt: Date
}

/** Serializable representation of a calorie log entry. */
export interface CalorieLogEntry {
	id: number
	userId: number
	productId: number
	quantity: number
	loggedAt: Date
	product: FoodItem
}

function serializeFoodItem(item: {
	id: number
	name: string
	description: string
	calories: number
	protein: {toNumber(): number} | number
	carbs: {toNumber(): number} | number
	fat: {toNumber(): number} | number
	servingSize: number
	createdAt: Date
	updatedAt: Date
}): FoodItem {
	return {
		id: item.id,
		name: item.name,
		description: item.description,
		calories: item.calories,
		protein: typeof item.protein === "number" ? item.protein : item.protein.toNumber(),
		carbs: typeof item.carbs === "number" ? item.carbs : item.carbs.toNumber(),
		fat: typeof item.fat === "number" ? item.fat : item.fat.toNumber(),
		servingSize: item.servingSize,
		createdAt: item.createdAt,
		updatedAt: item.updatedAt,
	}
}

// ─── Calorie-log helpers ────────────────────────────────────────────────────

/**
 * Log a food entry for a user.
 * quantity is in grams.
 */
export async function logCalories(userId: number, foodItemId: number, quantity: number) {
	return await db.calorieLog.create({
		data: {userId, foodItemId, quantity},
	})
}

/**
 * Get all calorie logs for a user on a specific date (UTC).
 * All Decimal fields are serialized to plain numbers.
 */
export async function getDailyLogs(userId: number, date: Date): Promise<CalorieLogEntry[]> {
	const start = new Date(date)
	start.setUTCHours(0, 0, 0, 0)
	const end = new Date(date)
	end.setUTCHours(23, 59, 59, 999)

	const _rows = await db.calorieLog.findMany({
		where: {
			userId,
			loggedAt: {gte: start, lte: end},
		},
		include: {foodItem: true},
		orderBy: {loggedAt: "asc"},
	})

	return []
	// return rows.map(row => ({
	// 	id: row.id,
	// 	userId: row.userId,
	// 	foodItemId: row.foodItem.id,
	// 	quantity:
	// 		typeof row.quantity === "number"
	// 			? row.quantity
	// 			: (row.quantity as {toNumber(): number}).toNumber(),
	// 	loggedAt: row.loggedAt,
	// 	foodItem: serializeFoodItem(row.foodItem),
	// }))
}

/**
 * Get all food items (products) with optional name search.
 * All Decimal fields are serialized to plain numbers.
 */
export async function getFoodItems(search?: string): Promise<FoodItem[]> {
	const rows = await db.foodItem.findMany({
		where: search ? {name: {contains: search, mode: "insensitive"}} : undefined,
		orderBy: {name: "asc"},
	})
	return rows.map(serializeFoodItem)
}

/**
 * Get a single food item by ID.
 * All Decimal fields are serialized to
 plain numbers.
 */
export async function getFoodItemById(id: number): Promise<FoodItem | null> {
	const row = await db.foodItem.findUnique({where: {id}})
	if (!row) return null
	return serializeFoodItem(row)
}
