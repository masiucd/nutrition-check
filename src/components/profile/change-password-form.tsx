import {useForm} from "@tanstack/react-form"
import {useServerFn} from "@tanstack/react-start"
import {useState} from "react"
import {Button} from "@/components/ui/button"
import {CardContent, CardFooter} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {
	confirmPasswordSchema,
	currentPasswordSchema,
	newPasswordSchema,
	validate,
} from "@/lib/schemas"
import {updateUserPasswordFn} from "@/server/functions/user"
import {HttpStatusCode} from "@/server/utils/status_code"
import {Alert} from "./alert"
import type {AlertState} from "./types"

export function ChangePasswordForm() {
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
