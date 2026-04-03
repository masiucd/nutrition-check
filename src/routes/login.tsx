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

const emailSchema = z
	.string()
	.min(1, "Email is required")
	.email("Please enter a valid email address")

const passwordSchema = z
	.string()
	.min(1, "Password is required")
	.min(8, "Password must be at least 8 characters")

function validate<T>(schema: z.ZodType<T>, value: T): string | undefined {
	const result = schema.safeParse(value)
	return result.success ? undefined : result.error.issues[0]?.message
}

function LoginPage() {
	const form = useForm({
		defaultValues: {email: "", password: ""},
		onSubmit: async ({value}) => {
			console.log(value)
		},
	})

	return (
		<div className="flex min-h-svh items-center justify-center bg-muted/40 px-4">
			<Card className="w-full max-w-sm shadow-lg">
				<CardHeader className="space-y-1">
					<CardTitle className="font-bold text-2xl tracking-tight">Sign in</CardTitle>
					<CardDescription>
						Enter your email and password to access your account
					</CardDescription>
				</CardHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit()
					}}
					noValidate
				>
					<CardContent className="space-y-4">
						{/* Email */}
						<form.Field
							name="email"
							validators={{onChange: ({value}) => validate(emailSchema, value)}}
						>
							{(field) => (
								<div className="space-y-1.5">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										placeholder="you@example.com"
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
											<p className="text-destructive text-sm" role="alert">
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
								<div className="space-y-1.5">
									<div className="flex items-center justify-between">
										<Label htmlFor="password">Password</Label>
										<button
											type="button"
											onClick={() => {
												/* TODO: forgot-password flow */
											}}
											className="text-muted-foreground text-sm underline-offset-4 hover:text-primary hover:underline"
										>
											Forgot password?
										</button>
									</div>
									<Input
										id="password"
										type="password"
										placeholder="••••••••"
										autoComplete="current-password"
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
											<p className="text-destructive text-sm" role="alert">
												{field.state.meta.errors[0]}
											</p>
										)}
								</div>
							)}
						</form.Field>
					</CardContent>

					<CardFooter className="flex flex-col gap-4">
						<form.Subscribe selector={(s) => s.isSubmitting}>
							{(isSubmitting) => (
								<Button type="submit" className="w-full" disabled={isSubmitting}>
									{isSubmitting ? "Signing in…" : "Sign in"}
								</Button>
							)}
						</form.Subscribe>
						<p className="text-center text-muted-foreground text-sm">
							Don't have an account?{" "}
							<Link
								to="/signup"
								className="font-medium text-primary underline-offset-4 hover:underline"
							>
								Sign up
							</Link>
						</p>
					</CardFooter>
				</form>
			</Card>
		</div>
	)
}

export const Route = createFileRoute("/login")({
	component: LoginPage,
})
