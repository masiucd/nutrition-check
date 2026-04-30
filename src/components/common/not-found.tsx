import {Link, type NotFoundRouteProps} from "@tanstack/react-router"
import {Flame} from "lucide-react"
import {Button} from "@/components/ui/button"

export function NotFound(_props: NotFoundRouteProps) {
	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-6 py-24 text-center">
			{/* Large muted 404 */}
			<div className="relative select-none">
				<span className="font-bold text-[10rem] text-border leading-none tracking-tighter">
					404
				</span>
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted shadow-sm">
						<Flame className="h-8 w-8 text-orange-400" />
					</div>
				</div>
			</div>

			{/* Copy */}
			<div className="flex flex-col gap-3">
				<h1 className="font-semibold text-2xl text-foreground tracking-tight">Page not found</h1>
				<p className="max-w-md text-muted-foreground leading-relaxed">
					The page you're looking for doesn't exist or may have been moved. Double-check the URL, or
					head back to a place you know.
				</p>
			</div>

			{/* Actions */}
			<div className="flex flex-wrap items-center justify-center gap-3">
				<Button asChild size="lg">
					<Link to="/">Go to home</Link>
				</Button>
				<Button variant="outline" size="lg" onClick={() => window.history.back()}>
					Go back
				</Button>
			</div>

			{/* Quick links */}
			<div className="flex flex-col items-center gap-3">
				<p className="text-muted-foreground text-sm">Or jump to one of these:</p>
				<div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
					{[
						{to: "/login" as const, label: "Log in"},
						{to: "/signup" as const, label: "Sign up"},
						{to: "/auth/profile" as const, label: "Profile"},
					].map(({to, label}) => (
						<Link
							key={to}
							to={to}
							className="text-primary text-sm underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
						>
							{label}
						</Link>
					))}
				</div>
			</div>
		</div>
	)
}
