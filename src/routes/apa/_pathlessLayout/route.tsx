import {Heading} from "@/components/typography"
import {createFileRoute, Outlet} from "@tanstack/react-router"

export const Route = createFileRoute("/apa/_pathlessLayout")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div>
			<Heading>Pathless Layout - works a s a layout route</Heading>
			<Outlet />
		</div>
	)
}
