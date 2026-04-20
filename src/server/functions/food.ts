import {createServerFn} from "@tanstack/react-start"
import {foodsDao} from "@/db"
import {FoodItemSchema} from "@/db/types"

export const getFoodItems = createServerFn({method: "GET"})
	// .inputValidator(GetFoodItemsInputValidator)
	.handler(async () => {
		const foods = await foodsDao.getAllFoods()
		// biome-ignore lint/suspicious/noConsole: <explanation>
		console.log("foods", foods)
		const parsedFoods = FoodItemSchema.array().safeParse(foods)

		// biome-ignore lint/suspicious/noConsole: <explanation>
		console.log("parsedFoods", parsedFoods)
		if (parsedFoods.error) {
			return {data: [], error: parsedFoods.error.message}
		}
		if (parsedFoods.success) {
			return {data: parsedFoods.data, error: null}
		}
		return {data: [], error: null}
	})
