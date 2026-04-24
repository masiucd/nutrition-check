import z from "zod"
import {sql} from "./index"

export const foodCategorySchema = z.object({
	food_name: z.string(),
	category_name: z.string(),
	food_id: z.number(),
})

export type FoodCategory = z.infer<typeof foodCategorySchema>

export const foodCategoriesDao = {
	/**
	 * This function returns all foods in a given category.
	 * @param name - the category we are filtering on
	 * @returns an array of food objects, each with a `food_name` and `category_name` property
	 */
	categoriesByName: async (name: string) => {
		const rows = await sql<
			FoodCategory[]
		>` SELECT f.name AS food_name, fc.name AS category_name, f.id AS food_id
                                           	FROM foods f
                                           	INNER JOIN food_categories fc ON f.category_id = fc.id
                                            WHERE fc.name = ${name};`
		return rows
	},

	all: async () => {
		const rows = await sql<
			FoodCategory[]
		>`SELECT f.name AS food_name, fc.name AS category_name, f.id AS food_id
                                           	FROM foods f
                                           	INNER JOIN food_categories fc ON f.category_id = fc.id;`
		return rows
	},
}
