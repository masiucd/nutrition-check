import {Link} from "@tanstack/react-router"
import {ArrowDown, ArrowUp, ArrowUpDown, Pen, Trash} from "lucide-react"
import {useState} from "react"
import {DeleteFoodItemDialog} from "@/components/food-items/delete-food-item-dialog"
import {EditFoodItemDialog} from "@/components/food-items/edit-food-item-dialog"
import {Badge, type BadgeProps} from "@/components/ui/badge"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import type {ContextUser, FoodCategoryName, FoodItem, FoodTypeName} from "@/lib/schemas"
import {cn} from "@/lib/utils"

import {Button} from "../ui/button"

export type SortableColumn =
	| "food_name"
	| "food_category"
	| "food_type"
	| "calories_per_unit"
	| "protein_per_unit"
	| "carbs_per_unit"
	| "fat_per_unit"
export type SortDir = "asc" | "desc"

interface Props {
	items: FoodItem[]
	user: ContextUser
	sortBy: SortableColumn | undefined
	sortDir: SortDir
	onSort: (column: SortableColumn) => void
}

interface SortableHeadProps {
	column: SortableColumn
	sortBy: SortableColumn | undefined
	sortDir: SortDir
	onSort: (column: SortableColumn) => void
	className?: string
	children: React.ReactNode
	extraSuffix?: React.ReactNode
}

function SortableHead({
	column,
	sortBy,
	sortDir,
	onSort,
	className,
	children,
	extraSuffix,
}: SortableHeadProps) {
	const isActive = sortBy === column
	const Icon = isActive ? (sortDir === "desc" ? ArrowDown : ArrowUp) : ArrowUpDown

	return (
		<TableHead className={cn("select-none", className)}>
			<button
				type="button"
				className={cn(
					"flex items-center gap-1 transition-colors hover:text-foreground",
					isActive ? "text-foreground" : "text-muted-foreground",
				)}
				onClick={() => onSort(column)}
			>
				{children}
				{extraSuffix}
				<Icon size={13} className="shrink-0" />
			</button>
		</TableHead>
	)
}

export function FoodTable({items, user, sortBy, sortDir, onSort}: Props) {
	const isAuthenticated = user !== null
	const [editItem, setEditItem] = useState<FoodItem | null>(null)
	const [foodItemToDelete, setDeleteItem] = useState<FoodItem | null>(null)

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<SortableHead
							column="food_name"
							sortBy={sortBy}
							sortDir={sortDir}
							onSort={onSort}
							className="w-55"
						>
							Name
						</SortableHead>
						<SortableHead column="food_category" sortBy={sortBy} sortDir={sortDir} onSort={onSort}>
							Category
						</SortableHead>
						<SortableHead column="food_type" sortBy={sortBy} sortDir={sortDir} onSort={onSort}>
							Type
						</SortableHead>
						<SortableHead
							column="calories_per_unit"
							sortBy={sortBy}
							sortDir={sortDir}
							onSort={onSort}
							className="justify-end"
							extraSuffix={<span className="font-normal text-muted-foreground text-xs">kcal</span>}
						>
							Calories
						</SortableHead>
						<SortableHead
							column="protein_per_unit"
							sortBy={sortBy}
							sortDir={sortDir}
							onSort={onSort}
							className="justify-end"
							extraSuffix={<span className="font-normal text-muted-foreground text-xs">g</span>}
						>
							Protein
						</SortableHead>
						<SortableHead
							column="carbs_per_unit"
							sortBy={sortBy}
							sortDir={sortDir}
							onSort={onSort}
							className="justify-end"
							extraSuffix={<span className="font-normal text-muted-foreground text-xs">g</span>}
						>
							Carbs
						</SortableHead>
						<SortableHead
							column="fat_per_unit"
							sortBy={sortBy}
							sortDir={sortDir}
							onSort={onSort}
							className="justify-end"
							extraSuffix={<span className="font-normal text-muted-foreground text-xs">g</span>}
						>
							Fat
						</SortableHead>
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
									<TableCell>
										<div className="flex gap-2">
											<Button variant="secondary" size="sm" onClick={() => setEditItem(item)}>
												<Pen size={20} />
											</Button>
											<Button variant="destructive" size="sm" onClick={() => setDeleteItem(item)}>
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
			<EditFoodItemDialog
				item={editItem}
				onOpenChange={open => {
					if (!open) setEditItem(null)
				}}
			/>
			<DeleteFoodItemDialog
				item={foodItemToDelete}
				onOpenChange={open => {
					if (!open) setDeleteItem(null)
				}}
			/>
		</>
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
