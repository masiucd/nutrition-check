import {Link} from "@tanstack/react-router"
import {Pen, Trash} from "lucide-react"
import {Badge, type BadgeProps} from "@/components/ui/badge"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import type {ContextUser, FoodCategoryName, FoodItem, FoodTypeName} from "@/lib/schemas"
import {Button} from "../ui/button"

interface Props {
	items: FoodItem[]
	user: ContextUser
}

export function FoodTable({items, user}: Props) {
	const isAuthenticated = user !== null
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-55">Name</TableHead>
					<TableHead>Category</TableHead>
					<TableHead>Type</TableHead>
					<TableHead className="text-right">
						Calories
						<span className="ml-1 font-normal text-muted-foreground text-xs">kcal</span>
					</TableHead>
					<TableHead className="text-right">
						Protein
						<span className="ml-1 font-normal text-muted-foreground text-xs">g</span>
					</TableHead>
					<TableHead className="text-right">
						Carbs
						<span className="ml-1 font-normal text-muted-foreground text-xs">g</span>
					</TableHead>
					<TableHead className="text-right">
						Fat
						<span className="ml-1 font-normal text-muted-foreground text-xs">g</span>
					</TableHead>
					<TableHead className="text-muted-foreground">Unit</TableHead>
					{isAuthenticated && <TableHead className="text-muted-foreground">Actions</TableHead>}
				</TableRow>
			</TableHeader>
			<TableBody>
				{items.length === 0 ? (
					<TableRow>
						<TableCell colSpan={isAuthenticated ? 9 : 8} className="text-center">
							No food items found.
						</TableCell>
					</TableRow>
				) : (
					items.map(item => (
						<TableRow key={item.id}>
							<TableCell className="font-medium">
								<Link to="/food_items/$foodid" params={{foodid: `${item.id}`}}>
									{item.food_name}
								</Link>
							</TableCell>
							<TableCell>
								<Badge variant={CATEGORY_VARIANT[item.food_category]}>{item.food_category}</Badge>
							</TableCell>
							<TableCell>
								<Badge variant={TYPE_VARIANT[item.food_type]}>{item.food_type}</Badge>
							</TableCell>
							<TableCell className="text-right font-semibold tabular-nums">
								{item.calories_per_unit}
							</TableCell>
							<TableCell className="text-right text-blue-600 dark:text-blue-400">
								<MacroCell value={item.protein_per_unit} />
							</TableCell>
							<TableCell className="text-right text-amber-600 dark:text-amber-400">
								<MacroCell value={item.carbs_per_unit} />
							</TableCell>
							<TableCell className="text-right text-rose-600 dark:text-rose-400">
								<MacroCell value={item.fat_per_unit} />
							</TableCell>
							<TableCell className="text-muted-foreground text-xs">{item.unit_label}</TableCell>
							{isAuthenticated && user.id === item.user_id && (
								<TableCell className="text-right font-semibold tabular-nums">
									<div className="flex gap-2">
										<Button variant="secondary" size="sm" disabled={user.id !== item.user_id}>
											<Pen size={20} />
										</Button>
										<Button variant="secondary" size="sm" disabled={user.id !== item.user_id}>
											<Trash size={20} />
										</Button>
									</div>
								</TableCell>
							)}
						</TableRow>
					))
				)}
			</TableBody>
		</Table>
	)
}

const CATEGORY_VARIANT: Record<FoodCategoryName, BadgeProps["variant"]> = {
	Fruit: "pink",
	Vegetable: "success",
	Meat: "terracotta",
	Dairy: "info",
	Grains: "indigo",
	Legumes: "purple",
	"Nuts & Seeds": "warning",
	Snacks: "lime",
	Seafood: "teal",
}

const TYPE_VARIANT: Record<FoodTypeName, BadgeProps["variant"]> = {
	"Whole Food": "success",
	"Semi-Processed": "warning",
	Processed: "orange",
}

type Unit = "g" | "ml" | "piece"
function MacroCell({value, unit = "g"}: {value: string; unit?: Unit}) {
	return (
		<span className="tabular-nums">
			{value}
			<span className="ml-0.5 text-muted-foreground text-xs">{unit}</span>
		</span>
	)
}
