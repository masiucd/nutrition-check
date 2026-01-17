import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { Heading } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { db } from "@/db/connect";
import { product, productImage, user } from "@/db/schema";

async function readUsers() {
	const xs = await db
		.select({
			name: product.name,
			description: product.description,
			price: product.price,
			image: productImage.url,
		})
		.from(product)
		.innerJoin(productImage, eq(productImage.productId, product.id));
	return xs;
}

const getUsers = createServerFn({ method: "GET" }).handler(async () => {
	return await readUsers();
});

export const Route = createFileRoute("/")({
	component: App,
	loader: async () => {
		return await getUsers();
	},
});

function App() {
	const users = Route.useLoaderData();

	return (
		<div>
			<Heading tag="h1">Sick fits</Heading>
			<Button>Click me</Button>
			<ul>
				{users.map((user) => (
					<li key={user.email}>
						{user.username} - {user.email}
					</li>
				))}
			</ul>
		</div>
	);
}
