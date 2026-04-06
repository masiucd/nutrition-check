import {useForm} from "@tanstack/react-form"
import {createFileRoute, useRouter} from "@tanstack/react-router"
import {useServerFn} from "@tanstack/react-start"
import {Calendar, KeyRound, Mail, ShieldCheck, User} from "lucide-react"
import {useState} from "react"
import {z} from "zod"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {PageWrapper} from "@/components/wrappers/page"
import {cn} from "@/lib/utils"
import {getCurrentUserFn, updateUserEmailFn, updateUserPasswordFn} from "@/server/functions/user"
import {HttpStatusCode} from "@/server/utils/status_code"

export const Route = createFileRoute("/auth/_authed/profile")({
	component: RouteComponent,
	loader: async () => {
		const user = await getCurrentUserFn()
		return {user}
	},
})

// ─── Zod Validators ────────────────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────────────────────────

function getInitials(email: string): string {
	return email.split("@")[0]?.slice(0, 2).toUpperCase() ?? "??"
}

function formatDate(date: Date | string): string {
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	})
}

// ─── Alert helper ─────────────────────────────────────────────────────────────────────────────────

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

// ─── Section tab ──────────────────────────────────────────────────────────────────────────────────

type Tab = "info" | "security"

function TabButton({
	active,
	onClick,
	children,
}: {active: boolean; onClick: () => void; children: React.ReactNode}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
				active
					? "bg-primary text-primary-foreground shadow-sm"
					: "text-muted-foreground hover:bg-muted hover:text-foreground",
			)}
		>
			{children}
		</button>
	)
}

// ─── Edit email form ──────────────────────────────────────────────────────────────────────────────

function EditEmailForm({currentEmail, onSuccess}: {currentEmail: string; onSuccess: (email: string) => void}) {
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

				<form.Field
					name="email"
					validators={{onBlur: ({value}) => validate(emailSchema, value)}}
				>
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

// ─── Change password form ─────────────────────────────────────────────────────────────────────────

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

				{/* Current password */}
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

				{/* New password */}
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

				{/* Confirm new password */}
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

// ─── Route component ────────────────────────────────────────────────────────────────────────────────

function RouteComponent() {
	const {user: fullUser} = Route.useLoaderData()
	const ctx = Route.useRouteContext()
	const [activeTab, setActiveTab] = useState<Tab>("info")
	const [currentEmail, setCurrentEmail] = useState(ctx.user.email)
	const router = useRouter()

	const handleEmailUpdate = (newEmail: string) => {
		setCurrentEmail(newEmail)
		// Invalidate router state so the nav reflects the new email
		router.invalidate()
	}

	if (!fullUser) {
		return (
			<PageWrapper>
				<p className="text-muted-foreground">Could not load profile.</p>
			</PageWrapper>
		)
	}

	const initials = getInitials(currentEmail)
	const memberSince = formatDate(fullUser.created_at)

	return (
		<PageWrapper className="items-start py-10">
			<div className="flex w-full max-w-2xl flex-col gap-6">
				{/* ── Profile header card ── */}
				<Card className="overflow-hidden">
					<div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
					<CardContent className="-mt-10 flex flex-col items-center gap-4 pb-6 sm:flex-row sm:items-end sm:gap-6">
						{/* Avatar */}
						<div className="flex size-20 shrink-0 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground text-xl font-bold shadow-md">
							{initials}
						</div>

						{/* Meta */}
						<div className="flex flex-1 flex-col items-center gap-1 sm:items-start">
							<h1 className="font-bold text-xl tracking-tight">{currentEmail}</h1>
							<div className="flex items-center gap-1.5 text-muted-foreground text-sm">
								<Calendar className="size-3.5" />
								<span>Member since {memberSince}</span>
							</div>
						</div>

						{/* Verified badge */}
						<div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 text-xs font-medium dark:bg-emerald-950/30 dark:text-emerald-400">
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
					<div className="mb-4 flex gap-2 rounded-xl border bg-muted/50 p-1">
						<TabButton active={activeTab === "info"} onClick={() => setActiveTab("info")}>
							<User className="size-4" />
							Account info
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
								<CardDescription>Update your email address</CardDescription>
							</CardHeader>
							<EditEmailForm currentEmail={currentEmail} onSuccess={handleEmailUpdate} />
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
