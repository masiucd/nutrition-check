import {createFileRoute, useNavigate} from "@tanstack/react-router"
import {PlusIcon} from "lucide-react"
import {useMemo} from "react"
import {FoodTable} from "@/components/food-items/food_table"
import {Heading, Text} from "@/components/typography"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
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

// ---- Helpers ---------------------------------------------------------------

function toValidArray<T extends string>(value: unknown, options: readonly T[]): T[] {
	const raw = Array.isArray(value) ? value : typeof value === "string" ? [value] : []
	return raw
		.filter((v): v is string => typeof v === "string")
		.filter((v): v is T => options.includes(v as T))
}

function toggle<T>(arr: T[], value: T): T[] {
	return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
}

// ---- Route -----------------------------------------------------------------

export const Route = createFileRoute("/food_items/")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>): FoodItemsSearch => {
		const q = typeof search.q === "string" ? search.q : undefined
		const types = toValidArray(search.types, FOOD_TYPES)
		const categories = toValidArray(search.categories, FOOD_CATEGORIES)

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

// ---- Hook ------------------------------------------------------------------

function useFoodFilters() {
	const search = Route.useSearch()
	const navigate = useNavigate({from: Route.fullPath})

	const q = search.q ?? ""
	const selectedTypes = search.types ?? []
	const selectedCategories = search.categories ?? []

	const update = (next: Partial<FoodItemsSearch>) => {
		navigate({
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

	const reset = () => navigate({search: () => ({}), replace: true})

	return {
		q,
		selectedTypes,
		selectedCategories,
		onSearchChange: (value: string) => update({q: value}),
		toggleType: (value: FoodTypeName) => update({types: toggle(selectedTypes, value)}),
		toggleCategory: (value: FoodCategoryName) =>
			update({categories: toggle(selectedCategories, value)}),
		reset,
	}
}

// ---- Sub-components --------------------------------------------------------

type FilterGroupProps<T extends string> = {
	label: string
	options: readonly T[]
	selected: T[]
	onToggle: (value: T) => void
}

function FilterGroup<T extends string>({label, options, selected, onToggle}: FilterGroupProps<T>) {
	return (
		<div>
			<Text size="muted" className="mb-2">
				{label}
			</Text>
			<div className="flex flex-wrap gap-3">
				{options.map(option => (
					<label key={option} className="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							checked={selected.includes(option)}
							onChange={() => onToggle(option)}
						/>
						{option}
					</label>
				))}
			</div>
		</div>
	)
}

// ---- Route Component -------------------------------------------------------

function RouteComponent() {
	const {user, foodItems} = Route.useLoaderData()
	const {q, selectedTypes, selectedCategories, onSearchChange, toggleType, toggleCategory, reset} =
		useFoodFilters()

	const filteredItems = useMemo(() => {
		const text = q.trim().toLowerCase()

		return foodItems.data.filter(item => {
			const matchesText = !text || item.food_name.toLowerCase().includes(text)
			const matchesType =
				!selectedTypes.length || selectedTypes.includes(item.food_type as FoodTypeName)
			const matchesCategory =
				!selectedCategories.length ||
				selectedCategories.includes(item.food_category as FoodCategoryName)

			return matchesText && matchesType && matchesCategory
		})
	}, [foodItems.data, q, selectedTypes, selectedCategories])

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
							onChange={e => onSearchChange(e.target.value)}
							placeholder="Filter by food name..."
						/>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<FilterGroup
							label="Type"
							options={FOOD_TYPES}
							selected={selectedTypes}
							onToggle={toggleType}
						/>
						<FilterGroup
							label="Category"
							options={FOOD_CATEGORIES}
							selected={selectedCategories}
							onToggle={toggleCategory}
						/>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<Button variant="outline" onClick={reset}>
							Reset
						</Button>

						{user !== null && (
							<Button className="md:ml-auto">
								New Food Item <PlusIcon />
							</Button>
						)}
					</div>
				</div>

				<FoodTable items={filteredItems} user={user} />
			</section>
		</PageWrapper>
	)
}
