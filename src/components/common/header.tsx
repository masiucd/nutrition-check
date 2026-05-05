import {Link, type LinkProps, useRouterState} from "@tanstack/react-router"
import {useServerFn} from "@tanstack/react-start"
import {Flame, LogOut, UserIcon} from "lucide-react"
import type {PropsWithChildren} from "react"
import {Button} from "@/components/ui/button"
import {appData} from "@/config"
import type {ContextUser} from "@/lib/schemas"
import {cn} from "@/lib/utils"
import {logoutFn} from "@/server/functions/user"

export function Header(props: {user: ContextUser}) {
	return (
		<header className="sticky top-0 z-50 border-border/50 border-b bg-background/90 backdrop-blur-md">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
				{/* Brand */}
				<Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
						<Flame className="h-4 w-4 text-orange-500" />
					</div>
					<span className="font-semibold text-foreground text-sm tracking-tight">
						{appData.title}
					</span>
				</Link>
				<nav>
					<NavLinks user={props.user} />
				</nav>
			</div>
		</header>
	)
}

function NavLinks(props: {user: ContextUser}) {
	if (!props.user) return <UnauthenticatedNavLinks />
	return <AuthenticatedNavLinks user={props.user} />
}

function createInitials(user: ContextUser) {
	if (user?.first_name && user?.last_name)
		return `${user.first_name[0].toUpperCase()}${user.last_name[0].toUpperCase()}`
	return user?.email?.[0].toUpperCase()
}

function AuthenticatedNavLinks({user}: {user: ContextUser}) {
	const logout = useServerFn(logoutFn)
	const initial = createInitials(user)

	return (
		<ul className="flex items-center gap-1">
			<li>
				<NavLink to="/food_items">Food items</NavLink>
			</li>
			<li>
				<NavLink to="/auth/profile">
					<div className="flex items-center gap-2">
						<div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 font-medium text-primary text-xs">
							{initial}
						</div>
						<span className="sr-only">Profile</span>
					</div>
				</NavLink>
			</li>

			<li aria-hidden="true" className="mx-2 h-4 w-px bg-border" />

			<li>
				<Button
					variant="ghost"
					size="sm"
					className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
					onClick={async () => {
						await logout()
					}}
				>
					<LogOut className="h-3.5 w-3.5" />
					Log out
				</Button>
			</li>
		</ul>
	)
}

function UnauthenticatedNavLinks() {
	return (
		<ul className="flex items-center gap-1">
			<li>
				<NavLink to="/food_items">Food items</NavLink>
			</li>
			<li>
				<NavLink to="/login">
					<div className="flex items-center gap-1.5">
						<UserIcon className="h-3.5 w-3.5" />
						Log in
					</div>
				</NavLink>
			</li>
			<li className="ml-2">
				<Button asChild size="sm" className="h-8">
					<Link to="/signup">Sign up</Link>
				</Button>
			</li>
		</ul>
	)
}

function NavLink(props: LinkProps & PropsWithChildren) {
	const pathname = useRouterState({select: s => s.location.pathname})
	const isActive =
		typeof props.to === "string" &&
		(props.to === "/" ? pathname === "/" : pathname.startsWith(props.to))

	return (
		<Link
			className={cn(
				"flex items-center rounded-md px-3 py-1.5 text-sm transition-colors",
				isActive
					? "bg-accent font-medium text-accent-foreground"
					: "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
			)}
			{...props}
		/>
	)
}
