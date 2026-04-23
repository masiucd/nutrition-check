import {createFileRoute} from "@tanstack/react-router"
import {Heading, Text} from "@/components/typography"
import {PageWrapper} from "@/components/wrappers/page"

export const Route = createFileRoute("/food_items/type/")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<PageWrapper>
			<div>
				<Heading size="h1">Food types</Heading>
				<Text>Here we will list all food types.</Text>
			</div>
		</PageWrapper>
	)
}
