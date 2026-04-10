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
} from "@tanstack/react-router"
import {TanStackRouterDevtoolsPanel} from "@tanstack/react-router-devtools"
import {useServerFn} from "@tanstack/react-start"
import {Flame} from "lucide-react"
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
					<header className="border border-blue-400">
						<div className="mx-auto flex h-30 items-center md:max-w-7xl">
							<strong className="font-bold no-underline md:mr-2">
								<Link className="opacity-80 hover:opacity-100" to="/">
									{appData.title}
								</Link>
							</strong>
							<nav className="flex flex-1 border border-green-500">
								<ul className="flex flex-1 justify-end gap-2 border-2 border-red-400">
									{!isAuthenticated && <UnauthenticatedNavLinks />}
									{isAuthenticated && <AuthenticatedNavLinks />}
								</ul>
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

function AuthenticatedNavLinks() {
	const logout = useServerFn(logoutFn)
	return (
		<div className="flex items-center gap-2">
			<NavListItem>
				<Link to="/auth/profile">Profile</Link>
			</NavListItem>
			<NavListItem>
				<Button
					variant="outline"
					onClick={async () => {
						await logout()
					}}
				>
					Logout
				</Button>
			</NavListItem>
		</div>
	)
}

function UnauthenticatedNavLinks() {
	return (
		<>
			<NavListItem>
				<Link to="/login">Login</Link>
			</NavListItem>
			<NavListItem>
				<Link to="/signup">Sign up</Link>
			</NavListItem>
		</>
	)
}

// TODO - UI need to be implanted
function NotFound(_props: NotFoundRouteProps) {
	return <p>...Not Found</p>
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

function NavListItem(props: PropsWithChildren<{className?: string}>) {
	return (
		<li
			className={cn(
				"p-1 underline decoration-2 decoration-foreground/20 underline-offset-4 transition-all hover:decoration-foreground",
				props.className,
			)}
		>
			{props.children}
		</li>
	)
}
