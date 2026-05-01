import {useForm} from "@tanstack/react-form"
import {createFileRoute, useNavigate, useRouter} from "@tanstack/react-router"
import {useServerFn} from "@tanstack/react-start"
import {FilterX, PlusIcon} from "lucide-react"
import {useMemo, useState} from "react"
import {z} from "zod"
import {FoodTable} from "@/components/food-items/food_table"
import {Heading, Text} from "@/components/typography"
import {Button} from "@/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import {Field, FieldGroup} from "@/components/ui/field"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {PageWrapper} from "@/components/wrappers/page"
import {type FoodCategoryName, type FoodTypeName, validate} from "@/lib/schemas"
import {createFoodItem, getFoodItems} from "@/server/functions/food"
import {HttpStatusCode} from "@/server/utils/status_code"

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
							<FilterX />
						</Button>

						{user !== null && <NewFoodItemDialog />}
					</div>
				</div>

				<FoodTable items={filteredItems} user={user} />
			</section>
		</PageWrapper>
	)
}

// ---- Field error helper ----------------------------------------------------

function FieldError({errors, isTouched}: {errors: unknown[]; isTouched: boolean}) {
	if (!isTouched || errors.length === 0) return null
	return (
		<p className="text-destructive text-xs" role="alert">
			{String(errors[0])}
		</p>
	)
}

// ---- Numeric input helper --------------------------------------------------

/** Parses the string value of a numeric input. Returns undefined for empty strings. */
function parseOptionalNumber(raw: string): number | undefined {
	if (raw.trim() === "") return undefined
	const n = Number(raw)
	return Number.isNaN(n) ? undefined : n
}

// ---- NewFoodItemDialog -----------------------------------------------------

