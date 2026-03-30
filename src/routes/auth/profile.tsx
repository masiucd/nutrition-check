import {createFileRoute, redirect} from "@tanstack/react-router"
import {Heading} from "@/components/typography"

export const Route = createFileRoute("/auth/profile")({
	component: RouteComponent,
	beforeLoad: async ({context}) => {
		const isAuthenticated = !!context.user
		if (!isAuthenticated) {
			// redirect to login page
			throw redirect({
				to: "/auth/login",
				// Save the current location in search params so you can redirect back after login:
				// search: {redirect: location.href},
			})
		}
	},
})

function RouteComponent() {
	const ctx = Route.useRouteContext()
	if (!ctx.user) return null
	return (
		<div>
			<Heading tag="h1">Hello {ctx.user.username} Profile page</Heading>
		</div>
	)
}
