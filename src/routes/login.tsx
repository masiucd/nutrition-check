import {useForm} from "@tanstack/react-form"
import {createFileRoute, Link, redirect, useNavigate} from "@tanstack/react-router"
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
import {PageWrapper} from "@/components/wrappers/page"
import {loginUser} from "@/server/functions/user"
import {HttpStatusCode} from "@/server/utils/status_code"

export const Route = createFileRoute("/login")({
	component: LoginPage,
	beforeLoad: async ({context}) => {
		if (context.user) {
			redirect({to: "/auth/profile"})
		}
	},
})

const emailSchema = z.email("Please enter a valid email address").min(5, "Email is required")

const passwordSchema = z
	.string()
	.min(1, "Password is required")
	.min(6, "Password must be at least 6 characters")

function validate<T>(schema: z.ZodType<T>, value: T): string | undefined {
	const result = schema.safeParse(value)
	return result.success ? undefined : result.error.issues[0]?.message
}

function LoginPage() {
	const [error, setError] = useState<string | null>(null)
	const navigate = useNavigate()
	const form = useForm({
		defaultValues: {email: "", password: ""},
		onSubmit: async ({value}) => {
			const response = await loginUser({data: value})

			if (response.status === HttpStatusCode.OK && response.data !== null) {
				navigate({to: "/auth/profile"})
			} else {
				setError(response.error)
			}
		},
	})

	return (
		<PageWrapper>
			<Card className="w-full max-w-sm shadow-lg">
				<CardHeader className="space-y-1">
					<CardTitle className="font-bold text-2xl tracking-tight">Sign in</CardTitle>
					<CardDescription>Enter your email and password to access your account</CardDescription>
				</CardHeader>

				<form
					onSubmit={e => {
						e.preventDefault()
						form.handleSubmit()
					}}
					noValidate
				>
					{error && (
						<p className="rounded-md bg-destructive/15 p-3 text-destructive text-sm">{error}</p>
					)}
					<CardContent className="space-y-4">
						{/* Email */}
						<form.Field
							name="email"
							validators={{onBlur: ({value}) => validate(emailSchema, value)}}
						>
							{field => (
								<div className="space-y-1.5">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										placeholder="you@example.com"
										autoComplete="email"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={e => field.handleChange(e.target.value)}
										aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
									/>
									{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
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
							validators={{onBlur: ({value}) => validate(passwordSchema, value)}}
						>
							{field => (
								<div className="space-y-1.5">
									<div className="flex items-center justify-between">
										<Label htmlFor="password">Password</Label>
										<Link
											to="/forgot_password"
											className="text-muted-foreground text-sm underline-offset-4 hover:text-primary hover:underline"
										>
											Forgot password?
										</Link>
									</div>
									<Input
										id="password"
										type="password"
										placeholder="••••••••"
										autoComplete="current-password"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={e => field.handleChange(e.target.value)}
										aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
									/>
									{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
										<p className="text-destructive text-sm" role="alert">
											{field.state.meta.errors[0]}
										</p>
									)}
								</div>
							)}
						</form.Field>
					</CardContent>

					<CardFooter className="flex flex-col gap-4">
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
										{isSubmitting ? "Signing in…" : "Sign in"}
									</Button>
								)
							}}
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
		</PageWrapper>
	)
}
