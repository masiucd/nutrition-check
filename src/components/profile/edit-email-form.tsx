import {useForm} from "@tanstack/react-form"
import {useServerFn} from "@tanstack/react-start"
import {Mail} from "lucide-react"
import {useState} from "react"
import {Button} from "@/components/ui/button"
import {CardContent, CardFooter} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {emailSchema, validate} from "@/lib/schemas"
import {updateUserEmailFn} from "@/server/functions/user"
import {HttpStatusCode} from "@/server/utils/status_code"
import {Alert} from "./alert"
import type {AlertState} from "./types"

export function EditEmailForm({
	currentEmail,
	onSuccess,
}: {
	currentEmail: string
	onSuccess: (email: string) => void
}) {
	const [alert, setAlert] = useState<AlertState>(null)
	const updateEmail = useServerFn(updateUserEmailFn)

	const form = useForm({
		defaultValues: {email: currentEmail},
		onSubmit: async ({value}) => {
			setAlert(null)
			const response = await updateEmail({data: {email: value.email}})
			if (response.status === HttpStatusCode.OK && response.data) {
				setAlert({type: "success", message: "Email updated successfully!"})
				onSuccess(response.data.email)
			} else {
				setAlert({type: "error", message: response.error ?? "Failed to update email"})
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

				<form.Field name="email" validators={{onBlur: ({value}) => validate(emailSchema, value)}}>
					{field => (
						<div className="space-y-1.5">
							<Label htmlFor="profile-email">Email address</Label>
							<div className="relative">
								<Mail className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									id="profile-email"
									type="email"
									className="pl-8"
									placeholder="you@example.com"
									autoComplete="email"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={e => field.handleChange(e.target.value)}
									aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
								/>
							</div>
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
							{isSubmitting ? "Saving…" : "Save email"}
						</Button>
					)}
				</form.Subscribe>
			</CardFooter>
		</form>
	)
}
