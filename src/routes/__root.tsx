import {TanStackDevtools} from "@tanstack/react-devtools"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import {ReactQueryDevtools} from "@tanstack/react-query-devtools"
import {createRootRoute, HeadContent, Link, Scripts} from "@tanstack/react-router"
import {TanStackRouterDevtoolsPanel} from "@tanstack/react-router-devtools"
import {useServerFn} from "@tanstack/react-start"
import type {PropsWithChildren} from "react"
import {Button} from "@/components/ui/button"
import {isNonNullable} from "@/lib/types"
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
		// TODO Set  context with auth
		const user = await getCurrentUserFn()
		if (!user) return {user: null}
		return {
			user: {
				id: user.id,
				email: user.email,
			},
		}
	},
	notFoundComponent: () => {
		return <p>...Not Found</p>
	},
})

const queryClient = new QueryClient()

function RootDocument({children}: PropsWithChildren) {
	const ctx = Route.useRouteContext()
	const isAuthenticated = isNonNullable(ctx.user)
	const logout = useServerFn(logoutFn)

	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<header>
					<nav>
						<ul className="flex gap-2">
							{!isAuthenticated && (
								<>
									<li>
										<Link to="/login">Login</Link>
									</li>
									<li>
										<Link to="/signup">Sign up</Link>
									</li>
								</>
							)}
							{isAuthenticated && (
								<>
									<li>
										<Button
											variant="link"
											onClick={async () => {
												await logout()
											}}
										>
											Logout
										</Button>
									</li>
									<li>
										<Link to="/auth/profile">Profile</Link>
									</li>
								</>
							)}
						</ul>
					</nav>
				</header>
				<QueryClientProvider client={queryClient}>
					{children}

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
