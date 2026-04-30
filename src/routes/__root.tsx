import {TanStackDevtools} from "@tanstack/react-devtools"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import {ReactQueryDevtools} from "@tanstack/react-query-devtools"
import {createRootRoute, HeadContent, Scripts} from "@tanstack/react-router"
import {TanStackRouterDevtoolsPanel} from "@tanstack/react-router-devtools"
import type {PropsWithChildren} from "react"
import {Footer} from "@/components/common/footer"
import {Header} from "@/components/common/header"
import {NotFound} from "@/components/common/not-found"
import {appData} from "@/config"
import type {ContextUser} from "@/lib/schemas"
import {getCurrentUserFn} from "@/server/functions/user"
import appCss from "../styles.css?url"

const queryClient = new QueryClient()

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{charSet: "utf-8"},
			{name: "viewport", content: "width=device-width, initial-scale=1"},
			{title: appData.title, description: appData.description},
		],
		links: [{rel: "stylesheet", href: appCss}],
	}),
	shellComponent: RootDocument,
	beforeLoad: async () => {
		const user = await getCurrentUserFn()
		if (!user) return {user: null}
		return {
			user: {
				id: user.id,
				email: user.email,
				is_admin: user.is_admin,
				first_name: user.first_name,
				last_name: user.last_name,
			} satisfies ContextUser,
		}
	},
	notFoundComponent: props => <NotFound {...props} />,
})

function RootDocument({children}: PropsWithChildren) {
	const {user} = Route.useRouteContext()

	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<QueryClientProvider client={queryClient}>
					<Header user={user} />
					<main className="flex min-h-[calc(100svh-15rem)] flex-col">{children}</main>
					<Footer user={user} />
					<ReactQueryDevtools initialIsOpen={false} />
				</QueryClientProvider>
				<TanStackDevtools
					config={{position: "bottom-right"}}
					plugins={[{name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel />}]}
				/>
				<Scripts />
			</body>
		</html>
	)
}
