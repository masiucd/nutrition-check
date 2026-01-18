import {createFileRoute} from "@tanstack/react-router"
import {createServerFn} from "@tanstack/react-start"
import {eq} from "drizzle-orm"
import {Heading} from "@/components/typography"
import {db} from "@/db/connect"
import {product, productImage} from "@/db/schema"

async function readUsers() {
	const xs = await db
		.select({
			name: product.name,
			description: product.description,
			price: product.price,
			image: productImage.url,
		})
		.from(product)
		.leftJoin(productImage, eq(productImage.productId, product.id))
	return xs
}

const getUsers = createServerFn({method: "GET"}).handler(async () => {
	return await readUsers()
})

export const Route = createFileRoute("/")({
	component: App,
	loader: async () => {
		return await getUsers()
	},
})

function App() {
	const data = Route.useLoaderData()
	console.log({data})
	return (
		<div>
			<Heading tag="h1">Sick fits</Heading>

			<ul>
				{data.map(product => (
					<li key={product.name} className="my-4">
						<Heading tag="h2">{product.name}</Heading>
						<p>{product.description}</p>
						<p>${product.price}</p>
						{product.image && (
							<img src={product.image} alt={product.name} className="w-48 h-48 object-cover" />
						)}
					</li>
				))}
			</ul>
		</div>
	)
}
