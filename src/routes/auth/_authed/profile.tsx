import {useForm} from "@tanstack/react-form"
import {createFileRoute, useRouter} from "@tanstack/react-router"
import {useServerFn} from "@tanstack/react-start"
import {
	Calendar,
	ClipboardList,
	KeyRound,
	Mail,
	Ruler,
	ShieldCheck,
	User,
	Weight,
} from "lucide-react"
import {type PropsWithChildren, useState} from "react"
import {z} from "zod"
import {Button} from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {PageWrapper} from "@/components/wrappers/page"
import {cn} from "@/lib/utils"
import {
	getCurrentUserFn,
	getUserProfileFn,
	updateUserEmailFn,
	updateUserPasswordFn,
	updateUserProfileFn,
} from "@/server/functions/user"
import {HttpStatusCode} from "@/server/utils/status_code"

// ─── Types ────────────────────────────────────────────────────────────────────

type UserDataRow = NonNullable<Awaited<ReturnType<typeof getUserProfileFn>>["data"]>

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/auth/_authed/profile")({
	component: RouteComponent,
	loader: async () => {
		const [user, profileRes] = await Promise.all([getCurrentUserFn(), getUserProfileFn()])
		return {user, userData: profileRes.data}
	},
	pendingComponent: () => {
		return <div>...loading</div>
	},
})

// ─── Zod Validators ───────────────────────────────────────────────────────────

const emailSchema = z.email("Please enter a valid email address")
const currentPasswordSchema = z.string().min(1, "Current password is required")
const newPasswordSchema = z
	.string()
	.min(1, "New password is required")
	.min(6, "Password must be at least 6 characters")
const confirmPasswordSchema = z.string().min(1, "Please confirm your new password")

function validate<T>(schema: z.ZodType<T>, value: T): string | undefined {
	const result = schema.safeParse(value)
	return result.success ? undefined : result.error.issues[0]?.message
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(email: string, firstName?: string, lastName?: string) {
	if (firstName && lastName) {
		const initials = firstName[0] + lastName[0]
		return initials.toUpperCase()
	}
	if (firstName) return firstName.slice(0, 2).toUpperCase()
	return email.split("@")[0]?.slice(0, 2).toUpperCase() ?? "N/A"
}

function formatDate(date: Date | string): string {
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	})
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────

type AlertState = {type: "success" | "error"; message: string} | null

function Alert({state}: {state: AlertState}) {
	if (!state) return null
	return (
		<p
			role="alert"
			className={cn(
				"rounded-lg px-3 py-2 text-sm",
				state.type === "success"
					? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
					: "bg-destructive/10 text-destructive",
			)}
		>
			{state.message}
		</p>
	)
}

type Tab = "info" | "personal" | "security"

function TabButton({
	active,
	onClick,
	children,
}: PropsWithChildren<{active: boolean; onClick: () => void}>) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-sm transition-colors",
				active
					? "bg-primary text-primary-foreground shadow-sm"
					: "text-muted-foreground hover:bg-muted hover:text-foreground",
			)}
		>
			{children}
		</button>
	)
}

function SectionDivider({label}: {label: string}) {
	return (
		<div className="flex items-center gap-3 pt-2">
			<span className="shrink-0 font-semibold text-muted-foreground text-xs uppercase tracking-widest">
				{label}
			</span>
			<div className="h-px flex-1 bg-border" />
		</div>
	)
}

// ─── Edit email form ──────────────────────────────────────────────────────────

