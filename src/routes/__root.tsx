import {TanStackDevtools} from "@tanstack/react-devtools"
import {createRootRoute, HeadContent, Scripts} from "@tanstack/react-router"
import {TanStackRouterDevtoolsPanel} from "@tanstack/react-router-devtools"
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
	beforeLoad: async ({context}) => {
		// TODO Set  context with auth
		console.log("Hello, World!")
	},
	notFoundComponent: props => {
		console.log("not found props --> ", props)
		return <p>...Not Found</p>
	},
})

function RootDocument({children}: {children: React.ReactNode}) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
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
