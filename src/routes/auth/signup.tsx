import type {AnyFieldApi} from "@tanstack/react-form"
import {useForm} from "@tanstack/react-form"
import {createFileRoute, useNavigate} from "@tanstack/react-router"
import {useServerFn} from "@tanstack/react-start"
import {useState} from "react"
import {PageWrapper} from "@/components/page_wrapper"
import {Heading, Text} from "@/components/typography"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {createNewUser} from "@/utils/functions/user.functions"

export const Route = createFileRoute("/auth/signup")({
	component: SignupPage,
})

// --- Validators ---

/**
 * Checks if the given password contains at least one special character.
 */
const containsSpecialCharacter = (password: string): boolean => {
	return /[!@#$%^&*(),.?":{}|<>]/.test(password)
}

function validateUsername(value: string): string | null {
	if (!value || value.length < 3) return "Username must be at least 3 characters"
	if (value.length > 32) return "Username must be 32 characters or less"
	return null
}

function validateEmail(value: string): string | null {
	if (!value) return "Email is required"
	if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return "Invalid email"
	return null
}

function validatePassword(value: string): string | null {
	if (!value) return "Password is required"
	if (value.length < 6) return "Password must be at least 6 characters"
	if (!containsSpecialCharacter(value))
		return "Password must contain at least one special character"
	return null
}

function validateRepeatPassword(value: string, password: string): string | null {
	if (!value) return "Please confirm your password"
	if (password.trim() !== value.trim()) return "Passwords do not match"
	return null
}

interface FormFieldProps {
	label: string
	type?: "text" | "email" | "password"
	field: AnyFieldApi
}

function FormField({label, type = "text", field}: FormFieldProps) {
	return (
		<div className="flex flex-1 flex-col gap-2">
			<Label htmlFor={field.name}>{label}</Label>
			<Input
				id={field.name}
				type={type}
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={e => field.handleChange(e.target.value)}
			/>
			<FieldInfo field={field} />
		</div>
	)
}

function FieldInfo({field}: {field: AnyFieldApi}) {
	const {isTouched, isValid, isValidating, errors} = field.state.meta
	return (
		<>
			{isTouched && !isValid && <em className="text-red-500">{errors.join(", ")}</em>}
			{isValidating && <span className="text-muted-foreground text-sm">Validating...</span>}
		</>
	)
}

function SignupPage() {
	const navigate = useNavigate()
	const [signupError, setSignupError] = useState<string | null>(null)
	const registerNewUser = useServerFn(createNewUser)

	const form = useForm({
		defaultValues: {
			username: "",
			email: "",
			password: "",
			repeatPassword: "",
		},
		onSubmit: async ({value}) => {
			const newUser = await registerNewUser({data: value})
			if (newUser !== null) {
				navigate({to: "/auth/login"})
			} else {
				setSignupError("Something went wrong. Please try again.")
			}
		},
	})

	return (
		<PageWrapper>
			<div className="mx-auto flex flex-1 flex-col items-center justify-center border-2 p-5 md:max-w-4xl">
				<div className="flex flex-col items-center justify-center p-5">
					<Heading tag="h1">Sign Up</Heading>
					<Text tag="lead">Let's create an account for Sick Fits</Text>
				</div>

				<form
					className="w-full flex-1"
					onSubmit={e => {
						e.preventDefault()
						e.stopPropagation()
						form.handleSubmit()
					}}
				>
					<fieldset className="flex flex-col gap-3 rounded-md border-2 border-foreground p-2">
						<legend className="font-bold text-2xl">Sick Fits</legend>

						{signupError && (
							<Heading tag="h4" className="text-red-400 text-shadow-2xs">
								{signupError}
							</Heading>
						)}

						<div className="flex gap-2">
							<form.Field
								name="username"
								validators={{
									onBlur: ({value}) => validateUsername(value),
									onBlurAsyncDebounceMs: 200,
									onBlurAsync: async ({value}) => {
										await new Promise(resolve => setTimeout(resolve, 1000))
										return value.includes("error") ? 'No "error" allowed in username' : null
									},
								}}
							>
								{field => <FormField label="Username" field={field} />}
							</form.Field>

							<form.Field
								name="email"
								validators={{
									onBlur: ({value}) => validateEmail(value),
									onBlurAsyncDebounceMs: 200,
								}}
							>
								{field => <FormField label="Email" type="email" field={field} />}
							</form.Field>
						</div>

						<div className="flex gap-2">
							<form.Field
								name="password"
								validators={{
									onBlur: ({value}) => validatePassword(value),
									onBlurAsyncDebounceMs: 500,
								}}
							>
								{field => <FormField label="Password" type="password" field={field} />}
							</form.Field>

							<form.Field
								name="repeatPassword"
								validators={{
									onBlur: ({value, fieldApi}) =>
										validateRepeatPassword(value, fieldApi.form.state.values.password),
								}}
							>
								{field => <FormField label="Repeat Password" type="password" field={field} />}
							</form.Field>
						</div>

						<form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
							{([canSubmit, isSubmitting]) => (
								<Button type="submit" disabled={!canSubmit}>
									{isSubmitting ? "Creating Account..." : "Create New Account"}
								</Button>
							)}
						</form.Subscribe>
					</fieldset>
				</form>
			</div>
		</PageWrapper>
	)
}
