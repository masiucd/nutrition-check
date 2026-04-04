import {useForm} from "@tanstack/react-form"
import {createFileRoute, Link, useNavigate} from "@tanstack/react-router"
import {useState} from "react"
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
import {createUser} from "@/server/functions/user"
import {HttpStatusCode} from "@/server/utils/status_code"

const nameSchema = z
	.string()
	.min(1, "Name is required")
	.min(3, "Name must be at least 3 characters")

const emailSchema = z.email("Please enter a valid email address").min(1, "Email is required")

const passwordSchema = z.string().min(6, "Password must be at least 6 characters")

const confirmPasswordSchema = z.string().min(6, "Please confirm your password")

function validate<T>(schema: z.ZodType<T>, value: T): string | undefined {
	const result = schema.safeParse(value)
	return result.success ? undefined : result.error.issues[0]?.message
}

function SignupPage() {
	const [error, setError] = useState<string | undefined>()
	const navigate = useNavigate()
	const form = useForm({
		defaultValues: {name: "", email: "", password: "", confirmPassword: ""},
		onSubmit: async ({value}) => {
			console.log("value---> ", value)
			const res = await createUser({
				data: {
					...value,
				},
			})
			if (res.data !== null && res.status === HttpStatusCode.CREATED) {
				// redirect to login page
				navigate({to: "/login"})
			} else {
				// show notification for the user that the signup failed
				setError(res.error)
			}
			console.log("res---> ", res)
		},
		// validators: {
		// 	onSubmit: ({value}) => {
		// 		const passwordValue = value.password
		// 		const mismatch = value.confirmPassword !== passwordValue
		// 		const hasError = mismatch
		// 		return hasError ? "Passwords do not match" : undefined
		// 	},
		// 	onBlur: ({value}) => {
		// 		const _name = value.name
		// 		const _email = value.email
		// 		const passwordValue = value.password
		// 		const mismatch = value.confirmPassword !== passwordValue
		// 		const _hasError = mismatch
		// 		return false
		// 	},
		// },
	})

	return (
		<div className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle className="text-xl">Create an account</CardTitle>
					<CardDescription>Enter your details below to get started</CardDescription>
				</CardHeader>

				<CardContent>
					<form
						onSubmit={e => {
							e.preventDefault()
							form.handleSubmit()
						}}
						// noV
						className="flex flex-col gap-4"
					>
						{error && (
							<div className="rounded-md bg-destructive/15 p-3 text-destructive text-sm">
								{error}
							</div>
						)}
						{/* Name */}
						<form.Field name="name" validators={{onBlur: ({value}) => validate(nameSchema, value)}}>
							{field => (
								<div className="flex flex-col gap-1.5">
									<Label htmlFor="name">Name</Label>
									<Input
										id="name"
										type="text"
										placeholder="Jane Doe"
										autoComplete="name"
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

						{/* Email */}
						<form.Field
							name="email"
							validators={{onBlur: ({value}) => validate(emailSchema, value)}}
						>
							{field => (
								<div className="flex flex-col gap-1.5">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										placeholder="jane@example.com"
										autoComplete="email"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={e => field.handleChange(e.target.value)}
										aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
									/>
									{field.state.meta.isBlurred && field.state.meta.errors.length > 0 && (
										<p className="text-destructive text-xs" role="alert">
											{field.state.meta.errors[0]}
										</p>
									)}
								</div>
							)}
						</form.Field>

						{/* Password */}
						<form.Field
							name="password"
							validators={{onBlur: ({value}) => validate(passwordSchema, value)}}
						>
							{field => (
								<div className="flex flex-col gap-1.5">
									<Label htmlFor="password">Password</Label>
									<Input
										id="password"
										type="password"
										placeholder="••••••••"
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

						{/* Confirm Password */}
						<form.Field
							name="confirmPassword"
							validators={{
								onBlur: ({value}) => validate(confirmPasswordSchema, value),
								onChangeListenTo: ["password"],
								onBlurListenTo: ["password"],
							}}
						>
							{field => {
								const passwordValue = form.getFieldValue("password")
								const mismatch =
									field.state.meta.isTouched &&
									field.state.value.length > 0 &&
									field.state.value !== passwordValue
								const hasError =
									(field.state.meta.isTouched && field.state.meta.errors.length > 0) || mismatch

								return (
									<div className="flex flex-col gap-1.5">
										<Label htmlFor="confirmPassword">Confirm password</Label>
										<Input
											id="confirmPassword"
											type="password"
											placeholder="••••••••"
											autoComplete="new-password"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={e => field.handleChange(e.target.value)}
											aria-invalid={hasError}
										/>
										{hasError && (
											<p className="text-destructive text-xs" role="alert">
												{mismatch ? "Passwords do not match" : field.state.meta.errors[0]}
											</p>
										)}
									</div>
								)
							}}
						</form.Field>

						<form.Subscribe selector={s => [s.isSubmitting, s.canSubmit, s.values]}>
							{([isSubmitting, canSubmit, values]) => {
								const allValuesValid = Object.values(values).every(value => value !== "")
								return (
									<Button
										type="submit"
										className="mt-1 w-full"
										disabled={!canSubmit && !allValuesValid}
										variant={allValuesValid && canSubmit ? "default" : "blurred"}
									>
										{isSubmitting ? "Creating account…" : "Create account"}
									</Button>
								)
							}}
						</form.Subscribe>
					</form>
				</CardContent>

				<CardFooter className="justify-center gap-1 text-muted-foreground text-sm">
					Already have an account?
					<Link
						to="/login"
						className="font-medium text-foreground underline-offset-4 hover:underline"
					>
						Log in
					</Link>
				</CardFooter>
			</Card>
		</div>
	)
}

export const Route = createFileRoute("/signup")({
	component: SignupPage,
})
