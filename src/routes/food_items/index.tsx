import {createFileRoute, Link} from "@tanstack/react-router"
import {PlusIcon} from "lucide-react"
import {Heading, Text} from "@/components/typography"
import type {BadgeProps} from "@/components/ui/badge"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {PageWrapper} from "@/components/wrappers/page"
import {getFoodItems} from "@/server/functions/food"

export const Route = createFileRoute("/food_items/")({
	component: RouteComponent,
	loader: async ({context}) => {
		const user = context.user
		try {
			const foodItems = await getFoodItems()
			// biome-ignore lint/suspicious/noConsole: <explanation>
			console.log("foodItems", foodItems)
			return {user, foodItems}
		} catch (error) {
			// biome-ignore lint/suspicious/noConsole: <error logging>
			console.error(error)
			return {
				user: null,
				foodItems: {data: [], error: error instanceof Error ? error.message : String(error)},
			}
		}
	},
})

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
	const {user, foodItems} = Route.useLoaderData()
	const isAuthenticated = user !== null

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
				{isAuthenticated && (
					<Button>
						New Food Item <PlusIcon />
					</Button>
				)}

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
						{foodItems.data.length === 0 ? (
							<TableRow>
								<TableCell colSpan={isAuthenticated ? 6 : 5} className="text-center">
									No food items found.
								</TableCell>
							</TableRow>
						) : (
							foodItems.data.map(item => (
								<TableRow key={item.id}>
									<TableCell className="font-medium">
										<Link to="/food_items/$foodid" params={{foodid: `${item.id}`}}>
											{item.food_name}
										</Link>
									</TableCell>
									<TableCell>
										<Badge variant={CATEGORY_VARIANT[item.food_category]}>
											{item.food_category}
										</Badge>
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
									{user !== null && (
										<TableCell className="text-right font-semibold tabular-nums">
											<div>
												<Button variant="ghost" size="sm">
													Edit {item.food_name}
												</Button>
												<Button variant="ghost" size="sm" disabled={user.id === item.user_id}>
													Delete
												</Button>
											</div>
										</TableCell>
									)}
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</section>
		</PageWrapper>
	)
}

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
