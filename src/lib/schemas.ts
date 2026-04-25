import {z} from "zod"

// ─── Shared validation helper ─────────────────────────────────────────────────

/**
 * Runs a Zod schema against a value and returns the first error message,
 * or undefined if valid. Use with @tanstack/react-form field validators.
 */
export function validate<T>(schema: z.ZodType<T>, value: T): string | undefined {
	const result = schema.safeParse(value)
	return result.success ? undefined : result.error.issues[0]?.message
}

// ─── Primitive field schemas ──────────────────────────────────────────────────

export const emailSchema = z.email("Please enter a valid email address")

export const passwordSchema = z.string().min(6, "Password must be at least 6 characters")

/** Alias for passwordSchema — use when the field is labelled "New Password". */
export const newPasswordSchema = passwordSchema

export const currentPasswordSchema = z.string().min(1, "Current password is required")

export const confirmPasswordSchema = z.string().min(1, "Please confirm your password")

export const nameSchema = z.string().min(3, "Name must be at least 3 characters")

// ─── DB row schemas ────────────────────────────────────────────────────────────

export const UserSchema = z.object({
	id: z.number(),
	email: z.string(),
	password: z.string(),
	is_admin: z.boolean(),
	created_at: z.string().or(z.date()), // or a string,
})

export const FoodCategoryNameSchema = z.enum([
	"Fruit",
	"Vegetable",
	"Meat",
	"Dairy",
	"Grains",
	"Legumes",
	"Nuts & Seeds",
	"Snacks",
	"Seafood",
])

export const FoodTypeNameSchema = z.enum(["Whole Food", "Semi-Processed", "Processed"])

export const FoodItemSchema = z.object({
	id: z.number(),
	user_id: z.number(),
	food_name: z.string(),
	calories_per_unit: z.string(),
	protein_per_unit: z.string(),
	carbs_per_unit: z.string(),
	fat_per_unit: z.string(),
	unit_label: z.string(),
	food_category: FoodCategoryNameSchema,
	food_type: FoodTypeNameSchema,
})

export const MealSchema = z.enum(["breakfast", "lunch", "dinner", "snacks"])

export const FoodSchema = z.object({
	id: z.number(),
	user_id: z.number(),
	name: z.string(),
	calories_per_unit: z.number(),
	unit_label: z.string(),
	created_at: z.date(),
	updated_at: z.date(),
})

export const DailyLogSchema = z.object({
	id: z.number(),
	user_id: z.number(),
	food_id: z.number(),
	log_date: z.string(), // ISO date string: "YYYY-MM-DD"
	meal: MealSchema,
	quantity: z.number(),
	calories: z.number(),
	created_at: z.date(),
	updated_at: z.date(),
})

/** DailyLog extended with the joined food name and unit label. */
export const DailyLogWithFoodSchema = DailyLogSchema.extend({
	food_name: z.string(),
	unit_label: z.string(),
})

export const UserDataSchema = z.object({
	id: z.number(), // same as users.id (FK)
	age: z.number().nullable(),
	gender: z.boolean().nullable(), // false = male · true = female
	first_name: z.string().nullable(),
	last_name: z.string().nullable(),
	occupation: z.string().nullable(),
	height: z.number().nullable(), // centimetres
	weight: z.number().nullable(), // kilograms
	city: z.string().nullable(),
	country: z.string().nullable(),
})

// ─── Query result schemas (DAO join results) ──────────────────────────────────

/** Shape returned by foodCategoriesDao queries (food ⨝ food_categories). */
export const FoodCategoryRowSchema = z.object({
	food_name: z.string(),
	category_name: z.string(),
	food_id: z.number(),
})

/** Shape returned by foodTypesDao queries (food ⨝ food_types). */
export const FoodTypeRowSchema = z.object({
	food_name: z.string(),
	type_name: z.string(),
	food_id: z.number(),
})

/** Shape returned by dailyLogsDao.dailyTotals — one row per day. */
export const DailyTotalsRowSchema = z.object({
	log_date: z.string(),
	total_calories: z.number(),
})

// ─── Server function input schemas ────────────────────────────────────────────

export const CreateUserSchema = z.object({
	name: nameSchema,
	email: emailSchema,
	password: passwordSchema,
	confirmPassword: z.string(),
})

export const LoginUserSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, "Password is required"),
})

export const GetFoodItemSchema = z.object({id: z.number()})

export const GetFoodItemsByCategorySchema = z.object({category: z.string()})

export const GetFoodItemsByTypeSchema = z.object({type: z.string()})

export const UpdateEmailSchema = z.object({
	email: emailSchema,
})

export const UpdatePasswordSchema = z.object({
	currentPassword: currentPasswordSchema,
	newPassword: newPasswordSchema,
	confirmPassword: confirmPasswordSchema,
})

export const UpdateUserProfileSchema = z.object({
	firstName: z.string().max(100).optional(),
	lastName: z.string().max(100).optional(),
	age: z.number().int().min(1).max(150).nullable().optional(),
	gender: z.boolean().nullable().optional(),
	occupation: z.string().max(200).optional(),
	height: z.number().min(0).max(300).nullable().optional(),
	weight: z.number().min(0).max(600).nullable().optional(),
	city: z.string().max(100).optional(),
	country: z.string().max(100).optional(),
})

// ─── Inferred types ────────────────────────────────────────────────────────────

export type User = z.infer<typeof UserSchema>
export type Meal = z.infer<typeof MealSchema>
export type Food = z.infer<typeof FoodSchema>
export type DailyLog = z.infer<typeof DailyLogSchema>
export type DailyLogWithFood = z.infer<typeof DailyLogWithFoodSchema>
export type UserData = z.infer<typeof UserDataSchema>
export type DailyTotalsRow = z.infer<typeof DailyTotalsRowSchema>
export type FoodItem = z.infer<typeof FoodItemSchema>
export type FoodCategoryName = z.infer<typeof FoodCategoryNameSchema>
export type FoodTypeName = z.infer<typeof FoodTypeNameSchema>
export type FoodCategoryRow = z.infer<typeof FoodCategoryRowSchema>
export type FoodTypeRow = z.infer<typeof FoodTypeRowSchema>
