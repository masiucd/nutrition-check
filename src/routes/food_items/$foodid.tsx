import {createFileRoute} from "@tanstack/react-router"
import {Heading} from "@/components/typography"
import {PageWrapper} from "@/components/wrappers/page"

export const Route = createFileRoute("/food_items/$foodid")({
	component: RouteComponent,
	// TOOD load data for food item with the id
	loader: async ({params}) => {
		// biome-ignore lint/suspicious/noConsole: <testing>
		console.log("params", params.foodid)
		return null
	},
})

function RouteComponent() {
	const {foodid} = Route.useParams()
	const data = Route.useLoaderData()
	// biome-ignore lint/suspicious/noConsole: <testing>
	console.log("data", data)
	return (
		<PageWrapper>
			<Heading>Hello Food with id - {foodid}</Heading>
		</PageWrapper>
	)
}
