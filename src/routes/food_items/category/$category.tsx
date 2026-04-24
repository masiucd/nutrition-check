import {createFileRoute, Link} from "@tanstack/react-router"
import {Heading, Text} from "@/components/typography"
import {PageWrapper} from "@/components/wrappers/page"
import type {FoodCategory} from "@/db/category.dao.server"
import {getFoodItemsByCategory} from "@/server/functions/food"

export const Route = createFileRoute("/food_items/category/$category")({
	component: RouteComponent,
	loader: async ({params}) => {
		const result = await getFoodItemsByCategory({data: {category: params.category}})
		return result
	},
})

function toDisplayCategory(category: string) {
	return category
		.replaceAll(/[-_]+/g, " ")
		.trim()
		.replaceAll(/\s+/g, " ")
		.replace(/\b\w/g, char => char.toUpperCase())
}

function RouteComponent() {
	const {category} = Route.useParams()
	const {data, error} = Route.useLoaderData()

	if (error !== null) <ErrorView error={error} />

	const displayCategory = toDisplayCategory(category)
	const totalItems = data.length

	return (
		<PageWrapper column>
			<section className="w-full max-w-4xl">
				<Header totalItems={totalItems} displayCategory={displayCategory} />
				<div className="mb-5">
					{totalItems === 0 ? <FallbackForNoItems /> : <FoodList foodItems={data} />}
				</div>
			</section>
		</PageWrapper>
	)
}

function Header({totalItems, displayCategory}: {totalItems: number; displayCategory: string}) {
	return (
		<header className="mb-6 rounded-2xl border bg-card p-6 shadow-sm">
			<div className="mb-3 flex flex-wrap items-center gap-3">
				<span className="inline-flex items-center rounded-full border bg-muted px-3 py-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
					Category
				</span>
				<span className="inline-flex items-center rounded-full border bg-background px-3 py-1 font-medium text-foreground text-xs">
					{totalItems} {totalItems === 1 ? "item" : "items"}
				</span>
			</div>
			<Heading className="mb-2">{displayCategory}</Heading>
			<Text className="text-muted-foreground">
				Browse all food items in this category and select one to view details.
			</Text>
		</header>
	)
}

function FoodList({foodItems}: {foodItems: FoodCategory[]}) {
	return (
		<ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
			{foodItems.map(item => (
				<li key={item.food_id}>
					<Link
						to="/food_items/$foodid"
						params={{foodid: item.food_id.toString()}}
						className="group block h-full rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
					>
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0">
								<p className="truncate text-muted-foreground text-sm">Food item</p>
								<p className="truncate font-semibold text-base text-foreground group-hover:text-primary">
									{item.food_name}
								</p>
							</div>
							<span className="inline-flex shrink-0 items-center rounded-md border bg-background px-2 py-1 text-muted-foreground text-xs transition-colors group-hover:border-primary/30 group-hover:text-primary">
								View
							</span>
						</div>
					</Link>
				</li>
			))}
		</ul>
	)
}

function FallbackForNoItems() {
	return (
		<section className="rounded-2xl border border-dashed bg-muted/20 p-10 text-center">
			<div className="mx-auto mb-3 h-12 w-12 rounded-full border bg-background" />
			<Text className="mb-2 font-medium text-base">No items in this category yet</Text>
			<Text className="mb-5 text-muted-foreground">
				Try a different category or add a new food item to get started.
			</Text>
			<Link
				to="/food_items"
				className="inline-flex items-center rounded-lg border bg-background px-4 py-2 font-medium text-foreground text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
			>
				Go to food items
			</Link>
		</section>
	)
}

function ErrorView({error}: {error: string}) {
	return (
		<PageWrapper>
			<section className="w-full max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
				<div className="mb-2 flex items-center gap-2">
					<span aria-hidden="true" className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
					<Text className="font-medium text-red-800">Something went wrong</Text>
				</div>
				<Text className="text-red-700">{error}</Text>
				<div className="mt-4">
					<Link
						to="/food_items"
						className="inline-flex items-center rounded-lg border border-red-300 bg-white px-3 py-2 font-medium text-red-700 text-sm transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
					>
						Back to food items
					</Link>
				</div>
			</section>
		</PageWrapper>
	)
}
