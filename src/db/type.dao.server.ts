import z from "zod"
import {sql} from "./index"

export const foodTypeSchema = z.object({
	food_name: z.string(),
	type_name: z.string(),
	food_id: z.number(),
})

export type FoodTypeItem = z.infer<typeof foodTypeSchema>

export const foodTypesDao = {
	/**
	 * This function returns all foods for a given type.
	 * @param name - the type we are filtering on
	 * @returns an array of food objects, each with a `food_name` and `type_name` property
	 */
	typesByName: async (name: string) => {
		const rows = await sql<
			FoodTypeItem[]
		>` SELECT f.name AS food_name, ft.name AS type_name, f.id AS food_id
				FROM foods f
				INNER JOIN food_types ft ON f.type_id = ft.id
				WHERE ft.name = ${name};`
		return rows
	},

	all: async () => {
		const rows = await sql<
			FoodTypeItem[]
		>` SELECT f.name AS food_name, ft.name AS type_name, f.id AS food_id
				FROM foods f
				INNER JOIN food_types ft ON f.type_id = ft.id;`
		return rows
	},
}
