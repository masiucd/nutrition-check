import {createServerFn} from "@tanstack/react-start"
import {z} from "zod"
import {foodsDao} from "@/db"
import {foodCategoriesDao, foodCategorySchema} from "@/db/category.dao.server"
import {FoodItemSchema} from "@/db/types"

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
	.inputValidator(z.object({id: z.number()}))
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
	.inputValidator(z.object({category: z.string()}))
	.handler(async ({data}) => {
		const foods = await foodCategoriesDao.categoriesByName(data.category)
		const parsedFoodCategories = foodCategorySchema.array().safeParse(foods)
		if (parsedFoodCategories.error) {
			return {data: [], error: parsedFoodCategories.error.message}
		}
		if (parsedFoodCategories.success) {
			return {data: parsedFoodCategories.data, error: null}
		}
		return {data: [], error: null}
	})
