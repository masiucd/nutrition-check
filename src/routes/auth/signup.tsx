import {type AnyFieldApi, useForm} from "@tanstack/react-form"
import {createFileRoute} from "@tanstack/react-router"
import {createServerFn} from "@tanstack/react-start"
import {hash} from "bcryptjs"
import {z} from "zod"
import {PageWrapper} from "@/components/page_wrapper"
import {Heading, Text} from "@/components/typography"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"

export const Route = createFileRoute("/auth/signup")({
	component: RouteComponent,
})

let NewUserSchema = z
	.object({
		username: z.string().min(3).max(100),
		email: z.email().max(100),
		password: z.string().min(6).max(100),
		repeatPassword: z.string().min(6).max(100),
	})
	.refine(data => data.password === data.repeatPassword, {
		message: "Passwords do not match",
		path: ["repeatPassword"],
	})
let createNewUser = createServerFn({method: "POST"})
	.inputValidator(NewUserSchema)
	.handler(async ({data}) => {
		let hashedPassword = await hash(data.password, 10)
		console.log("Hashed ---> ", hashedPassword)
		// let rows = await db.insert(user).values({
		// 	username: data.username,
		// 	email: data.email,
		// 	passwordHash: hashedPassword,
		// })
		// return rows.rows.length > 0 ? rows.rows[0] : null
		console.log(data)
		return "Hello"
	})

function RouteComponent() {
	let form = useForm({
		defaultValues: {
			username: "",
			email: "",
			password: "",
			repeatPassword: "",
		},
		onSubmit: async data => {
			console.log(data.value)
			await createNewUser({data: data.value})
			// await createNewUser({data: data.value})
			// await signupUser(data.value)
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
									onBlur: ({value}) =>
										!value
											? "Email is required"
											: !value.includes("@")
												? "Invalid email"
												: !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
													? "Invalid email"
													: null,
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
							<form.Field
								name="password"
								validators={{
									onBlur: ({value}) =>
										!value
											? "Password is required"
											: !value.includes("!")
												? "Password must contain at least one special character"
												: value.length < 3
													? "Password must be at least 3 characters long"
													: null,
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
									onBlur: ({value, ...apa}) => {
										// console.log("Spa", apa.fieldApi.form.state.values.password)
										// console.log("Spa", apa.fieldApi.form.state.errors)
										return !value
											? "Repeat password needs to match the password"
											: apa.fieldApi.form.state.values.password !== value
												? "Passwords do not match"
												: !value.includes("!")
													? "Password must contain special characters"
													: null
									},
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
