import {Heading} from "@/components/typography"
import {createFileRoute} from "@tanstack/react-router"

export const Route = createFileRoute("/apa/_pathlessLayout/a")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div>
			<Heading tag="h3" size="h4">
				Hello "/apa/_pathlessLayout/a"! I am a child route of a pathless layout route.
			</Heading>
		</div>
	)
}
