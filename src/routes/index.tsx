import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
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
	const todos = Route.useLoaderData();
	console.log("🚀 ~ App ~ todos:", todos);
	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
			<h1>Hello world</h1>
		</div>
	);
}
