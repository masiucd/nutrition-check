import {createFileRoute} from "@tanstack/react-router"
import {PageWrapper} from "@/components/wrappers/page"

export const Route = createFileRoute("/auth/_authed/profile")({
	component: RouteComponent,
})

function RouteComponent() {
	const ctx = Route.useRouteContext()

	return (
		<PageWrapper>
			<h1>
				{ctx.user.email} -- {ctx.user.id}
			</h1>
		</PageWrapper>
	)
}
