import {Link, type LinkProps} from "@tanstack/react-router"
import {Flame} from "lucide-react"
import type {PropsWithChildren} from "react"
import {appData} from "@/config"
import {todayUtc} from "@/lib/date"
import type {ContextUser} from "@/lib/schemas"

const today = todayUtc()

export function Footer(props: {user: ContextUser}) {
	return (
		<footer className="border-border border-t bg-muted/30">
			<div className="mx-auto max-w-7xl px-6 py-12">
				<div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
					{/* Brand */}
					<div className="flex flex-col gap-3">
						<div className="flex items-center gap-2">
							<Flame className="h-5 w-5 text-orange-500" />
							<span className="font-semibold text-foreground">{appData.title}</span>
						</div>
						<p className="max-w-xs text-muted-foreground text-sm leading-relaxed">
							{appData.description}
						</p>
					</div>

					{/* Navigation */}
					<div className="flex flex-col gap-3">
						<h3 className="font-medium text-foreground text-sm">Navigation</h3>
						<ul className="flex flex-col gap-2">
							<FooterLink to="/">Home</FooterLink>
							{props.user === null ? (
								<>
									<FooterLink to="/login">Log in</FooterLink>
									<FooterLink to="/signup">Sign up</FooterLink>
								</>
							) : (
								<FooterLink to="/auth/profile">Profile</FooterLink>
							)}
						</ul>
					</div>

					{/* Features */}
					<div className="flex flex-col gap-3">
						<h3 className="font-medium text-foreground text-sm">What you can do</h3>
						<ul className="flex flex-col gap-2 text-muted-foreground text-sm">
							<li>Track daily calorie intake</li>
							<li>Build a personal food library</li>
							<li>Log meals by breakfast, lunch, dinner & snacks</li>
							<li>Review nutrition data at a glance</li>
						</ul>
					</div>
				</div>

				<div className="mt-10 flex items-center justify-between border-border border-t pt-6">
					<p className="text-muted-foreground text-xs">
						© {today.year} {appData.title}. All rights reserved.
					</p>
					<p className="text-muted-foreground text-xs">Built for personal health tracking.</p>
				</div>
			</div>
		</footer>
	)
}

function FooterLink(props: LinkProps & PropsWithChildren) {
	return (
		<li className="list-none">
			<Link
				className="text-muted-foreground text-sm transition-colors hover:text-foreground"
				{...props}
			/>
		</li>
	)
}
