import {createFileRoute} from "@tanstack/react-router"
import {Heading, Text} from "@/components/typography"
import {PageWrapper} from "@/components/wrappers/page"

export const Route = createFileRoute("/food_items/type/$type")({
	component: RouteComponent,
})

function RouteComponent() {
	const {type} = Route.useParams()
	return (
		<PageWrapper>
			<div>
				<Heading>{type}</Heading>
				<Text>List all items in this category.</Text>
			</div>
		</PageWrapper>
	)
}
