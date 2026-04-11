import {createFileRoute} from "@tanstack/react-router"
import {Heading, Text} from "@/components/typography"
import type {BadgeProps} from "@/components/ui/badge"
import {Badge} from "@/components/ui/badge"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {PageWrapper} from "@/components/wrappers/page"

export const Route = createFileRoute("/food_items")({
	component: RouteComponent,
})

type FoodCategory =
	| "Fruit"
	| "Vegetable"
	| "Meat"
	| "Dairy"
	| "Grains"
	| "Legumes"
	| "Nuts & Seeds"
	| "Snacks"
	| "Seafood"

type FoodType = "Whole Food" | "Processed" | "Semi-Processed"

interface FoodItem {
	id: number
	name: string
	category: FoodCategory
	type: FoodType
	calories: number
	protein: number
	carbs: number
	fat: number
	unitLabel: string
}

const FOOD_ITEMS: FoodItem[] = [
	{
		id: 1,
		name: "Chicken Breast",
		category: "Meat",
		type: "Whole Food",
		calories: 165,
		protein: 31,
		carbs: 0,
		fat: 3.6,
		unitLabel: "100g",
	},
	{
		id: 2,
		name: "Brown Rice",
		category: "Grains",
		type: "Whole Food",
		calories: 216,
		protein: 5,
		carbs: 45,
		fat: 1.8,
		unitLabel: "100g cooked",
	},
	{
		id: 3,
		name: "Banana",
		category: "Fruit",
		type: "Whole Food",
		calories: 89,
		protein: 1.1,
		carbs: 23,
		fat: 0.3,
		unitLabel: "medium (118g)",
	},
	{
		id: 4,
		name: "Greek Yoghurt",
		category: "Dairy",
		type: "Semi-Processed",
		calories: 97,
		protein: 9,
		carbs: 3.6,
		fat: 5,
		unitLabel: "100g",
	},
	{
		id: 5,
		name: "Broccoli",
		category: "Vegetable",
		type: "Whole Food",
		calories: 34,
		protein: 2.8,
		carbs: 6.6,
		fat: 0.4,
		unitLabel: "100g",
	},
	{
		id: 6,
		name: "Almonds",
		category: "Nuts & Seeds",
		type: "Whole Food",
		calories: 579,
		protein: 21,
		carbs: 22,
		fat: 50,
		unitLabel: "100g",
	},
	{
		id: 7,
		name: "Salmon Fillet",
		category: "Seafood",
		type: "Whole Food",
		calories: 208,
		protein: 20,
		carbs: 0,
		fat: 13,
		unitLabel: "100g",
	},
	{
		id: 8,
		name: "Whole Milk",
		category: "Dairy",
		type: "Whole Food",
		calories: 61,
		protein: 3.2,
		carbs: 4.8,
		fat: 3.3,
		unitLabel: "100ml",
	},
	{
		id: 9,
		name: "Lentils",
		category: "Legumes",
		type: "Whole Food",
		calories: 116,
		protein: 9,
		carbs: 20,
		fat: 0.4,
		unitLabel: "100g cooked",
	},
	{
		id: 10,
		name: "Potato Chips",
		category: "Snacks",
		type: "Processed",
		calories: 536,
		protein: 7,
		carbs: 53,
		fat: 35,
		unitLabel: "100g",
	},
	{
		id: 11,
		name: "Oat Porridge",
		category: "Grains",
		type: "Semi-Processed",
		calories: 71,
		protein: 2.5,
		carbs: 12,
		fat: 1.4,
		unitLabel: "100g cooked",
	},
	{
		id: 12,
		name: "Egg (whole)",
		category: "Meat",
		type: "Whole Food",
		calories: 155,
		protein: 13,
		carbs: 1.1,
		fat: 11,
		unitLabel: "100g (≈2 eggs)",
	},
	{
		id: 13,
		name: "Avocado",
		category: "Fruit",
		type: "Whole Food",
		calories: 160,
		protein: 2,
		carbs: 9,
		fat: 15,
		unitLabel: "100g",
	},
	{
		id: 14,
		name: "Protein Bar",
		category: "Snacks",
		type: "Processed",
		calories: 380,
		protein: 25,
		carbs: 40,
		fat: 10,
		unitLabel: "per bar (65g)",
	},
	{
		id: 15,
		name: "Black Beans",
		category: "Legumes",
		type: "Whole Food",
		calories: 132,
		protein: 8.9,
		carbs: 24,
		fat: 0.5,
		unitLabel: "100g cooked",
	},
]

const CATEGORY_VARIANT: Record<FoodCategory, BadgeProps["variant"]> = {
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

const TYPE_VARIANT: Record<FoodType, BadgeProps["variant"]> = {
	"Whole Food": "success",
	"Semi-Processed": "warning",
	Processed: "orange",
}

function MacroCell({value, unit = "g"}: {value: number; unit?: string}) {
	return (
		<span className="tabular-nums">
			{value}
			<span className="ml-0.5 text-muted-foreground text-xs">{unit}</span>
		</span>
	)
}

function RouteComponent() {
	return (
		<PageWrapper column className="items-start gap-6 py-8">
			<div className="flex flex-col gap-1">
				<Heading size="h1" tag="h1">
					Food Items
				</Heading>
				<Text size="muted">
					Browse all tracked food items with their nutritional breakdown per serving.
				</Text>
			</div>

			<section className="w-full rounded-lg border">
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
						</TableRow>
					</TableHeader>
					<TableBody>
						{FOOD_ITEMS.map(item => (
							<TableRow key={item.id}>
								<TableCell className="font-medium">{item.name}</TableCell>
								<TableCell>
									<Badge variant={CATEGORY_VARIANT[item.category]}>{item.category}</Badge>
								</TableCell>
								<TableCell>
									<Badge variant={TYPE_VARIANT[item.type]}>{item.type}</Badge>
								</TableCell>
								<TableCell className="text-right font-semibold tabular-nums">
									{item.calories}
								</TableCell>
								<TableCell className="text-right text-blue-600 dark:text-blue-400">
									<MacroCell value={item.protein} />
								</TableCell>
								<TableCell className="text-right text-amber-600 dark:text-amber-400">
									<MacroCell value={item.carbs} />
								</TableCell>
								<TableCell className="text-right text-rose-600 dark:text-rose-400">
									<MacroCell value={item.fat} />
								</TableCell>
								<TableCell className="text-muted-foreground text-xs">{item.unitLabel}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</section>
		</PageWrapper>
	)
}
