import {createFileRoute} from "@tanstack/react-router"
import {Heading, Text} from "@/components/typography"
import {PageWrapper} from "@/components/wrappers/page"

export const Route = createFileRoute("/food_items/category/$category")({
	component: RouteComponent,
})

function RouteComponent() {
	const {category} = Route.useParams()
	return (
		<PageWrapper>
			<div>
				<Heading>{category}</Heading>
				<Text>List all items in this category.</Text>
			</div>
		</PageWrapper>
	)
}