function EditEmailForm({
	currentEmail,
	onSuccess,
}: {
	currentEmail: string
	onSuccess: (email: string) => void
}) {
	const [alert, setAlert] = useState<AlertState>(null)
	const updateEmail = useServerFn(updateUserEmailFn)

	const form = useForm({
		defaultValues: {email: currentEmail},
		onSubmit: async ({value}) => {
			setAlert(null)
			const response = await updateEmail({data: {email: value.email}})
			if (response.status === HttpStatusCode.OK && response.data) {
				setAlert({type: "success", message: "Email updated successfully!"})
				onSuccess(response.data.email)
			} else {
				setAlert({type: "error", message: response.error ?? "Failed to update email"})
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
			<CardContent className="space-y-4">
				<Alert state={alert} />

				<form.Field name="email" validators={{onBlur: ({value}) => validate(emailSchema, value)}}>
					{field => (
						<div className="space-y-1.5">
							<Label htmlFor="profile-email">Email address</Label>
							<div className="relative">
								<Mail className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									id="profile-email"
									type="email"
									className="pl-8"
									placeholder="you@example.com"
									autoComplete="email"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={e => field.handleChange(e.target.value)}
									aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
								/>
							</div>
							{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
								<p className="text-destructive text-xs" role="alert">
									{field.state.meta.errors[0]}
								</p>
							)}
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
							{isSubmitting ? "Saving…" : "Save email"}
						</Button>
					)}
				</form.Subscribe>
			</CardFooter>
		</form>
	)
}

// ─── Change password form ─────────────────────────────────────────────────────

function ChangePasswordForm() {
	const [alert, setAlert] = useState<AlertState>(null)
	const updatePassword = useServerFn(updateUserPasswordFn)

	const form = useForm({
		defaultValues: {currentPassword: "", newPassword: "", confirmPassword: ""},
		onSubmit: async ({value}) => {
			setAlert(null)
			const response = await updatePassword({data: value})
			if (response.status === HttpStatusCode.OK) {
				setAlert({type: "success", message: "Password changed successfully!"})
				form.reset()
			} else {
				setAlert({type: "error", message: response.error ?? "Failed to change password"})
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
			<CardContent className="space-y-4">
				<Alert state={alert} />

				<form.Field
					name="currentPassword"
					validators={{onBlur: ({value}) => validate(currentPasswordSchema, value)}}
				>
					{field => (
						<div className="space-y-1.5">
							<Label htmlFor="current-password">Current password</Label>
							<Input
								id="current-password"
								type="password"
								placeholder="········"
								autoComplete="current-password"
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

				<form.Field
					name="newPassword"
					validators={{onBlur: ({value}) => validate(newPasswordSchema, value)}}
				>
					{field => (
						<div className="space-y-1.5">
							<Label htmlFor="new-password">New password</Label>
							<Input
								id="new-password"
								type="password"
								placeholder="········"
								autoComplete="new-password"
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

				<form.Field
					name="confirmPassword"
					validators={{
						onBlur: ({value, fieldApi}) => {
							const basic = validate(confirmPasswordSchema, value)
							if (basic) return basic
							const newPw = fieldApi.form.getFieldValue("newPassword")
							if (value !== newPw) return "Passwords do not match"
							return undefined
						},
					}}
				>
					{field => (
						<div className="space-y-1.5">
							<Label htmlFor="confirm-password">Confirm new password</Label>
							<Input
								id="confirm-password"
								type="password"
								placeholder="········"
								autoComplete="new-password"
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
							{isSubmitting ? "Updating…" : "Update password"}
						</Button>
					)}
				</form.Subscribe>
			</CardFooter>
		</form>
	)
}

// ─── Personal details form ────────────────────────────────────────────────────

function PersonalDetailsForm({
	initialData,
	onSuccess,
}: {
	initialData: UserDataRow | null
	onSuccess: (updated: UserDataRow) => void
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

// ─── Route component ──────────────────────────────────────────────────────────

function RouteComponent() {
	const {user: fullUser, userData: initialUserData} = Route.useLoaderData()
	const ctx = Route.useRouteContext()
	const [activeTab, setActiveTab] = useState<Tab>("info")
	const [currentEmail, setCurrentEmail] = useState(ctx.user.email)
	const [userData, setUserData] = useState<UserDataRow | null>(initialUserData)
	const router = useRouter()

	const handleEmailUpdate = (newEmail: string) => {
		setCurrentEmail(newEmail)
		router.invalidate()
	}

	if (!fullUser) {
		return (
			<PageWrapper>
				<p className="text-muted-foreground">Could not load profile.</p>
			</PageWrapper>
		)
	}

	const firstName = userData?.first_name ?? undefined
	const lastName = userData?.last_name ?? undefined
	const displayName = firstName || lastName ? [firstName, lastName].filter(Boolean).join(" ") : null
	const initials = getInitials(currentEmail, firstName, lastName)
	const memberSince = formatDate(fullUser.created_at)

	return (
		<PageWrapper className="items-start py-10">
			<div className="flex w-full max-w-2xl flex-col gap-6">
				{/* ── Profile header card ── */}
				<Card className="overflow-hidden">
					<div className="h-24 bg-linear-to-r from-primary/20 via-primary/10 to-transparent" />
					<CardContent className="-mt-10 flex flex-col items-center gap-4 pb-6 sm:flex-row sm:items-end sm:gap-6">
						{/* Avatar */}
						<div className="flex size-20 shrink-0 items-center justify-center rounded-full border-4 border-background bg-primary font-bold text-primary-foreground text-xl shadow-md">
							{initials}
						</div>

						{/* Meta */}
						<div className="flex flex-1 flex-col items-center gap-0.5 sm:items-start">
							<h1 className="font-bold text-xl tracking-tight">{displayName ?? currentEmail}</h1>
							{displayName && <p className="text-muted-foreground text-sm">{currentEmail}</p>}
							<div className="mt-1 flex items-center gap-1.5 text-muted-foreground text-sm">
								<Calendar className="size-3.5" />
								<span>Member since {memberSince}</span>
							</div>
						</div>

						{/* Verified badge */}
						<div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700 text-xs dark:bg-emerald-950/30 dark:text-emerald-400">
							<ShieldCheck className="size-3.5" />
							Verified account
						</div>
					</CardContent>
				</Card>

				{/* ── Stat pills ── */}
				<div className="grid grid-cols-2 gap-3">
					<div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
						<div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
							<User className="size-4 text-primary" />
						</div>
						<div>
							<p className="text-muted-foreground text-xs">Account ID</p>
							<p className="font-semibold text-sm">#{fullUser.id}</p>
						</div>
					</div>
					<div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
						<div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
							<Mail className="size-4 text-primary" />
						</div>
						<div className="min-w-0">
							<p className="text-muted-foreground text-xs">Email</p>
							<p className="truncate font-semibold text-sm">{currentEmail}</p>
						</div>
					</div>
				</div>

				{/* ── Settings tabs ── */}
				<div>
					{/* Tab nav */}
					<div className="mb-4 flex gap-1 rounded-xl border bg-muted/50 p-1">
						<TabButton active={activeTab === "info"} onClick={() => setActiveTab("info")}>
							<User className="size-4" />
							Account info
						</TabButton>
						<TabButton active={activeTab === "personal"} onClick={() => setActiveTab("personal")}>
							<ClipboardList className="size-4" />
							Personal details
						</TabButton>
						<TabButton active={activeTab === "security"} onClick={() => setActiveTab("security")}>
							<KeyRound className="size-4" />
							Security
						</TabButton>
					</div>

					{/* Tab panels */}
					{activeTab === "info" && (
						<Card className="shadow-sm">
							<CardHeader>
								<CardTitle className="text-lg">Account information</CardTitle>
								<CardDescription>Update the email address for your account</CardDescription>
							</CardHeader>
							<EditEmailForm currentEmail={currentEmail} onSuccess={handleEmailUpdate} />
						</Card>
					)}

					{activeTab === "personal" && (
						<Card className="shadow-sm">
							<CardHeader>
								<CardTitle className="text-lg">Personal details</CardTitle>
								<CardDescription>
									Tell us a bit about yourself — this helps personalise your experience
								</CardDescription>
							</CardHeader>
							<PersonalDetailsForm initialData={userData} onSuccess={setUserData} />
						</Card>
					)}

					{activeTab === "security" && (
						<Card className="shadow-sm">
							<CardHeader>
								<CardTitle className="text-lg">Change password</CardTitle>
								<CardDescription>
									Choose a strong password at least 6 characters long
								</CardDescription>
							</CardHeader>
							<ChangePasswordForm />
						</Card>
					)}
				</div>
			</div>
		</PageWrapper>
	)
}
