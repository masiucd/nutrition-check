import {TanStackDevtools} from "@tanstack/react-devtools"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import {ReactQueryDevtools} from "@tanstack/react-query-devtools"
import {
	createRootRoute,
	HeadContent,
	Link,
	type NotFoundRouteProps,
	Scripts,
} from "@tanstack/react-router"
import {TanStackRouterDevtoolsPanel} from "@tanstack/react-router-devtools"
import {useServerFn} from "@tanstack/react-start"
import type {PropsWithChildren} from "react"
import {Button} from "@/components/ui/button"
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
				title: "Calorie tracker",
				description: "Track your calories and stay healthy",
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
									Calorie Tracker
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
					<footer>
						<div className="mx-auto flex h-30 items-center md:max-w-7xl">
							Lorem ipsum dolor sit amet consectetur adipisicing elit. In ipsum corporis voluptas
							impedit hic magnam nihil non omnis, quos inventore rerum veritatis doloremque,
							perferendis mollitia iusto deserunt eius nisi labore.
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
