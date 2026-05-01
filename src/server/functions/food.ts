import {createServerFn} from "@tanstack/react-start"
import {foodCategoriesDao, foodsDao, foodTypesDao} from "@/db"
import {
	CreateFoodItemSchema,
	FoodCategoryRowSchema,
	FoodItemSchema,
	FoodTypeRowSchema,
	GetFoodItemSchema,
	GetFoodItemsByCategorySchema,
	GetFoodItemsByTypeSchema,
} from "@/lib/schemas"
import {getAppSession} from "@/server/utils/session"
import {HttpStatusCode} from "@/server/utils/status_code"

export const getFoodItems = createServerFn({method: "GET"}).handler(async () => {
	const foods = await foodsDao.getAllFoods()

	const parsedFoods = FoodItemSchema.array().safeParse(foods)

	if (parsedFoods.error) {
		return {data: [], error: parsedFoods.error.message}
	}
	if (parsedFoods.success) {
		return {data: parsedFoods.data, error: null}
	}
	return {data: [], error: null}
})

export const getFoodItem = createServerFn({method: "GET"})
	.inputValidator(GetFoodItemSchema)
	.handler(async ({data}) => {
		try {
			const maybeFoodItem = await foodsDao.findById(data.id)
			const foodItem = FoodItemSchema.safeParse(maybeFoodItem)
			if (foodItem.error) {
				return {foodItemData: null, error: foodItem.error.message}
			}
			return {foodItemData: foodItem.data, error: null}
		} catch (e) {
			// biome-ignore lint/suspicious/noConsole: <logging error>
			console.error(e)
			return {foodItemData: null, error: e instanceof Error ? e.message : String(e)}
		}
	})

export const getFoodItemsByCategory = createServerFn({method: "GET"})
	.inputValidator(GetFoodItemsByCategorySchema)
	.handler(async ({data}) => {
		const foods = await foodCategoriesDao.categoriesByName(data.category)
		const parsedFoodCategories = FoodCategoryRowSchema.array().safeParse(foods)
		if (parsedFoodCategories.error) {
			return {data: [], error: parsedFoodCategories.error.message}
		}
		if (parsedFoodCategories.success) {
			return {data: parsedFoodCategories.data, error: null}
		}
		return {data: [], error: null}
	})

export const getFoodItemsByType = createServerFn({method: "GET"})
	.inputValidator(GetFoodItemsByTypeSchema)
	.handler(async ({data}) => {
		const foods = await foodTypesDao.typesByName(data.type)
		const parsedFoodTypes = FoodTypeRowSchema.array().safeParse(foods)
		if (parsedFoodTypes.error) {
			return {data: [], error: parsedFoodTypes.error.message}
		}
		if (parsedFoodTypes.success) {
			return {data: parsedFoodTypes.data, error: null}
		}
		return {data: [], error: null}
	})

export const createFoodItem = createServerFn({method: "POST"})
	.inputValidator(CreateFoodItemSchema)
	.handler(async ({data}) => {
		const session = await getAppSession()
		const userId = session.data.userId

		if (!userId) {
			return {data: null, error: "Unauthenticated", status: HttpStatusCode.UNAUTHORIZED}
		}

		try {
			const food = await foodsDao.create(userId, {
				name: data.name,
				caloriesPerUnit: data.caloriesPerUnit,
				proteinPerUnit: data.proteinPerUnit,
				carbsPerUnit: data.carbsPerUnit,
				fatPerUnit: data.fatPerUnit,
				unitLabel: data.unitLabel,
				categoryName: data.categoryName ?? null,
				typeName: data.typeName ?? null,
			})

			return {data: food, error: null, status: HttpStatusCode.OK}
		} catch (e) {
			// biome-ignore lint/suspicious/noConsole: <logging error>
			console.error(e)
			return {
				data: null,
				error: e instanceof Error ? e.message : "Failed to create food item",
				status: HttpStatusCode.INTERNAL_SERVER_ERROR,
			}
		}
	})
