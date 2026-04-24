import type {FoodCategoryRow} from "@/lib/schemas"
import {sql} from "./index"

export const foodCategoriesDao = {
	categoriesByName: async (name: string) => {
		const rows = await sql<
			FoodCategoryRow[]
		>` SELECT f.name AS food_name, fc.name AS category_name, f.id AS food_id
                                           	FROM foods f
                                           	INNER JOIN food_categories fc ON f.category_id = fc.id
                                            WHERE fc.name = ${name};`
		return rows
	},

	all: async () => {
		const rows = await sql<
			FoodCategoryRow[]
		>`SELECT f.name AS food_name, fc.name AS category_name, f.id AS food_id
                                           	FROM foods f
                                           	INNER JOIN food_categories fc ON f.category_id = fc.id;`
		return rows
	},
}
