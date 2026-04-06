import {createFileRoute, Outlet, redirect} from "@tanstack/react-router"

export const Route = createFileRoute("/auth/_authed")({
	component: Component,
	beforeLoad: async ({context, location}) => {
		if (!context.user) {
			throw redirect({
				to: "/login",
				search: {redirect: location.href},
			})
		}
		// Pass user to child routes where they can access it via context
		return {user: context.user}
	},
})

function Component() {
	return <Outlet />
}
