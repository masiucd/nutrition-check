import type {AnyFieldApi} from "@tanstack/react-form"
import {useForm} from "@tanstack/react-form"
import {createFileRoute, useNavigate} from "@tanstack/react-router"
import {useState} from "react"
import {PageWrapper} from "@/components/page_wrapper"
import {Heading, Text} from "@/components/typography"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {createNewUser} from "@/utils/server_fns/user.server"

export const Route = createFileRoute("/auth/signup")({
	component: RouteComponent,
})

function RouteComponent() {
	let navigate = useNavigate()
	let [signupError, setSignupError] = useState<{message: string} | null>(null)
	let form = useForm({
		defaultValues: {
			username: "",
			email: "",
			password: "",
			repeatPassword: "",
		},
		onSubmit: async data => {
			console.log(data.value)
			let maybeNewUser = await createNewUser({data: data.value})
			console.log("maybeNewUser", maybeNewUser)
			if (maybeNewUser !== null) {
				// we want to redirect the user to the profile page
				navigate({to: "/auth/profile"})
			} else {
				// We want to show an error to the user
				console.log("signup error", maybeNewUser)
				setSignupError({message: "Something went wrong. Please try again."})
			}
		},
	})
	return (
		<PageWrapper>
			<div className="mx-auto flex flex-1 flex-col items-center justify-center border-2 p-5 md:max-w-4xl">
				<div className="flex flex-col items-center justify-center p-5">
					<Heading tag="h1">Signing up</Heading>
					<Text tag="lead">Lets create an account for Sick Fits</Text>
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
						{signupError !== null ? <Heading tag="h4">{signupError.message}</Heading> : null}
						<legend>Sign up</legend>
						<div className="flex gap-2">
							<form.Field
								name="username"
								validators={{
									onBlur: ({value}) =>
										!value || value.length < 3
											? "Username is required"
											: value.length > 32
												? "Username is too long"
												: null,
									onBlurAsyncDebounceMs: 200,
									onBlurAsync: async ({value}) => {
										await new Promise(resolve => setTimeout(resolve, 1000))
										return value.includes("error") && 'No "error" allowed in first name'
									},
								}}
								children={field => (
									<div className="flex flex-1 flex-col gap-2">
										<Label htmlFor={field.name}>Username</Label>
										<Input
											id={field.name}
											type="text"
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={e => field.handleChange(e.target.value)}
										/>
										<FieldInfo field={field} />
									</div>
								)}
							/>
							<form.Field
								name="email"
								validators={{
									onBlur: ({value}) => emailValidator(value),
									onBlurAsyncDebounceMs: 200,
								}}
								children={field => (
									<div className="flex flex-1 flex-col gap-2">
										<Label htmlFor={field.name}>Email</Label>
										<Input
											id={field.name}
											type="text"
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={e => field.handleChange(e.target.value)}
										/>
										<FieldInfo field={field} />
									</div>
								)}
							/>
						</div>
						<div className="flex gap-2">
							{/*<PasswordsSection form={form} />*/}
							<form.Field
								name="password"
								validators={{
									onBlur: ({value}) => passwordValidator(value),
									onBlurAsyncDebounceMs: 500,
								}}
								children={field => (
									<div className="flex flex-1 flex-col gap-2">
										<Label htmlFor={field.name}>Password</Label>
										<Input
											id={field.name}
											type="password"
											min={3}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={e => field.handleChange(e.target.value)}
										/>
										<FieldInfo field={field} />
									</div>
								)}
							/>
							<form.Field
								name="repeatPassword"
								validators={{
									onBlur: ({value, fieldApi}) =>
										!value
											? "Repeat password needs to match the password"
											: fieldApi.form.state.values.password.trim() !== value.trim()
												? "Passwords do not match"
												: null,
								}}
								children={field => (
									<div className="flex flex-1 flex-col gap-2">
										<Label htmlFor={field.name}>Repeat Password</Label>
										<Input
											id={field.name}
											type="password"
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={e => field.handleChange(e.target.value)}
										/>
										<FieldInfo field={field} />
									</div>
								)}
							/>
						</div>
						<form.Subscribe
							selector={state => [state.canSubmit, state.isSubmitting]}
							children={([canSubmit, isSubmitting]) => (
								<Button type="submit" disabled={!canSubmit}>
									{isSubmitting ? "Creating Account..." : "Create New Account"}
								</Button>
							)}
						/>
					</fieldset>
				</form>
			</div>
		</PageWrapper>
	)
}

function FieldInfo({field}: {field: AnyFieldApi}) {
	return (
		<>
			{field.state.meta.isTouched && !field.state.meta.isValid ? (
				<em className="text-red-500">{field.state.meta.errors.join(",")}</em>
			) : null}
			{field.state.meta.isValidating ? "Validating..." : null}
		</>
	)
}

// Special chatterers for the password inputs
export const containsSpecialCharacter = (password: string): boolean => {
	/**
	 * Checks if the given password contains at least one special character.
	 *
	 * @param password - The password to validate.
	 * @returns True if the password contains at least one special character, otherwise false.
	 */
	const specialCharacters = /[!@#$%^&*(),.?":{}|<>]/
	return specialCharacters.test(password)
}

function emailValidator(value: string) {
	if (!value) {
		return "Email is required"
	}
	if (!value.includes("@")) {
		return "Invalid email"
	}
	if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
		return "Invalid email"
	}
	return null
}

function passwordValidator(value: string) {
	if (!value) {
		return "Password is required"
	}
	if (!containsSpecialCharacter(value)) {
		return "Password must contain at least one special character"
	}
	if (value.length < 3) {
		return "Password must be at least 3 characters long"
	}
	return null
}
