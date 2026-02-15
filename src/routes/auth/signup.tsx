import {type AnyFieldApi, useForm} from "@tanstack/react-form"
import {createFileRoute, replaceEqualDeep} from "@tanstack/react-router"
import {PageWrapper} from "@/components/page_wrapper"
import {Button} from "@/components/ui/button"
import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"

export const Route = createFileRoute("/auth/signup")({
	component: RouteComponent,
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
			//
		},
	})
	return (
		<PageWrapper>
			<form
				className="md:max-w-5xl"
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
							children={field => (
								<div className="flex flex-1 flex-col gap-2">
									<Label htmlFor={field.name}>Password</Label>
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
						<form.Field
							name="repeatPassword"
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
								{isSubmitting ? "signingup..." : "Signup"}
							</Button>
						)}
					/>
				</fieldset>
			</form>
		</PageWrapper>
	)
}

function FieldInfo({field}: {field: AnyFieldApi}) {
	console.log("Valid", field.state.meta.errors)
	return (
		<>
			{field.state.meta.isTouched && !field.state.meta.isValid ? (
				<em className="text-red-500">{field.state.meta.errors.join(",")}</em>
			) : null}
			{field.state.meta.isValidating ? "Validating..." : null}
		</>
	)
}
