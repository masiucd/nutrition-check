import {createFileRoute} from "@tanstack/react-router"
import {createServerFn} from "@tanstack/react-start"
import {Button} from "@/components/ui/button"
import {sql} from "@/db"

const fn = createServerFn({method: "GET"}).handler(async () => {
	const r = await sql`
      SELECT * FROM test_data
    `
	return r
})

export const Route = createFileRoute("/")({
	component: App,
	loader: async () => {
		const xs = await fn()
		return xs
	},
})

function App() {
	const _data = Route.useLoaderData()
	console.log(_data)
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
					{_data.map(x => (
						<li key={x.id}>{x.text}</li>
					))}
				</ul>
			</div>
		</div>
	)
}