export function NewFoodItemDialog() {
	const [open, setOpen] = useState(false)
	const [submitError, setSubmitError] = useState<string | null>(null)
	const router = useRouter()
	const addFood = useServerFn(createFoodItem)

	const form = useForm({
		defaultValues: {
			name: "",
			calories: "",
			protein: "",
			carbs: "",
			fat: "",
			unitLabel: "",
			category: "" as FoodCategoryName | "",
			type: "" as FoodTypeName | "",
		},
		onSubmit: async ({value}) => {
			setSubmitError(null)

			const caloriesNum = parseOptionalNumber(value.calories)
			if (caloriesNum === undefined) {
				setSubmitError("Calories is required and must be a valid number.")
				return
			}

			const response = await addFood({
				data: {
					name: value.name,
					caloriesPerUnit: caloriesNum,
					proteinPerUnit: parseOptionalNumber(value.protein),
					carbsPerUnit: parseOptionalNumber(value.carbs),
					fatPerUnit: parseOptionalNumber(value.fat),
					unitLabel: value.unitLabel || undefined,
					categoryName: value.category || undefined,
					typeName: value.type || undefined,
				},
			})

			if (response.status === HttpStatusCode.OK) {
				form.reset()
				setOpen(false)
				await router.invalidate()
			} else {
				setSubmitError(response.error ?? "Failed to create food item.")
			}
		},
	})

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="md:ml-auto">
					<PlusIcon />
					Add food
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Add food item</DialogTitle>
					<DialogDescription>
						Fill in the nutritional details for the new food. Only name and calories are required.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={e => {
						e.preventDefault()
						form.handleSubmit()
					}}
					noValidate
				>
					<FieldGroup className="space-y-4">
						{/* ── Name ──────────────────────────────── */}
						<form.Field
							name="name"
							validators={{
								onBlur: ({value}) => validate(z.string().min(1, "Name is required"), value),
							}}
						>
							{field => (
								<Field>
									<Label htmlFor="food-name">
										Name <span className="text-destructive">*</span>
									</Label>
									<Input
										id="food-name"
										placeholder="e.g. Chicken Breast"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={e => field.handleChange(e.target.value)}
										aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
										required
									/>
									<FieldError
										errors={field.state.meta.errors}
										isTouched={field.state.meta.isTouched}
									/>
								</Field>
							)}
						</form.Field>

						{/* ── Calories + Unit label ─────────────── */}
						<div className="grid grid-cols-2 gap-3">
							<form.Field name="calories">
								{field => (
									<Field>
										<Label htmlFor="food-calories">
											Calories (kcal) <span className="text-destructive">*</span>
										</Label>
										<Input
											id="food-calories"
											type="number"
											min="0"
											placeholder="0"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={e => field.handleChange(e.target.value)}
											aria-invalid={
												field.state.meta.isTouched && field.state.meta.errors.length > 0
											}
											required
										/>
										<FieldError
											errors={field.state.meta.errors}
											isTouched={field.state.meta.isTouched}
										/>
									</Field>
								)}
							</form.Field>

							<form.Field name="unitLabel">
								{field => (
									<Field>
										<Label htmlFor="food-unit">Unit label</Label>
										<Input
											id="food-unit"
											placeholder="serving"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={e => field.handleChange(e.target.value)}
										/>
									</Field>
								)}
							</form.Field>
						</div>

						{/* ── Macros ────────────────────────────── */}
						<div className="grid grid-cols-3 gap-3">
							<form.Field name="protein">
								{field => (
									<Field>
										<Label htmlFor="food-protein">Protein (g)</Label>
										<Input
											id="food-protein"
											type="number"
											min="0"
											step="0.1"
											placeholder="0"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={e => field.handleChange(e.target.value)}
										/>
									</Field>
								)}
							</form.Field>

							<form.Field name="carbs">
								{field => (
									<Field>
										<Label htmlFor="food-carbs">Carbs (g)</Label>
										<Input
											id="food-carbs"
											type="number"
											min="0"
											step="0.1"
											placeholder="0"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={e => field.handleChange(e.target.value)}
										/>
									</Field>
								)}
							</form.Field>

							<form.Field name="fat">
								{field => (
									<Field>
										<Label htmlFor="food-fat">Fat (g)</Label>
										<Input
											id="food-fat"
											type="number"
											min="0"
											step="0.1"
											placeholder="0"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={e => field.handleChange(e.target.value)}
										/>
									</Field>
								)}
							</form.Field>
						</div>

						{/* ── Category + Type ───────────────────── */}
						<div className="grid grid-cols-2 gap-3">
							<form.Field name="category">
								{field => (
									<Field>
										<Label htmlFor="food-category">Category</Label>
										<Select
											value={field.state.value}
											onValueChange={v => field.handleChange(v as FoodCategoryName | "")}
										>
											<SelectTrigger id="food-category" className="w-full">
												<SelectValue placeholder="Select…" />
											</SelectTrigger>
											<SelectContent>
												{FOOD_CATEGORIES.map(cat => (
													<SelectItem key={cat} value={cat}>
														{cat}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</Field>
								)}
							</form.Field>

							<form.Field name="type">
								{field => (
									<Field>
										<Label htmlFor="food-type">Type</Label>
										<Select
											value={field.state.value}
											onValueChange={v => field.handleChange(v as FoodTypeName | "")}
										>
											<SelectTrigger id="food-type" className="w-full">
												<SelectValue placeholder="Select…" />
											</SelectTrigger>
											<SelectContent>
												{FOOD_TYPES.map(t => (
													<SelectItem key={t} value={t}>
														{t}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</Field>
								)}
							</form.Field>
						</div>

						{/* ── Submit error ──────────────────────── */}
						{submitError && (
							<p
								className="rounded-lg bg-destructive/10 px-3 py-2 text-destructive text-sm"
								role="alert"
							>
								{submitError}
							</p>
						)}
					</FieldGroup>

					<DialogFooter className="mt-6">
						<DialogClose asChild>
							<Button type="button" variant="outline">
								Cancel
							</Button>
						</DialogClose>
						<form.Subscribe selector={s => [s.isSubmitting, s.canSubmit]}>
							{([isSubmitting, canSubmit]) => (
								<Button type="submit" disabled={!canSubmit || isSubmitting}>
									{isSubmitting ? "Saving…" : "Save food item"}
								</Button>
							)}
						</form.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
