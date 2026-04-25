import {useForm} from "@tanstack/react-form"
import {useServerFn} from "@tanstack/react-start"
import {Ruler, Weight} from "lucide-react"
import {useState} from "react"
import {Button} from "@/components/ui/button"
import {CardContent, CardFooter} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import type {UserData} from "@/lib/schemas"
import {updateUserProfileFn} from "@/server/functions/user"
import {HttpStatusCode} from "@/server/utils/status_code"
import {Alert} from "./alert"
import {SectionDivider} from "./tab-button"
import type {AlertState} from "./types"

export function PersonalDetailsForm({
	initialData,
	onSuccess,
}: {
	initialData: UserData | null
	onSuccess: (updated: UserData) => void
}) {
	const [alert, setAlert] = useState<AlertState>(null)
	const updateProfile = useServerFn(updateUserProfileFn)

	const form = useForm({
		defaultValues: {
			firstName: initialData?.first_name ?? "",
			lastName: initialData?.last_name ?? "",
			age: initialData?.age != null ? String(initialData.age) : "",
			gender: initialData?.gender === true ? "female" : initialData?.gender === false ? "male" : "",
			occupation: initialData?.occupation ?? "",
			height: initialData?.height != null ? String(initialData.height) : "",
			weight: initialData?.weight != null ? String(initialData.weight) : "",
			city: initialData?.city ?? "",
			country: initialData?.country ?? "",
		},
		onSubmit: async ({value}) => {
			setAlert(null)

			const rawAge = value.age.trim() ? parseInt(value.age, 10) : null
			const rawHeight = value.height.trim() ? parseFloat(value.height) : null
			const rawWeight = value.weight.trim() ? parseFloat(value.weight) : null
			const gender = value.gender === "female" ? true : value.gender === "male" ? false : null

			const response = await updateProfile({
				data: {
					firstName: value.firstName.trim() || undefined,
					lastName: value.lastName.trim() || undefined,
					age: rawAge !== null && !Number.isNaN(rawAge) ? rawAge : null,
					gender,
					occupation: value.occupation.trim() || undefined,
					height: rawHeight !== null && !Number.isNaN(rawHeight) ? rawHeight : null,
					weight: rawWeight !== null && !Number.isNaN(rawWeight) ? rawWeight : null,
					city: value.city.trim() || undefined,
					country: value.country.trim() || undefined,
				},
			})

			if (response.status === HttpStatusCode.OK && response.data) {
				setAlert({type: "success", message: "Personal details saved!"})
				onSuccess(response.data)
			} else {
				setAlert({type: "error", message: response.error ?? "Failed to save details"})
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

				{/* ── Identity ── */}
				<SectionDivider label="Identity" />

				<div className="grid grid-cols-2 gap-4">
					<form.Field name="firstName">
						{field => (
							<div className="space-y-1.5">
								<Label htmlFor="first-name">First name</Label>
								<Input
									id="first-name"
									type="text"
									placeholder="Jane"
									autoComplete="given-name"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={e => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="lastName">
						{field => (
							<div className="space-y-1.5">
								<Label htmlFor="last-name">Last name</Label>
								<Input
									id="last-name"
									type="text"
									placeholder="Doe"
									autoComplete="family-name"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={e => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<form.Field
						name="age"
						validators={{
							onBlur: ({value}) => {
								if (!value.trim()) return undefined
								const n = parseInt(value, 10)
								if (Number.isNaN(n)) return "Must be a number"
								if (n < 1 || n > 150) return "Must be between 1 and 150"
								return undefined
							},
						}}
					>
						{field => (
							<div className="space-y-1.5">
								<Label htmlFor="age">Age</Label>
								<Input
									id="age"
									type="number"
									inputMode="numeric"
									placeholder="25"
									min={1}
									max={150}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={e => field.handleChange(e.target.value)}
									aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
								/>
								{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-xs" role="alert">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="gender">
						{field => (
							<div className="space-y-1.5">
								<Label htmlFor="gender">Gender</Label>
								<select
									id="gender"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={e => field.handleChange(e.target.value)}
									className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
								>
									<option value="">Prefer not to say</option>
									<option value="male">Male</option>
									<option value="female">Female</option>
								</select>
							</div>
						)}
					</form.Field>
				</div>

				{/* ── Body metrics ── */}
				<SectionDivider label="Body metrics" />

				<div className="grid grid-cols-2 gap-4">
					<form.Field
						name="height"
						validators={{
							onBlur: ({value}) => {
								if (!value.trim()) return undefined
								const n = parseFloat(value)
								if (Number.isNaN(n)) return "Must be a number"
								if (n < 50 || n > 300) return "Must be between 50 and 300 cm"
								return undefined
							},
						}}
					>
						{field => (
							<div className="space-y-1.5">
								<Label htmlFor="height">Height</Label>
								<div className="relative">
									<Ruler className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										id="height"
										type="number"
										inputMode="decimal"
										placeholder="175"
										min={50}
										max={300}
										className="pr-10 pl-8"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={e => field.handleChange(e.target.value)}
										aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
									/>
									<span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground text-xs">
										cm
									</span>
								</div>
								{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-xs" role="alert">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field
						name="weight"
						validators={{
							onBlur: ({value}) => {
								if (!value.trim()) return undefined
								const n = parseFloat(value)
								if (Number.isNaN(n)) return "Must be a number"
								if (n < 20 || n > 600) return "Must be between 20 and 600 kg"
								return undefined
							},
						}}
					>
						{field => (
							<div className="space-y-1.5">
								<Label htmlFor="weight">Weight</Label>
								<div className="relative">
									<Weight className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										id="weight"
										type="number"
										inputMode="decimal"
										placeholder="70"
										min={20}
										max={600}
										className="pr-10 pl-8"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={e => field.handleChange(e.target.value)}
										aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
									/>
									<span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground text-xs">
										kg
									</span>
								</div>
								{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
									<p className="text-destructive text-xs" role="alert">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>
				</div>

				{/* ── Location ── */}
				<SectionDivider label="Location" />

				<div className="grid grid-cols-2 gap-4">
					<form.Field name="city">
						{field => (
							<div className="space-y-1.5">
								<Label htmlFor="city">City</Label>
								<Input
									id="city"
									type="text"
									placeholder="New York"
									autoComplete="address-level2"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={e => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="country">
						{field => (
							<div className="space-y-1.5">
								<Label htmlFor="country">Country</Label>
								<Input
									id="country"
									type="text"
									placeholder="United States"
									autoComplete="country-name"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={e => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>
				</div>

				{/* ── Work ── */}
				<SectionDivider label="Work" />

				<form.Field name="occupation">
					{field => (
						<div className="space-y-1.5">
							<Label htmlFor="occupation">Occupation</Label>
							<Input
								id="occupation"
								type="text"
								placeholder="Software engineer"
								autoComplete="organization-title"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={e => field.handleChange(e.target.value)}
							/>
						</div>
					)}
				</form.Field>
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
							{isSubmitting ? "Saving…" : "Save details"}
						</Button>
					)}
				</form.Subscribe>
			</CardFooter>
		</form>
	)
}
