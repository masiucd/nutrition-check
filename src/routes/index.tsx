import {createFileRoute} from "@tanstack/react-router"
import {createServerFn} from "@tanstack/react-start"
import {Button} from "@/components/ui/button"
import {sql} from "@/db"

const fn = createServerFn({method: "GET"}).handler(async () => {
	const rows = await sql<{id: number; text: string}[]>`
      SELECT * FROM test_data
    `
	return rows
})

export const Route = createFileRoute("/")({
	component: App,
	loader: async () => {
		const xs = await fn()
		return xs
	},
})

function App() {
	const data = Route.useLoaderData()

	return (
		<div className="flex min-h-svh p-6">
			<div className="flex min-w-0 max-w-md flex-col gap-4 text-sm leading-loose">
				<div>
					<h1 className="font-medium">Project ready!</h1>
					<p>You may now add components and start building.</p>
					<p>We&apos;ve already added the button component for you.</p>
					<Button className="mt-2">Button</Button>
				</div>
				<ul>
					{data.map(x => (
						<li key={x.id}>{x.text}</li>
					))}
				</ul>
			</div>
		</div>
	)
}
