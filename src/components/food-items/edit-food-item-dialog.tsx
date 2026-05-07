import {useForm} from "@tanstack/react-form"
import {useRouter} from "@tanstack/react-router"
import {useServerFn} from "@tanstack/react-start"
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
} from "@/components/ui/dialog"
import {Field, FieldGroup} from "@/components/ui/field"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {FOOD_CATEGORIES, FOOD_TYPES} from "@/lib/constants"
import type {FoodCategoryName, FoodItem, FoodTypeName} from "@/lib/schemas"
import {validate} from "@/lib/schemas"
import {updateFoodItem} from "@/server/functions/food"
import {HttpStatusCode} from "@/server/utils/status_code"

function FieldError({errors, isTouched}: {errors: unknown[]; isTouched: boolean}) {
	if (!isTouched || errors.length === 0) return null
	return (
		<p className="text-destructive text-xs" role="alert">
			{String(errors[0])}
		</p>
	)
}

function parseOptionalNumber(raw: string): number | undefined {
	if (raw.trim() === "") return undefined
	const n = Number(raw)
	return Number.isNaN(n) ? undefined : n
}

interface Props {
	item: FoodItem | null
	onOpenChange: (open: boolean) => void
}

export function EditFoodItemDialog({item, onOpenChange}: Props) {
	if (!item) return null
	return <EditDialogForm key={item.id} item={item} onOpenChange={onOpenChange} />
}

function EditDialogForm({
	item,
	onOpenChange,
}: {
	item: FoodItem
	onOpenChange: (open: boolean) => void
}) {
	const [submitError, setSubmitError] = useState<string | null>(null)
	const router = useRouter()
	const updateFood = useServerFn(updateFoodItem)

	const form = useForm({
		defaultValues: {
			name: item.food_name,
			calories: item.calories_per_unit,
			protein: item.protein_per_unit,
			carbs: item.carbs_per_unit,
			fat: item.fat_per_unit,
			unitLabel: item.unit_label,
			category: item.food_category as FoodCategoryName | "",
			type: item.food_type as FoodTypeName | "",
		},
		onSubmit: async ({value}) => {
			setSubmitError(null)

			const caloriesNum = parseOptionalNumber(value.calories)
			if (caloriesNum === undefined) {
				setSubmitError("Calories is required and must be a valid number.")
				return
			}

			const response = await updateFood({
				data: {
					id: item.id,
					name: value.name,
					caloriesPerUnit: caloriesNum,
					proteinPerUnit: parseOptionalNumber(value.protein),
					carbsPerUnit: parseOptionalNumber(value.carbs),
					fatPerUnit: parseOptionalNumber(value.fat),
					unitLabel: value.unitLabel || undefined,
					categoryName: (value.category || undefined) as FoodCategoryName | undefined,
					typeName: (value.type || undefined) as FoodTypeName | undefined,
				},
			})

			if (response.status === HttpStatusCode.OK) {
				onOpenChange(false)
				await router.invalidate()
			} else {
				setSubmitError(response.error ?? "Failed to update food item.")
			}
		},
	})

	return (
		<Dialog open onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Edit food item</DialogTitle>
					<DialogDescription>
						Update the nutritional details for {item.food_name}.
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
									<Label htmlFor="edit-food-name">
										Name <span className="text-destructive">*</span>
									</Label>
									<Input
										id="edit-food-name"
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
										<Label htmlFor="edit-food-calories">
											Calories (kcal) <span className="text-destructive">*</span>
										</Label>
										<Input
											id="edit-food-calories"
											type="number"
											min="0"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={e => field.handleChange(e.target.value)}
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
										<Label htmlFor="edit-food-unit">Unit label</Label>
										<Input
											id="edit-food-unit"
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
										<Label htmlFor="edit-food-protein">Protein (g)</Label>
										<Input
											id="edit-food-protein"
											type="number"
											min="0"
											step="0.1"
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
										<Label htmlFor="edit-food-carbs">Carbs (g)</Label>
										<Input
											id="edit-food-carbs"
											type="number"
											min="0"
											step="0.1"
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
										<Label htmlFor="edit-food-fat">Fat (g)</Label>
										<Input
											id="edit-food-fat"
											type="number"
											min="0"
											step="0.1"
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
										<Label htmlFor="edit-food-category">Category</Label>
										<Select
											value={field.state.value}
											onValueChange={v => field.handleChange(v as FoodCategoryName | "")}
										>
											<SelectTrigger id="edit-food-category" className="w-full">
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
										<Label htmlFor="edit-food-type">Type</Label>
										<Select
											value={field.state.value}
											onValueChange={v => field.handleChange(v as FoodTypeName | "")}
										>
											<SelectTrigger id="edit-food-type" className="w-full">
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
									{isSubmitting ? "Saving…" : "Save changes"}
								</Button>
							)}
						</form.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
