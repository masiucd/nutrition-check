import {useForm} from "@tanstack/react-form"
import {useRouter} from "@tanstack/react-router"
import {useServerFn} from "@tanstack/react-start"
import {PlusIcon} from "lucide-react"
import {useState} from "react"
import {z} from "zod"
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
import {FOOD_CATEGORIES, FOOD_TYPES} from "@/lib/constants"
import {type FoodCategoryName, type FoodTypeName, validate} from "@/lib/schemas"
import {createFoodItem} from "@/server/functions/food"
import {HttpStatusCode} from "@/server/utils/status_code"

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
