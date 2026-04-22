import {createFileRoute, Link} from "@tanstack/react-router"
import {Heading} from "@/components/typography"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {PageWrapper} from "@/components/wrappers/page"
import {getFoodItem} from "@/server/functions/food"

export const Route = createFileRoute("/food_items/$foodid")({
	component: RouteComponent,
	loader: async ({params, context}) => {
		const id = Number(params.foodid)
		const user = context.user
		const maybeFoodItem = await getFoodItem({data: {id}})
		return {resultData: maybeFoodItem, user}
	},
})

function RouteComponent() {
	const {foodid} = Route.useParams()
	const {
		resultData: {error, foodItemData},
	} = Route.useLoaderData()

	if (error || foodItemData === null) {
		return (
			<PageWrapper>
				<div className="mx-auto max-w-2xl py-12 text-center">
					<Heading>Food Item Not Found</Heading>
					<p className="mt-4 text-muted-foreground">
						{error || `Could not find food item with id ${foodid}.`}
					</p>
					<Button asChild className="mt-8">
						<Link to="/food_items">Back to Food Database</Link>
					</Button>
				</div>
			</PageWrapper>
		)
	}

	const {
		food_category,
		food_name,
		unit_label,
		calories_per_unit,
		protein_per_unit,
		food_type,
		carbs_per_unit,
		fat_per_unit,
	} = foodItemData

	return (
		<PageWrapper>
			<div className="mx-auto max-w-3xl px-4 py-8">
				<Button asChild variant="outline" className="mb-8">
					<Link to="/food_items">&larr; Back to Database</Link>
				</Button>

				<Card className="overflow-hidden border-border/50 shadow-sm">
					<CardHeader className="border-border/50 border-b bg-muted/30 pb-8">
						<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
							<div>
								<CardTitle className="font-bold text-3xl tracking-tight">{food_name}</CardTitle>
								<CardDescription className="mt-2 font-medium text-base">
									Nutrition Facts per 1 {unit_label}
								</CardDescription>
							</div>
							<div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
								<Badge variant="default" className="text-sm">
									{food_category}
								</Badge>
								<Badge variant="secondary" className="text-sm">
									{food_type}
								</Badge>
							</div>
						</div>
					</CardHeader>
					<CardContent className="pt-8">
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
							<div className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-colors hover:bg-muted/10">
								<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Calories
								</span>
								<span className="mt-3 font-bold text-4xl text-primary">{calories_per_unit}</span>
								<span className="mt-1 font-medium text-muted-foreground text-sm">kcal</span>
							</div>

							<div className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-colors hover:bg-muted/10">
								<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Protein
								</span>
								<span className="mt-3 font-bold text-4xl">{protein_per_unit}</span>
								<span className="mt-1 font-medium text-muted-foreground text-sm">g</span>
							</div>

							<div className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-colors hover:bg-muted/10">
								<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Carbs
								</span>
								<span className="mt-3 font-bold text-4xl">{carbs_per_unit}</span>
								<span className="mt-1 font-medium text-muted-foreground text-sm">g</span>
							</div>

							<div className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-colors hover:bg-muted/10">
								<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Fat Fat
								</span>
								<span className="mt-3 font-bold text-4xl">{fat_per_unit}</span>
								<span className="mt-1 font-medium text-muted-foreground text-sm">g</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</PageWrapper>
	)
}
