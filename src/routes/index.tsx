import {createFileRoute} from "@tanstack/react-router"

// const _getTodayLogs = createServerFn({method: "GET"})
// 	.inputValidator((data: {userId: number | null}) => data)
// 	.handler(async ({data}) => {
// 		if (!data.userId) return []
// 		return getDailyLogs(data.userId, new Date())
// 	})

export const Route = createFileRoute("/")({
	component: App,
	// loader: async ({context}) => {
	// 	const userId = context.user?.userId ?? null
	// 	return getTodayLogs({data: {userId}})
	// },
})

function App() {
	// const logs = Route.useLoaderData()
	// const _ctx = Route.useRouteContext()

	// const _totals = logs.reduce(
	// 	(
	// 		acc: {calories: number; protein: number; carbs: number; fat: number},
	// 		log: (typeof logs)[number],
	// 	) => {
	// 		const qty = Number(log.quantity)
	// 		const servingSize = log.product.servingSize
	// 		const factor = qty / servingSize
	// 		acc.calories += Math.round(log.product.calories * factor)
	// 		acc.protein += Number(log.product.protein) * factor
	// 		acc.carbs += Number(log.product.carbs) * factor
	// 		acc.fat += Number(log.product.fat) * factor
	// 		return acc
	// 	},
	// 	{calories: 0, protein: 0, carbs: 0, fat: 0},
	// )

	return (
		<h1>asdasd</h1>
		// <div className="mx-auto max-w-3xl p-4">
		// 	<div className="mb-6 text-center">
		// 		<Heading tag="h1">Calorie Tracker</Heading>
		// 		<Text tag="lead">Track your daily nutrition</Text>
		// 	</div>

		// 	{/* Daily Summary */}
		// 	<section className="mb-6 rounded border border-foreground p-4">
		// 		<Heading tag="h2">Today's Summary</Heading>
		// 		<div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
		// 			<div className="rounded bg-muted p-3 text-center">
		// 				<p className="font-bold text-2xl">{totals.calories}</p>
		// 				<p className="text-muted-foreground text-sm">kcal</p>
		// 			</div>
		// 			<div className="rounded bg-muted p-3 text-center">
		// 				<p className="font-bold text-2xl">{totals.protein.toFixed(1)}g</p>
		// 				<p className="text-muted-foreground text-sm">Protein</p>
		// 			</div>
		// 			<div className="rounded bg-muted p-3 text-center">
		// 				<p className="font-bold text-2xl">{totals.carbs.toFixed(1)}g</p>
		// 				<p className="text-muted-foreground text-sm">Carbs</p>
		// 			</div>
		// 			<div className="rounded bg-muted p-3 text-center">
		// 				<p className="font-bold text-2xl">{totals.fat.toFixed(1)}g</p>
		// 				<p className="text-muted-foreground text-sm">Fat</p>
		// 			</div>
		// 		</div>
		// 	</section>

		// 	{/* Today's Log */}
		// 	<section className="mb-6 rounded border border-foreground p-4">
		// 		<div className="flex items-center justify-between">
		// 			<Heading tag="h2">Today's Log</Heading>
		// 			<Link to="/products">
		// 				<Button size="sm">+ Add Food</Button>
		// 			</Link>
		// 		</div>

		// 		{logs.length === 0 ? (
		// 			<div className="mt-4 text-center text-muted-foreground">
		// 				<p>No food logged today yet.</p>
		// 				{!ctx.user && (
		// 					<p className="mt-2 text-sm">
		// 						<Link to="/auth/login" className="underline">
		// 							Sign in
		// 						</Link>{" "}
		// 						to start tracking.
		// 					</p>
		// 				)}
		// 			</div>
		// 		) : (
		// 			<ul className="mt-3 space-y-2">
		// 				{logs.map(log => {
		// 					const qty = Number(log.quantity)
		// 					const factor = qty / log.product.servingSize
		// 					const kcal = Math.round(log.product.calories * factor)
		// 					return (
		// 						<li
		// 							key={log.id}
		// 							className="flex items-center justify-between rounded border border-border p-2"
		// 						>
		// 							<div>
		// 								<span className="font-medium">{log.product.name}</span>
		// 								<span className="ml-2 text-muted-foreground text-sm">{qty}g</span>
		// 							</div>
		// 							<span className="font-semibold">{kcal} kcal</span>
		// 						</li>
		// 					)
		// 				})}
		// 			</ul>
		// 		)}
		// 	</section>
		// </div>
	)
}
