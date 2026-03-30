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
import {loginUser} from "@/utils/functions/user.functions"

export const Route = createFileRoute("/auth/login")({
	component: LoginPage,
})

// --- Validators ---

function validateEmail(value: string): string | null {
	if (!value) return "Email is required"
	if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return "Invalid email"
	return null
}

function validatePassword(value: string): string | null {
	if (!value) return "Password is required"
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

function LoginPage() {
	const navigate = useNavigate()
	const [loginError, setLoginError] = useState<string | null>(null)
	const login = useServerFn(loginUser)

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({value}) => {
			setLoginError(null)
			const result = await login({data: value})
			if (result.success) {
				navigate({to: "/auth/profile"})
			} else {
				setLoginError(result.message)
			}
		},
	})

	return (
		<PageWrapper>
			<div className="mx-auto flex flex-1 flex-col items-center justify-center border-2 p-5 md:max-w-4xl">
				<div className="flex flex-col items-center justify-center p-5">
					<Heading tag="h1">Sign In</Heading>
					<Text tag="lead">Welcome back to Sick Fits</Text>
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

						{loginError && (
							<Heading tag="h4" className="text-red-400 text-shadow-2xs">
								{loginError}
							</Heading>
						)}

						<div className="flex gap-2">
							<form.Field
								name="email"
								validators={{
									onBlur: ({value}) => validateEmail(value),
									onBlurAsyncDebounceMs: 200,
								}}
							>
								{field => <FormField label="Email" type="email" field={field} />}
							</form.Field>

							<form.Field
								name="password"
								validators={{
									onBlur: ({value}) => validatePassword(value),
								}}
							>
								{field => <FormField label="Password" type="password" field={field} />}
							</form.Field>
						</div>

						<form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
							{([canSubmit, isSubmitting]) => (
								<Button type="submit" disabled={!canSubmit}>
									{isSubmitting ? "Signing In..." : "Sign In"}
								</Button>
							)}
						</form.Subscribe>
					</fieldset>
				</form>
			</div>
		</PageWrapper>
	)
}
