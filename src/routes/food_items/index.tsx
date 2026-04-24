import {createFileRoute, Link, useNavigate} from "@tanstack/react-router"
import {PlusIcon} from "lucide-react"
import {useMemo} from "react"
import {Heading, Text} from "@/components/typography"
import type {BadgeProps} from "@/components/ui/badge"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {PageWrapper} from "@/components/wrappers/page"
import type {FoodCategoryName, FoodTypeName} from "@/lib/schemas"
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
] as const satisfies readonly FoodCategoryName[]

const FOOD_TYPES = [
	"Whole Food",
	"Semi-Processed",
	"Processed",
] as const satisfies readonly FoodTypeName[]

type FoodItemsSearch = {
	q?: string
	types?: FoodTypeName[]
	categories?: FoodCategoryName[]
}

export const Route = createFileRoute("/food_items/")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>): FoodItemsSearch => {
		const q = typeof search.q === "string" ? search.q : undefined

		const rawTypes = Array.isArray(search.types)
			? search.types
			: typeof search.types === "string"
				? [search.types]
				: []

		const rawCategories = Array.isArray(search.categories)
			? search.categories
			: typeof search.categories === "string"
				? [search.categories]
				: []

		const types = rawTypes
			.filter((value): value is string => typeof value === "string")
			.filter((value): value is FoodTypeName => FOOD_TYPES.includes(value as FoodTypeName))

		const categories = rawCategories
			.filter((value): value is string => typeof value === "string")
			.filter((value): value is FoodCategoryName =>
				FOOD_CATEGORIES.includes(value as FoodCategoryName),
			)

		return {
			...(q ? {q} : {}),
			...(types.length > 0 ? {types} : {}),
			...(categories.length > 0 ? {categories} : {}),
		}
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

function RouteComponent() {
	const {user, foodItems} = Route.useLoaderData()
	const search = Route.useSearch()
	const navigate = useNavigate({from: Route.fullPath})
	const isAuthenticated = user !== null

	const q = search.q ?? ""
	const selectedTypes = search.types ?? []
	const selectedCategories = search.categories ?? []

	const filteredItems = useMemo(() => {
		const text = q.trim().toLowerCase()

		return foodItems.data.filter(item => {
			const matchesText = text.length === 0 || item.food_name.toLowerCase().includes(text)
			const matchesType =
				selectedTypes.length === 0 || selectedTypes.some(type => type === item.food_type)
			const matchesCategory =
				selectedCategories.length === 0 ||
				selectedCategories.some(category => category === item.food_category)

			return matchesText && matchesType && matchesCategory
		})
	}, [foodItems.data, q, selectedTypes, selectedCategories])

	const updateSearch = (next: Partial<FoodItemsSearch>) => {
		void navigate({
			search: prev => {
				const nextQ = next.q ?? prev.q ?? ""
				const nextTypes = next.types ?? prev.types ?? []
				const nextCategories = next.categories ?? prev.categories ?? []

				return {
					...(nextQ ? {q: nextQ} : {}),
					...(nextTypes.length > 0 ? {types: nextTypes} : {}),
					...(nextCategories.length > 0 ? {categories: nextCategories} : {}),
				}
			},
			replace: true,
		})
	}

	const toggleType = (value: FoodTypeName) => {
		const nextTypes = selectedTypes.includes(value)
			? selectedTypes.filter(type => type !== value)
			: [...selectedTypes, value]

		updateSearch({types: nextTypes})
	}

	const toggleCategory = (value: FoodCategoryName) => {
		const nextCategories = selectedCategories.includes(value)
			? selectedCategories.filter(category => category !== value)
			: [...selectedCategories, value]

		updateSearch({categories: nextCategories})
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
				<div className="mb-4 flex flex-col gap-4">
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

					<div className="grid gap-4 md:grid-cols-2">
						<div>
							<Text size="muted" className="mb-2">
								Type
							</Text>
							<div className="flex flex-wrap gap-3">
								{FOOD_TYPES.map(foodType => (
									<label key={foodType} className="flex items-center gap-2 text-sm">
										<input
											type="checkbox"
											checked={selectedTypes.includes(foodType)}
											onChange={() => toggleType(foodType)}
										/>
										{foodType}
									</label>
								))}
							</div>
						</div>

						<div>
							<Text size="muted" className="mb-2">
								Category
							</Text>
							<div className="flex flex-wrap gap-3">
								{FOOD_CATEGORIES.map(foodCategory => (
									<label key={foodCategory} className="flex items-center gap-2 text-sm">
										<input
											type="checkbox"
											checked={selectedCategories.includes(foodCategory)}
											onChange={() => toggleCategory(foodCategory)}
										/>
										{foodCategory}
									</label>
								))}
							</div>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<Button variant="outline" onClick={resetFilters}>
							Reset
						</Button>

						{isAuthenticated && (
							<Button className="md:ml-auto">
								New Food Item <PlusIcon />
							</Button>
						)}
					</div>
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
