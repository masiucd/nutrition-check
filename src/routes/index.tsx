import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Heading } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { db } from "@/db/connect";
import { user } from "@/db/schema";

async function readUsers() {
	const xs = await db
		.select({
			username: user.username,
			email: user.email,
		})
		.from(user);
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
