import {createFileRoute, Link} from "@tanstack/react-router"
import {Apple, BarChart3, BookOpen, Flame, TrendingUp, Utensils} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {isNonNullable} from "@/lib/types"
import {cn} from "@/lib/utils"

export const Route = createFileRoute("/")({
	component: HomePage,
})

function HomePage() {
	const ctx = Route.useRouteContext()
	const isAuthenticated = isNonNullable(ctx.user)

	return (
		<div className="flex flex-col">
			<Hero isAuthenticated={isAuthenticated} />
			<Divider />
			<Features />
			<HowItWorks />
			{isAuthenticated && <AuthenticatedCta />}
		</div>
	)
}

function Hero(props: {isAuthenticated: boolean}) {
	return (
		<section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 py-20 text-center">
			<div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-muted-foreground text-sm">
				<Flame className="h-4 w-4 text-orange-500" />
				Personal calorie tracker
			</div>

			<h1 className="font-bold text-5xl text-foreground tracking-tight">
				Know what you eat.
				<br />
				<span className="text-primary">Every single day.</span>
			</h1>

			<p className="max-w-xl text-lg text-muted-foreground">
				A simple, no-nonsense calorie tracker. Log your meals, build your food library, and
				understand your nutrition — all in one place.
			</p>

			<HeroCta isAuthenticated={props.isAuthenticated} />
		</section>
	)
}

function HeroCta(props: {isAuthenticated: boolean}) {
	return (
		<div className="flex items-center gap-3">
			{props.isAuthenticated ? (
				<Button asChild size="lg">
					<Link to="/auth/profile">Go to Profile</Link>
				</Button>
			) : (
				<>
					<Button asChild size="lg">
						<Link to="/signup">Get started</Link>
					</Button>
					<Button asChild variant="outline" size="lg">
						<Link to="/login">Log in</Link>
					</Button>
				</>
			)}
		</div>
	)
}

function Divider() {
	return (
		<div className="mx-auto w-full max-w-4xl px-6">
			<div className="h-px bg-border" />
		</div>
	)
}

function Features() {
	return (
		<section className="mx-auto w-full max-w-4xl px-6 py-16">
			<div className="mb-10 text-center">
				<h2 className="font-semibold text-2xl text-foreground tracking-tight">
					Everything you need to track your intake
				</h2>
				<p className="mt-2 text-muted-foreground">
					Designed to stay out of your way while keeping you informed.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{features.map(({icon: Icon, title, description}) => (
					<Card key={title} className={cn("border-border transition-shadow hover:shadow-md")}>
						<CardHeader className="flex flex-row items-center gap-3 pb-2">
							<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
								<Icon className="h-5 w-5 text-primary" />
							</div>
							<CardTitle className="font-medium text-base">{title}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-sm">{description}</p>
						</CardContent>
					</Card>
				))}
			</div>
		</section>
	)
}

function HowItWorks() {
	return (
		<section className="bg-muted/40 py-16">
			<div className="mx-auto max-w-4xl px-6">
				<div className="mb-10 text-center">
					<h2 className="font-semibold text-2xl text-foreground tracking-tight">How it works</h2>
				</div>

				<ol className="grid grid-cols-1 gap-6 sm:grid-cols-3">
					{[
						{
							step: "1",
							title: "Create your food library",
							body: "Add the foods you eat regularly with their calorie value and unit (e.g. 100 g, 1 slice, 1 cup).",
						},
						{
							step: "2",
							title: "Log meals throughout the day",
							body: "Pick a food, enter the quantity, choose the meal slot — that's it. Calories are calculated instantly.",
						},
						{
							step: "3",
							title: "Review your daily totals",
							body: "Check your dashboard for a full breakdown of what you've eaten and how close you are to your target.",
						},
					].map(({step, title, body}) => (
						<li key={step} className="flex flex-col gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-lg text-primary-foreground">
								{step}
							</div>
							<h3 className="font-medium text-foreground">{title}</h3>
							<p className="text-muted-foreground text-sm">{body}</p>
						</li>
					))}
				</ol>
			</div>
		</section>
	)
}

function AuthenticatedCta() {
	return (
		<section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-5 px-6 py-20 text-center">
			<h2 className="font-bold text-3xl text-foreground tracking-tight">
				Ready to start tracking?
			</h2>
			<p className="max-w-md text-muted-foreground">
				Sign up in seconds — no payment, no fluff. Just clean calorie tracking.
			</p>
			<Button asChild size="lg">
				<Link to="/signup">Create a account</Link>
			</Button>
		</section>
	)
}

const features = [
	{
		icon: Flame,
		title: "Track Daily Calories",
		description:
			"Log every meal — breakfast, lunch, dinner, and snacks. See your daily totals at a glance and stay on top of your calorie goals.",
	},
	{
		icon: Utensils,
		title: "Manage Your Food Library",
		description:
			"Build a personal database of foods with their calorie and nutrition values. Reuse them across any day with a single click.",
	},
	{
		icon: BarChart3,
		title: "View Nutrition Data",
		description:
			"Browse calories per unit for every food in your library. Know exactly what you're eating before you log it.",
	},
	{
		icon: TrendingUp,
		title: "Daily Summaries",
		description:
			"Get an instant breakdown of your calorie intake for any day, grouped by meal so you can spot where you're going over.",
	},
	{
		icon: BookOpen,
		title: "Full Meal History",
		description:
			"Browse back through any previous day to review what you ate. Your complete history is always one click away.",
	},
	{
		icon: Apple,
		title: "Custom Portions",
		description:
			"Log any quantity — half a banana, two cups of oats, 150 g of chicken. Calories scale automatically.",
	},
] as const
