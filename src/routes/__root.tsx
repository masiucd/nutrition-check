import {TanStackDevtools} from "@tanstack/react-devtools"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import {ReactQueryDevtools} from "@tanstack/react-query-devtools"
import {
	createRootRoute,
	HeadContent,
	Link,
	type LinkProps,
	type NotFoundRouteProps,
	Scripts,
	useRouterState,
} from "@tanstack/react-router"
import {TanStackRouterDevtoolsPanel} from "@tanstack/react-router-devtools"
import {useServerFn} from "@tanstack/react-start"
import {Flame, LogOut, User} from "lucide-react"
import type {PropsWithChildren} from "react"
import {Button} from "@/components/ui/button"
import {appData} from "@/config"
import {todayUtc} from "@/lib/date"
import {isNonNullable} from "@/lib/types"
import {cn} from "@/lib/utils"
import {getCurrentUserFn, logoutFn} from "@/server/functions/user"
import appCss from "../styles.css?url"

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: appData.title,
				description: appData.description,
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
	beforeLoad: async () => {
		const user = await getCurrentUserFn()
		if (!user) return {user: null}
		return {
			user: {
				id: user.id,
				email: user.email,
			},
		}
	},
	notFoundComponent: props => {
		return <NotFound {...props} />
	},
})

const queryClient = new QueryClient()

const today = todayUtc()

function RootDocument({children}: PropsWithChildren) {
	const ctx = Route.useRouteContext()
	const isAuthenticated = isNonNullable(ctx.user)

	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<QueryClientProvider client={queryClient}>
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

							{/* Nav */}
							<nav>
								{!isAuthenticated && <UnauthenticatedNavLinks />}
								{isAuthenticated && <AuthenticatedNavLinks email={ctx.user?.email} />}
							</nav>
						</div>
					</header>

					<main className="flex min-h-[calc(100svh-15rem)] flex-col">{children}</main>
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
										<FooterLink to="/login">Log in</FooterLink>
										<FooterLink to="/signup">Sign up</FooterLink>
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
					<ReactQueryDevtools initialIsOpen={false} />
				</QueryClientProvider>
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	)
}

function AuthenticatedNavLinks({email}: {email?: string | null}) {
	const logout = useServerFn(logoutFn)
	const initial = email?.[0]?.toUpperCase() ?? "?"

	return (
		<div className="flex items-center gap-1">
			<NavLink to="/auth/profile">
				<div className="flex items-center gap-2">
					<div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 font-medium text-primary text-xs">
						{initial}
					</div>
					<span>Profile</span>
				</div>
			</NavLink>

			<div className="mx-2 h-4 w-px bg-border" />

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
		</div>
	)
}

function UnauthenticatedNavLinks() {
	return (
		<div className="flex items-center gap-1">
			<NavLink to="/login">
				<div className="flex items-center gap-1.5">
					<User className="h-3.5 w-3.5" />
					Log in
				</div>
			</NavLink>

			<div className="ml-2">
				<Button asChild size="sm" className="h-8">
					<Link to="/signup">Sign up</Link>
				</Button>
			</div>
		</div>
	)
}

// TODO - UI need to be implanted
function NotFound(_props: NotFoundRouteProps) {
	return <p>...Not Found</p>
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
