import type {FoodTypeRow} from "@/lib/schemas"
import {sql} from "./index"

export const foodTypesDao = {
	typesByName: async (name: string) => {
		const rows = await sql<
			FoodTypeRow[]
		>` SELECT f.name AS food_name, ft.name AS type_name, f.id AS food_id
				FROM foods f
				INNER JOIN food_types ft ON f.type_id = ft.id
				WHERE ft.name = ${name};`
		return rows
	},

	all: async () => {
		const rows = await sql<
			FoodTypeRow[]
		>` SELECT f.name AS food_name, ft.name AS type_name, f.id AS food_id
				FROM foods f
				INNER JOIN food_types ft ON f.type_id = ft.id;`
		return rows
	},
}
