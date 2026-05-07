import {createFileRoute, useNavigate} from "@tanstack/react-router"
import {FilterX} from "lucide-react"
import {useMemo} from "react"
import {FoodTable, type SortableColumn, type SortDir} from "@/components/food-items/food_table"
import {NewFoodItemDialog} from "@/components/food-items/new-food-items-dialog"
import {Heading, Text} from "@/components/typography"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {PageWrapper} from "@/components/wrappers/page"
import {FOOD_CATEGORIES, FOOD_TYPES} from "@/lib/constants"
import type {FoodCategoryName, FoodTypeName} from "@/lib/schemas"
import {getFoodItems} from "@/server/functions/food"

const SORTABLE_COLUMNS: readonly SortableColumn[] = [
	"food_name",
	"food_category",
	"food_type",
	"calories_per_unit",
	"protein_per_unit",
	"carbs_per_unit",
	"fat_per_unit",
]

type FoodItemsSearch = {
	q?: string
	types?: FoodTypeName[]
	categories?: FoodCategoryName[]
	sortBy?: SortableColumn
	sortDir?: SortDir
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
		const sortBy =
			typeof search.sortBy === "string" &&
			SORTABLE_COLUMNS.includes(search.sortBy as SortableColumn)
				? (search.sortBy as SortableColumn)
				: undefined
		const sortDir =
			search.sortDir === "asc" || search.sortDir === "desc" ? search.sortDir : undefined

		return {
			...(q ? {q} : {}),
			...(types.length > 0 ? {types} : {}),
			...(categories.length > 0 ? {categories} : {}),
			...(sortBy ? {sortBy} : {}),
			...(sortDir ? {sortDir} : {}),
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
	const sortBy = search.sortBy
	const sortDir = search.sortDir ?? "asc"

	const update = (next: Partial<FoodItemsSearch>) => {
		navigate({
			search: prev => {
				const nextQ = next.q ?? prev.q ?? ""
				const nextTypes = next.types ?? prev.types ?? []
				const nextCategories = next.categories ?? prev.categories ?? []
				const nextSortBy = "sortBy" in next ? next.sortBy : prev.sortBy
				const nextSortDir = "sortDir" in next ? next.sortDir : prev.sortDir

				return {
					...(nextQ ? {q: nextQ} : {}),
					...(nextTypes.length > 0 ? {types: nextTypes} : {}),
					...(nextCategories.length > 0 ? {categories: nextCategories} : {}),
					...(nextSortBy ? {sortBy: nextSortBy} : {}),
					...(nextSortDir ? {sortDir: nextSortDir} : {}),
				}
			},
			replace: true,
		})
	}

	const reset = () => navigate({search: () => ({}), replace: true})

	const toggleSort = (column: SortableColumn) => {
		if (sortBy === column) {
			// Flip direction, or clear if already desc
			if (sortDir === "desc") {
				update({sortBy: undefined, sortDir: undefined})
			} else {
				update({sortBy: column, sortDir: "desc"})
			}
		} else {
			update({sortBy: column, sortDir: "asc"})
		}
	}

	return {
		q,
		selectedTypes,
		selectedCategories,
		sortBy,
		sortDir,
		onSearchChange: (value: string) => update({q: value}),
		toggleType: (value: FoodTypeName) => update({types: toggle(selectedTypes, value)}),
		toggleCategory: (value: FoodCategoryName) =>
			update({categories: toggle(selectedCategories, value)}),
		toggleSort,
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
	const {
		q,
		selectedTypes,
		selectedCategories,
		sortBy,
		sortDir,
		onSearchChange,
		toggleType,
		toggleCategory,
		toggleSort,
		reset,
	} = useFoodFilters()

	const filteredItems = useMemo(() => {
		const text = q.trim().toLowerCase()

		const filtered = foodItems.data.filter(item => {
			const matchesText = !text || item.food_name.toLowerCase().includes(text)
			const matchesType =
				!selectedTypes.length || selectedTypes.includes(item.food_type as FoodTypeName)
			const matchesCategory =
				!selectedCategories.length ||
				selectedCategories.includes(item.food_category as FoodCategoryName)

			return matchesText && matchesType && matchesCategory
		})

		if (!sortBy) return filtered

		return [...filtered].sort((a, b) => {
			const aVal = a[sortBy]
			const bVal = b[sortBy]
			const cmp =
				typeof aVal === "number" && typeof bVal === "number"
					? aVal - bVal
					: String(aVal).localeCompare(String(bVal))
			return sortDir === "desc" ? -cmp : cmp
		})
	}, [foodItems.data, q, selectedTypes, selectedCategories, sortBy, sortDir])

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
							<FilterX />
						</Button>

						{user !== null && <NewFoodItemDialog />}
					</div>
				</div>

				<FoodTable
					items={filteredItems}
					user={user}
					sortBy={sortBy}
					sortDir={sortDir}
					onSort={toggleSort}
				/>
			</section>
		</PageWrapper>
	)
}
