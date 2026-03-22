import {TanStackDevtools} from "@tanstack/react-devtools"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import {ReactQueryDevtools} from "@tanstack/react-query-devtools"
import {createRootRoute, HeadContent, Link, Scripts} from "@tanstack/react-router"
import {TanStackRouterDevtoolsPanel} from "@tanstack/react-router-devtools"
import {useServerFn} from "@tanstack/react-start"
import {AuthProvider} from "@/context/auth"
import {getCurrentUserFn, logoutFn} from "@/utils/functions/user.functions"

import appCss from "../styles.css?url"

const queryClient = new QueryClient()

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
				title: "Sick fits",
				description: "A fullstack TypeScript Tanstack start application",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	beforeLoad: async () => {
		const user = await getCurrentUserFn()
		return {user}
	},

	shellComponent: RootDocument,
})

function LogoutButton() {
	const logout = useServerFn(logoutFn)
	return (
		<li>
			<button type="button" onClick={() => logout()}>
				logout
			</button>
		</li>
	)
}

function RootDocument({children}: {children: React.ReactNode}) {
	const {user} = Route.useRouteContext()

	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<QueryClientProvider client={queryClient}>
					<AuthProvider initialUser={user}>
						<header>
							<div className="mx-auto h-30 max-w-7xl border border-red-500">
								<Link to="/">
									<strong>Sick Fits</strong>
								</Link>
								<nav>
									<ul className="flex flex-wrap gap-2 capitalize">
										{user ? (
											<>
												<li>
													<LogoutButton />
												</li>
												<li>
													<Link to="/auth/profile">Profile</Link>
												</li>
											</>
										) : (
											<>
												<li>
													<Link to="/auth/login">login</Link>
												</li>
												<li>
													<Link to="/auth/signup">signup</Link>
												</li>
											</>
										)}
									</ul>
								</nav>
							</div>
						</header>

						<main className="flex min-h-[calc(100dvh-15rem)] flex-col">{children}</main>

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

						<footer>
							<div className="mx-auto h-30 max-w-7xl border border-red-500">
								<p>Copyright &copy; {new Date().getFullYear()}</p>
								<p>All rights reserved.</p>
							</div>
						</footer>
						<Scripts />
					</AuthProvider>
					<ReactQueryDevtools initialIsOpen={false} />
				</QueryClientProvider>
			</body>
		</html>
	)
}
