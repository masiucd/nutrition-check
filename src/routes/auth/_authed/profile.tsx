import {createFileRoute} from "@tanstack/react-router"

export const Route = createFileRoute("/auth/_authed/profile")({
	component: RouteComponent,
})

function RouteComponent() {
	const ctx = Route.useRouteContext()

	return (
		<div>
			<h1>
				{ctx.user.email} -- {ctx.user.id}
			</h1>
		</div>
	)
}
