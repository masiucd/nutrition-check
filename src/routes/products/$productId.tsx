import {createFileRoute} from "@tanstack/react-router"
import {createServerFn} from "@tanstack/react-start"
import {eq} from "drizzle-orm"
import {Heading} from "@/components/typography"
import {db} from "@/db/connect"
import {product} from "@/db/schema/product"

async function getProductItem(productId: number) {
	let productItem = await db
		.select({
			id: product.id,
			name: product.name,
			description: product.description,
			price: product.price,
		})
		.from(product)
		.where(eq(product.id, productId))

	return productItem
}

export const getProduct = createServerFn({method: "GET"})
	.inputValidator((data: {id: number}) => data)
	.handler(async ({data}) => {
		return getProductItem(data.id)
	})

export const Route = createFileRoute("/products/$productId")({
	loader: async ({params}) => {
		let productId = Number(params.productId)
		console.log("🚀 ~ productId:", productId)
		let productItem = await getProduct({data: {id: productId}})
		return productItem
	},
	component: RouteComponent,
})

function RouteComponent() {
	const productItem = Route.useParams()

	return (
		<div>
			<Heading tag="h1">Product Item!</Heading>
			<pre>{JSON.stringify(productItem, null, 2)}</pre>
		</div>
	)
}
