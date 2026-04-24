// src/db/types.ts
// All row types are inferred from their Zod schemas in @/lib/schemas.
// These re-exports exist so that server-only code importing from "@/db/types" keeps working.

export type {
	DailyLog,
	DailyLogWithFood,
	DailyTotalsRow,
	Food,
	FoodCategoryName,
	FoodCategoryRow,
	FoodItem,
	FoodTypeName,
	FoodTypeRow,
	Meal,
	User,
	UserData,
} from "@/lib/schemas"
