import {createFileRoute, Link, useNavigate, useSearch} from "@tanstack/react-router"
import {createServerFn} from "@tanstack/react-start"
import {z} from "zod"
import {Heading, Text} from "@/components/typography"
import {Input} from "@/components/ui/input"
import {getFoodItems} from "@/utils/functions/user.server"

const searchSchema = z.object({
	q: z.string().optional(),
})

const loadFoodItems = createServerFn({method: "GET"})
	.inputValidator((data: {search?: string}) => data)
	.handler(async ({data}) => {
		return getFoodItems(data.search)
	})

export const Route = createFileRoute("/products/")({
	validateSearch: searchSchema,
	component: FoodItemsPage,
	loader: async ({location}) => {
		const q = (location.search as {q?: string}).q
		return loadFoodItems({data: {search: q}})
	},
})

function FoodItemsPage() {
	const items = Route.useLoaderData()
	const search = useSearch({from: "/products/"})
	const navigate = useNavigate({from: "/products/"})

	return (
		<div className="mx-auto max-w-4xl p-4">
			<div className="mb-6">
				<Heading tag="h1">Food Items</Heading>
				<Text tag="lead">Browse and log nutritional food items</Text>
			</div>

			<div className="mb-4">
				<Input
					placeholder="Search food items..."
					defaultValue={search.q ?? ""}
					onChange={e => {
						const value = e.target.value
						navigate({
							search: (prev: Record<string, unknown>) => ({...prev, q: value || undefined}),
						})
					}}
				/>
			</div>

			{items.length === 0 ? (
				<p className="text-center text-muted-foreground">No food items found.</p>
			) : (
				<ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{items.map((item: (typeof items)[number]) => (
						<li key={item.id} className="rounded border border-foreground p-4">
							<Link to="/products/$productId" params={{productId: item.id.toString()}}>
								<Heading tag="h2" className="hover:underline">
									{item.name}
								</Heading>
							</Link>
							<p className="mt-1 text-muted-foreground text-sm">{item.description}</p>
							<div className="mt-3 grid grid-cols-4 gap-2 text-sm">
								<div className="text-center">
									<p className="font-bold">{item.calories}</p>
									<p className="text-muted-foreground">kcal</p>
								</div>
								<div className="text-center">
									<p className="font-bold">{Number(item.protein).toFixed(1)}g</p>
									<p className="text-muted-foreground">Protein</p>
								</div>
								<div className="text-center">
									<p className="font-bold">{Number(item.carbs).toFixed(1)}g</p>
									<p className="text-muted-foreground">Carbs</p>
								</div>
								<div className="text-center">
									<p className="font-bold">{Number(item.fat).toFixed(1)}g</p>
									<p className="text-muted-foreground">Fat</p>
								</div>
							</div>
							<p className="mt-1 text-muted-foreground text-xs">per {item.servingSize}g serving</p>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
