import {createFileRoute, redirect} from "@tanstack/react-router"
import {useState} from "react"
import {PageWrapper} from "@/components/page_wrapper"
import {Heading} from "@/components/typography"
import {Button} from "@/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"

export const Route = createFileRoute("/auth/profile")({
	component: RouteComponent,
	beforeLoad: async ({context}) => {
		const isAuthenticated = !!context.user
		if (!isAuthenticated) {
			// redirect to login page
			throw redirect({
				to: "/auth/login",
				// Save the current location in search params so you can redirect back after login:
				// search: {redirect: location.href},
			})
		}
	},
})

function RouteComponent() {
	const ctx = Route.useRouteContext()
	const [isEditing, setIsEditing] = useState(false)
	if (!ctx.user) return null

	return (
		<PageWrapper>
			<div className="flex flex-col">
				<Heading tag="h1">Hello {ctx.user.username} Profile page</Heading>

				<Button variant={isEditing ? "secondary" : "default"} onClick={() => setIsEditing(p => !p)}>
					Edit profile
				</Button>
				<form>
					<fieldset
						disabled={!isEditing}
						className="flex flex-col gap-2 rounded-md border border-foreground p-2 shadow-md"
					>
						<legend className="capitalize">{ctx.user.username}</legend>
						<div className="flex flex-col gap-2">
							<Label htmlFor="username">Username</Label>
							<Input id="username" name="username" defaultValue={ctx.user.username} />
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" name="email" defaultValue={ctx.user.email} />
						</div>
						<div>
							<Button type="submit">Save</Button>
						</div>
					</fieldset>
				</form>
				<EditPasswordDialog />
				<MyOrders />
				<SupportDialog />
			</div>
		</PageWrapper>
	)
}

// Things the user should be able to do on their profile page
// - Edit their profile
// - View their orders
// - Get support
//

export function EditPasswordDialog() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="link">Edit Password</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit password</DialogTitle>
					<DialogDescription>Anyone who has this link will be able to view this.</DialogDescription>
				</DialogHeader>
				<form>
					<fieldset>
						<div>
							<Label htmlFor="password">New Password</Label>
							<Input id="password" name="password" type="password" />
						</div>
						<div>
							<Button type="submit">Save</Button>
						</div>
					</fieldset>
				</form>
				<DialogFooter className="sm:justify-start">
					<DialogClose asChild>
						<Button type="button">Close</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

function MyOrders() {
	return (
		<div>
			<h2>My Orders</h2>
			<ul>
				<li>Order 1</li>
				<li>Order 2</li>
				<li>Order 3</li>
				<li>Ord...</li>
			</ul>
			<Button variant="link">View All Orders</Button>
		</div>
	)
}

export function SupportDialog() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="link">Get Support</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Get Support</DialogTitle>
					<DialogDescription>Please enter your support request below.</DialogDescription>
				</DialogHeader>
				<form>
					<fieldset>
						<div>
							<Label htmlFor="support">Support Request</Label>
							<Input id="support" name="support" type="text" />
						</div>
						<div>
							<Button type="submit">Submit</Button>
						</div>
					</fieldset>
				</form>
				<DialogFooter className="sm:justify-start">
					<DialogClose asChild>
						<Button type="button">Close</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
