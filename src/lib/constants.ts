import type {FoodCategoryName, FoodTypeName} from "@/lib/schemas"

export const FOOD_CATEGORIES = [
	"Fruit",
	"Vegetable",
	"Meat",
	"Dairy",
	"Grains",
	"Legumes",
	"Nuts & Seeds",
	"Snacks",
	"Seafood",
] as const satisfies readonly FoodCategoryName[]

export const FOOD_TYPES = [
	"Whole Food",
	"Semi-Processed",
	"Processed",
] as const satisfies readonly FoodTypeName[]
