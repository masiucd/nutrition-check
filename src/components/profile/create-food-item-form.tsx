import {useForm} from "@tanstack/react-form"
import {useRouter} from "@tanstack/react-router"
import {useServerFn} from "@tanstack/react-start"
import {useState} from "react"
import {z} from "zod"
import {Button} from "@/components/ui/button"
import {CardContent, CardFooter} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {FOOD_CATEGORIES, FOOD_TYPES} from "@/lib/constants"
import {type FoodCategoryName, type FoodTypeName, validate} from "@/lib/schemas"
import {createFoodItem} from "@/server/functions/food"
import {HttpStatusCode} from "@/server/utils/status_code"
import {Alert} from "./alert"
import {SectionDivider} from "./tab-button"
import type {AlertState} from "./types"

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

export function CreateFoodItemForm() {
	const [alert, setAlert] = useState<AlertState>(null)
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
			setAlert(null)

			const caloriesNum = parseOptionalNumber(value.calories)
			if (caloriesNum === undefined) {
				setAlert({type: "error", message: "Calories is required and must be a valid number."})
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
				setAlert({type: "success", message: "Food item created!"})
				form.reset()
				await router.invalidate()
			} else {
				setAlert({type: "error", message: response.error ?? "Failed to create food item."})
			}
		},
	})

	return (
		<form
			onSubmit={e => {
				e.preventDefault()
				form.handleSubmit()
			}}
			noValidate
		>
			<CardContent className="space-y-5">
				<Alert state={alert} />

				<SectionDivider label="Basic info" />

				<form.Field
					name="name"
					validators={{
						onBlur: ({value}) => validate(z.string().min(1, "Name is required"), value),
					}}
				>
					{field => (
						<div className="space-y-1.5">
							<Label htmlFor="cf-name">
								Name <span className="text-destructive">*</span>
							</Label>
							<Input
								id="cf-name"
								placeholder="e.g. Chicken Breast"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={e => field.handleChange(e.target.value)}
								aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
								required
							/>
							<FieldError errors={field.state.meta.errors} isTouched={field.state.meta.isTouched} />
						</div>
					)}
				</form.Field>

				<div className="grid grid-cols-2 gap-4">
					<form.Field name="calories">
						{field => (
							<div className="space-y-1.5">
								<Label htmlFor="cf-calories">
									Calories (kcal) <span className="text-destructive">*</span>
								</Label>
								<Input
									id="cf-calories"
									type="number"
									min="0"
									placeholder="0"
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
							</div>
						)}
					</form.Field>

					<form.Field name="unitLabel">
						{field => (
							<div className="space-y-1.5">
								<Label htmlFor="cf-unit">Unit label</Label>
								<Input
									id="cf-unit"
									placeholder="serving"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={e => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>
				</div>

				<SectionDivider label="Macros" />

				<div className="grid grid-cols-3 gap-4">
					<form.Field name="protein">
						{field => (
							<div className="space-y-1.5">
								<Label htmlFor="cf-protein">Protein (g)</Label>
								<Input
									id="cf-protein"
									type="number"
									min="0"
									step="0.1"
									placeholder="0"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={e => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="carbs">
						{field => (
							<div className="space-y-1.5">
								<Label htmlFor="cf-carbs">Carbs (g)</Label>
								<Input
									id="cf-carbs"
									type="number"
									min="0"
									step="0.1"
									placeholder="0"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={e => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="fat">
						{field => (
							<div className="space-y-1.5">
								<Label htmlFor="cf-fat">Fat (g)</Label>
								<Input
									id="cf-fat"
									type="number"
									min="0"
									step="0.1"
									placeholder="0"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={e => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>
				</div>

				<SectionDivider label="Classification" />

				<div className="grid grid-cols-2 gap-4">
					<form.Field name="category">
						{field => (
							<div className="space-y-1.5">
								<Label htmlFor="cf-category">Category</Label>
								<Select
									value={field.state.value}
									onValueChange={v => field.handleChange(v as FoodCategoryName | "")}
								>
									<SelectTrigger id="cf-category" className="w-full">
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
							</div>
						)}
					</form.Field>

					<form.Field name="type">
						{field => (
							<div className="space-y-1.5">
								<Label htmlFor="cf-type">Type</Label>
								<Select
									value={field.state.value}
									onValueChange={v => field.handleChange(v as FoodTypeName | "")}
								>
									<SelectTrigger id="cf-type" className="w-full">
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
							</div>
						)}
					</form.Field>
				</div>
			</CardContent>

			<CardFooter>
				<form.Subscribe selector={s => [s.isSubmitting, s.canSubmit, s.isDirty]}>
					{([isSubmitting, canSubmit, isDirty]) => (
						<Button
							type="submit"
							className="w-full"
							disabled={!canSubmit || !isDirty}
							variant={canSubmit && isDirty ? "default" : "blurred"}
						>
							{isSubmitting ? "Saving…" : "Add food item"}
						</Button>
					)}
				</form.Subscribe>
			</CardFooter>
		</form>
	)
}
