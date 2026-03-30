import {createFileRoute, redirect} from "@tanstack/react-router"
import {PageWrapper} from "@/components/page_wrapper"
import {Heading, Text} from "@/components/typography"

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
		<PageWrapper>
			<div className="flex flex-col">
				<Heading tag="h1">Hello {ctx.user.username} Profile page</Heading>
				<Text>{ctx.user.id}</Text>
				<Text>{ctx.user.email}</Text>
			</div>
		</PageWrapper>
	)
}

// Things the user should be able to do on their profile page
// - Edit their profile
// - View their orders
// - Get support
//
