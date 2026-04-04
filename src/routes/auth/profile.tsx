import {createFileRoute} from "@tanstack/react-router"

export const Route = createFileRoute("/auth/profile")({
	component: RouteComponent,
	beforeLoad: async ({context}) => {
		console.log("context", context)
		// TODO auth
		// const isAuthenticated = !!context.user
		// if (!isAuthenticated) {
		//   throw new Error("Not authenticated")
		// }
	},
})

function RouteComponent() {
	return <div>Hello "/auth/profile"!</div>
}
