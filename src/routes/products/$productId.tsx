import {createFileRoute} from "@tanstack/react-router"
import {createServerFn} from "@tanstack/react-start"
import {eq} from "drizzle-orm"
import {PageWrapper} from "@/components/page_wrapper"
import {Heading} from "@/components/typography"
import {Button} from "@/components/ui/button"
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {db} from "@/db/connect"
import {product, productImage} from "@/db/schema/product"

async function getProductItem(productId: number) {
	try {
		let productItem = await db
			.select({
				id: product.id,
				name: product.name,
				description: product.description,
				price: product.price,
				image: productImage.url,
			})
			.from(product)
			.leftJoin(productImage, eq(productImage.productId, product.id))
			.where(eq(product.id, productId))

		return productItem.at(0) ?? null
	} catch (error) {
		if (error instanceof Error) {
			console.error("Error message:", error.message)
		} else {
			console.error("Error fetching product item:", error)
		}
		return null
	}
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
		console.log("🚀 ~ productItem:", productItem)
		return productItem
	},
	component: RouteComponent,
})

function RouteComponent() {
	const productItem = Route.useLoaderData()
	if (productItem === null) {
		return <div>Product not found</div>
	}

	return (
		<PageWrapper className="bg-red-300">
			<Heading tag="h1">{productItem.name}</Heading>
			<div className="mx-auto max-w-2xl">
				<Card>
					<CardHeader>
						<CardTitle className="capitalize">{productItem.name}</CardTitle>
						<CardDescription>{productItem.description}</CardDescription>
						<CardAction>
							<Button>Add to Cart - ${productItem.price}</Button>
						</CardAction>
					</CardHeader>
					<CardContent>
						{productItem.image && (
							<img
								src={productItem.image}
								alt={productItem.name}
								className="h-64 w-full object-contain"
							/>
						)}
					</CardContent>
					<CardFooter>
						{/* TODO render possible tags here */}
						<small>Product ID: {productItem.id}</small>
					</CardFooter>
				</Card>
			</div>
		</PageWrapper>
	)
}
