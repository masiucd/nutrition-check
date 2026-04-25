import {Link} from "@tanstack/react-router"
import {CardContent} from "@/components/ui/card"
import type {Food} from "@/lib/schemas"

interface Props {
	foodItems: Food[]
}

export function FoodItemsList({foodItems}: Props) {
	return (
		<CardContent>
			<ul>
				{foodItems.map(food => (
					<li key={food.id} className="font-semibold">
						<Link
							to="/food_items/$foodid"
							params={{foodid: food.id.toString()}}
							className="underline underline-offset-2 transition-opacity duration-150 hover:opacity-75"
						>
							{food.name}
						</Link>
					</li>
				))}
			</ul>
		</CardContent>
	)
}
