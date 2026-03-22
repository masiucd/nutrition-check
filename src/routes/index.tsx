import {createFileRoute, Link} from "@tanstack/react-router"
import {createServerFn} from "@tanstack/react-start"
import {eq} from "drizzle-orm"
import {Heading, Text} from "@/components/typography"
import {db} from "@/db/connect"
import {product, productImage} from "@/db/schema"

async function readProducts() {
	const products = await db
		.select({
			id: product.id,
			name: product.name,
			description: product.description,
			price: product.price,
			image: productImage.url,
		})
		.from(product)
		.leftJoin(productImage, eq(productImage.productId, product.id))
	return products
}

const getUsers = createServerFn({method: "GET"}).handler(async () => {
	try {
		return await readProducts()
	} catch (error) {
		console.error("Error fetching products:", error)
		return []
	}
})

export const Route = createFileRoute("/")({
	component: App,
	loader: async () => {
		return await getUsers()
	},
})

function App() {
	const data = Route.useLoaderData()
	return (
		<div>
			<div className="mb-10 text-center">
				<Heading tag="h1">Sick fits</Heading>
				<Text tag="lead">The best products for sale</Text>
			</div>
			<section className="mx-auto max-w-6xl border border-foreground">
				<ul className="grid grid-cols-1 gap-5 p-2 md:grid-cols-3">
					{data.map(product => (
						<li key={product.name} className="my-4 rounded border border-foreground">
							<Heading tag="h2">
								<Link to={`/products/$productId`} params={{productId: product.id.toString()}}>
									{product.name}
								</Link>
							</Heading>
							<p>{product.description}</p>
							<p>${product.price}</p>
							{product.image && (
								<img src={product.image} alt={product.name} className="h-48 w-48 object-cover" />
							)}
						</li>
					))}
					<li>
						<img src="./shoes/puma.jpg" alt="" />
						<img src="./shoes/nike.jpg" alt="" />
						<img src="./shoes/newbalance.jpg" alt="" />
					</li>
				</ul>
			</section>
		</div>
	)
}
