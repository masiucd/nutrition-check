import {TanStackDevtools} from "@tanstack/react-devtools"
import {createRootRoute, HeadContent, Link, Scripts} from "@tanstack/react-router"
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

	shellComponent: RootDocument,
})

function RootDocument({children}: {children: React.ReactNode}) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<header>
					<div className="mx-auto h-30 max-w-7xl border border-red-500">
						<Link to="/">
							<strong>Sick Fits</strong>
						</Link>
						<nav>
							<ul className="flex flex-wrap gap-2 capitalize">
								<li>
									<Link to="/login">login</Link>
								</li>
								<li>
									<Link to="/signup">signup</Link>
								</li>
								{/*<li>logout</li>*/}
								{/*<li>
									<Link to="/profile">profile</Link>
								</li>
								<li>
									<Link to="/settings">settings</Link>
								</li>
								<li>
									<Link to="/help">help</Link>
								</li>
								<li>
									<Link to="/about">about</Link>
								</li>
								<li>
									<Link to="/contact">contact</Link>
								</li>
								<li>
									<Link to="/feedback">feedback</Link>
								</li>*/}
							</ul>
						</nav>
					</div>
				</header>

				<main className="flex flex-col min-h-[calc(100dvh-15rem)]">{children}</main>
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
					<div className="h-30 mx-auto max-w-7xl border border-red-500">
						<p>Copyright &copy; {new Date().getFullYear()}</p>
						<p>All rights reserved.</p>
					</div>
				</footer>
				<Scripts />
			</body>
		</html>
	)
}
