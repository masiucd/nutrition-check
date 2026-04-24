import {createFileRoute, Link, useNavigate} from "@tanstack/react-router"
import {PlusIcon} from "lucide-react"
import {useMemo} from "react"
import {Heading, Text} from "@/components/typography"
import type {BadgeProps} from "@/components/ui/badge"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {PageWrapper} from "@/components/wrappers/page"
import type {FoodCategory, FoodType} from "@/db/types"
import {getFoodItems} from "@/server/functions/food"

const FOOD_CATEGORIES = [
	"Fruit",
	"Vegetable",
	"Meat",
	"Dairy",
	"Grains",
	"Legumes",
	"Nuts & Seeds",
	"Snacks",
	"Seafood",
] as const satisfies readonly FoodCategory[]

const FOOD_TYPES = [
	"Whole Food",
	"Semi-Processed",
	"Processed",
] as const satisfies readonly FoodType[]

type FoodItemsSearch = {
	q?: string
	type?: FoodType | "all"
	category?: FoodCategory | "all"
}

export const Route = createFileRoute("/food_items/")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>): FoodItemsSearch => {
		const q = typeof search.q === "string" ? search.q : undefined

		const type =
			typeof search.type === "string" &&
			(search.type === "all" || FOOD_TYPES.includes(search.type as FoodType))
				? (search.type as FoodType | "all")
				: undefined

		const category =
			typeof search.category === "string" &&
			(search.category === "all" || FOOD_CATEGORIES.includes(search.category as FoodCategory))
				? (search.category as FoodCategory | "all")
				: undefined

		return {q, type, category}
	},
	loader: async ({context}) => {
		const user = context.user
		try {
			const foodItems = await getFoodItems()
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

type Unit = "g" | "ml" | "piece"

function MacroCell({value, unit = "g"}: {value: string; unit?: Unit}) {
	return (
		<span className="tabular-nums">
			{value}
			<span className="-foreground ml-0.5 text-muted text-xs">{unit}</span>
		</span>
	)
}

function RouteComponent() {
	const {user, foodItems} = Route.useLoaderData()
	const search = Route.useSearch()
	const navigate = useNavigate({from: Route.fullPath})
	const isAuthenticated = user !== null

	const q = search.q ?? ""
	const type = search.type ?? "all"
	const category = search.category ?? "all"

	const filteredItems = useMemo(() => {
		const text = q.trim().toLowerCase()

		return foodItems.data.filter(item => {
			const matchesText = text.length === 0 || item.food_name.toLowerCase().includes(text)
			const matchesType = type === "all" || item.food_type === type
			const matchesCategory = category === "all" || item.food_category === category

			return matchesText && matchesType && matchesCategory
		})
	}, [foodItems.data, q, type, category])

	const updateSearch = (
		next: Partial<{q: string; type: FoodType | "all"; category: FoodCategory | "all"}>,
	) => {
		void navigate({
			search: prev => {
				const nextQ = next.q ?? prev.q ?? ""
				const nextType = next.type ?? prev.type ?? "all"
				const nextCategory = next.category ?? prev.category ?? "all"

				return {
					...(nextQ ? {q: nextQ} : {}),
					...(nextType !== "all" ? {type: nextType} : {}),
					...(nextCategory !== "all" ? {category: nextCategory} : {}),
				}
			},
			replace: true,
		})
	}

	const resetFilters = () => {
		void navigate({
			search: () => ({}),
			replace: true,
		})
	}

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

			<section className="w-full rounded-lg border p-4">
				<div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end">
					<div className="w-full md:max-w-sm">
						<Text size="muted" className="mb-1">
							Search
						</Text>
						<Input
							value={q}
							onChange={event => updateSearch({q: event.target.value})}
							placeholder="Filter by food name..."
						/>
					</div>

					<div className="w-full md:w-56">
						<Text size="muted" className="mb-1">
							Type
						</Text>
						<Select
							value={type}
							onValueChange={value => updateSearch({type: value as FoodType | "all"})}
						>
							<SelectTrigger>
								<SelectValue placeholder="All types" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All types</SelectItem>
								{FOOD_TYPES.map(foodType => (
									<SelectItem key={foodType} value={foodType}>
										{foodType}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="w-full md:w-56">
						<Text size="muted" className="mb-1">
							Category
						</Text>
						<Select
							value={category}
							onValueChange={value => updateSearch({category: value as FoodCategory | "all"})}
						>
							<SelectTrigger>
								<SelectValue placeholder="All categories" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All categories</SelectItem>
								{FOOD_CATEGORIES.map(foodCategory => (
									<SelectItem key={foodCategory} value={foodCategory}>
										{foodCategory}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Button variant="outline" onClick={resetFilters}>
						Reset
					</Button>

					{isAuthenticated && (
						<Button className="md:ml-auto">
							New Food Item <PlusIcon />
						</Button>
					)}
				</div>

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
						{filteredItems.length === 0 ? (
							<TableRow>
								<TableCell colSpan={isAuthenticated ? 9 : 8} className="text-center">
									No food items found.
								</TableCell>
							</TableRow>
						) : (
							filteredItems.map(item => (
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
									{isAuthenticated && (
										<TableCell className="text-right font-semibold tabular-nums">
											<div className="flex gap-2">
												<Button variant="ghost" size="sm" disabled={user.id !== item.user_id}>
													Edit {item.food_name}
												</Button>
												<Button variant="ghost" size="sm" disabled={user.id !== item.user_id}>
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
