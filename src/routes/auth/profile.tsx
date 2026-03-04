import {createFileRoute} from "@tanstack/react-router"
import {Heading} from "@/components/typography"

export const Route = createFileRoute("/auth/profile")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div>
			<Heading tag="h1">Hello Profile page</Heading>
		</div>
	)
}
