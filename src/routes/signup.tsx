import {useForm} from "@tanstack/react-form"
import {createFileRoute, Link} from "@tanstack/react-router"
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

const nameSchema = z
	.string()
	.min(1, "Name is required")
	.min(2, "Name must be at least 2 characters")

const emailSchema = z
	.string()
	.min(1, "Email is required")
	.email("Please enter a valid email address")

const passwordSchema = z
	.string()
	.min(1, "Password is required")
	.min(8, "Password must be at least 8 characters")

const confirmPasswordSchema = z.string().min(1, "Please confirm your password")

function validate<T>(schema: z.ZodType<T>, value: T): string | undefined {
	const result = schema.safeParse(value)
	return result.success ? undefined : result.error.issues[0]?.message
}

function SignupPage() {
	const form = useForm({
		defaultValues: {name: "", email: "", password: "", confirmPassword: ""},
		onSubmit: async ({value}) => {
			console.log(value)
		},
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
						onSubmit={(e) => {
							e.preventDefault()
							form.handleSubmit()
						}}
						noValidate
						className="flex flex-col gap-4"
					>
						{/* Name */}
						<form.Field
							name="name"
							validators={{onChange: ({value}) => validate(nameSchema, value)}}
						>
							{(field) => (
								<div className="flex flex-col gap-1.5">
									<Label htmlFor="name">Name</Label>
									<Input
										id="name"
										type="text"
										placeholder="Jane Doe"
										autoComplete="name"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={
											field.state.meta.isTouched &&
											field.state.meta.errors.length > 0
										}
									/>
									{field.state.meta.isTouched &&
										field.state.meta.errors.length > 0 && (
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
							validators={{onChange: ({value}) => validate(emailSchema, value)}}
						>
							{(field) => (
								<div className="flex flex-col gap-1.5">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										placeholder="jane@example.com"
										autoComplete="email"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={
											field.state.meta.isTouched &&
											field.state.meta.errors.length > 0
										}
									/>
									{field.state.meta.isTouched &&
										field.state.meta.errors.length > 0 && (
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
							validators={{onChange: ({value}) => validate(passwordSchema, value)}}
						>
							{(field) => (
								<div className="flex flex-col gap-1.5">
									<Label htmlFor="password">Password</Label>
									<Input
										id="password"
										type="password"
										placeholder="••••••••"
										autoComplete="new-password"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={
											field.state.meta.isTouched &&
											field.state.meta.errors.length > 0
										}
									/>
									{field.state.meta.isTouched &&
										field.state.meta.errors.length > 0 && (
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
								onChange: ({value}) => validate(confirmPasswordSchema, value),
								onChangeListenTo: ["password"],
								onBlurListenTo: ["password"],
							}}
						>
							{(field) => {
								const passwordValue = form.getFieldValue("password")
								const mismatch =
									field.state.meta.isTouched &&
									field.state.value.length > 0 &&
									field.state.value !== passwordValue
								const hasError =
									(field.state.meta.isTouched &&
										field.state.meta.errors.length > 0) ||
									mismatch

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
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={hasError}
										/>
										{hasError && (
											<p className="text-destructive text-xs" role="alert">
												{mismatch
													? "Passwords do not match"
													: field.state.meta.errors[0]}
											</p>
										)}
									</div>
								)
							}}
						</form.Field>

						<form.Subscribe selector={(s) => s.isSubmitting}>
							{(isSubmitting) => (
								<Button
									type="submit"
									className="mt-1 w-full"
									disabled={isSubmitting}
								>
									{isSubmitting ? "Creating account…" : "Create account"}
								</Button>
							)}
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
