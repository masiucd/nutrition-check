import {createFileRoute, Outlet, redirect} from "@tanstack/react-router"
import {getCurrentUserFn} from "@/server/functions/user"

export const Route = createFileRoute("/auth/_authed")({
	component: Component,
	beforeLoad: async ({location}) => {
		const user = await getCurrentUserFn()
		if (!user) {
			throw redirect({
				to: "/login",
				search: {redirect: location.href},
			})
		}
		// Pass user to child routes
		return {user}
	},
})

function Component() {
	return <Outlet />
}
