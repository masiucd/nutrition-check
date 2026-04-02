import {createFileRoute, useNavigate} from "@tanstack/react-router"
import {createServerFn} from "@tanstack/react-start"
import {useState} from "react"
import {PageWrapper} from "@/components/page_wrapper"
import {Heading} from "@/components/typography"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {getFoodItemById, logCalories} from "@/utils/functions/user.server"

const loadFoodItem = createServerFn({method: "GET"})
	.inputValidator((data: {id: number}) => data)
	.handler(async ({data}) => getFoodItemById(data.id))

const addCalorieLog = createServerFn({method: "POST"})
	.inputValidator((data: {userId: number; productId: number; quantity: number}) => data)
	.handler(async ({data}) => {
		await logCalories(data.userId, data.productId, data.quantity)
		return {success: true}
	})

export const Route = createFileRoute("/products/$productId")({
	loader: async ({params}) => {
		const id = Number(params.productId)
		return loadFoodItem({data: {id}})
	},
	component: FoodItemPage,
})

function FoodItemPage() {
	const item = Route.useLoaderData()
	const ctx = Route.useRouteContext()
	const navigate = useNavigate()
	const [quantity, setQuantity] = useState<string>("100")
	const [logging, setLogging] = useState(false)
	const [logMessage, setLogMessage] = useState<string | null>(null)

	if (!item) {
		return (
			<PageWrapper>
				<p className="text-center text-muted-foreground">Food item not found.</p>
			</PageWrapper>
		)
	}

	const qty = Number(quantity) || 0
	const factor = qty / item.servingSize
	const kcal = Math.round(item.calories * factor)
	const protein = (Number(item.protein) * factor).toFixed(1)
	const carbs = (Number(item.carbs) * factor).toFixed(1)
	const fat = (Number(item.fat) * factor).toFixed(1)

	async function handleLog() {
		if (!item) return
		if (!ctx.user) {
			navigate({to: "/auth/login"})
			return
		}
		if (qty <= 0) {
			setLogMessage("Please enter a valid quantity.")
			return
		}
		setLogging(true)
		setLogMessage(null)
		try {
			await addCalorieLog({
				data: {userId: ctx.user.userId, productId: item.id, quantity: qty},
			})
			setLogMessage(`Logged ${qty}g of ${item.name} (${kcal} kcal)`)
		} catch {
			setLogMessage("Failed to log. Please try again.")
		} finally {
			setLogging(false)
		}
	}

	return (
		<PageWrapper>
			<div className="mx-auto max-w-2xl p-4">
				<Heading tag="h1">{item.name}</Heading>
				<Card className="mt-4">
					<CardHeader>
						<CardTitle>{item.name}</CardTitle>
						<CardDescription>{item.description}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Nutritional info per entered quantity */}
						<div>
							<p className="mb-2 font-medium">Nutrition for {qty}g</p>
							<div className="grid grid-cols-4 gap-3 text-center">
								<div className="rounded bg-muted p-2">
									<p className="font-bold text-lg">{kcal}</p>
									<p className="text-muted-foreground text-xs">kcal</p>
								</div>
								<div className="rounded bg-muted p-2">
									<p className="font-bold text-lg">{protein}g</p>
									<p className="text-muted-foreground text-xs">Protein</p>
								</div>
								<div className="rounded bg-muted p-2">
									<p className="font-bold text-lg">{carbs}g</p>
									<p className="text-muted-foreground text-xs">Carbs</p>
								</div>
								<div className="rounded bg-muted p-2">
									<p className="font-bold text-lg">{fat}g</p>
									<p className="text-muted-foreground text-xs">Fat</p>
								</div>
							</div>
							<p className="mt-1 text-muted-foreground text-xs">
								Base values per {item.servingSize}g serving: {item.calories} kcal,{" "}
								{Number(item.protein).toFixed(1)}g protein, {Number(item.carbs).toFixed(1)}g carbs,{" "}
								{Number(item.fat).toFixed(1)}g fat
							</p>
						</div>

						{/* Log form */}
						<div className="space-y-2">
							<Label htmlFor="quantity">Quantity (grams)</Label>
							<Input
								id="quantity"
								type="number"
								min="1"
								value={quantity}
								onChange={e => setQuantity(e.target.value)}
							/>
							<Button onClick={handleLog} disabled={logging} className="w-full">
								{logging ? "Logging..." : "Log this food"}
							</Button>
							{logMessage && <p className="text-center text-green-600 text-sm">{logMessage}</p>}
							{!ctx.user && (
								<p className="text-center text-muted-foreground text-sm">
									You need to be signed in to log food.
								</p>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</PageWrapper>
	)
}
