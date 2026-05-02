import {createFileRoute, useRouter} from "@tanstack/react-router"
import {Calendar, Mail, ShieldCheck, User as UserIcon} from "lucide-react"
import {useState} from "react"
import {PageSkeleton} from "@/components/common/page-skeleton"
import {TabNav} from "@/components/profile/tab-nav"
import {TabPanels} from "@/components/profile/tab-panels"
import type {Tab} from "@/components/profile/types"
import {formatDate, getInitials} from "@/components/profile/utils"
import {Card, CardContent} from "@/components/ui/card"
import {PageWrapper} from "@/components/wrappers/page"
import type {Food, User, UserData} from "@/lib/schemas"
import {getCurrentUserFn, getUserProfileFn, getUsersFoodItemsFn} from "@/server/functions/user"

export const Route = createFileRoute("/auth/_authed/profile")({
	component: RouteComponent,
	loader: async () => {
		const [userResult, profileResult, foodItemsResult] = await Promise.allSettled([
			getCurrentUserFn(),
			getUserProfileFn(),
			getUsersFoodItemsFn(),
		])

		const user = userResult.status === "fulfilled" ? userResult.value : null
		const profileRes = profileResult.status === "fulfilled" ? profileResult.value : null
		const foodItems = foodItemsResult.status === "fulfilled" ? foodItemsResult.value : null

		return {user, userData: profileRes?.data ?? null, foodItems: foodItems?.data ?? []}
	},
	pendingComponent: PageSkeleton,
})

function RouteComponent() {
	const {user: fullUser, userData: initialUserData, foodItems} = Route.useLoaderData()
	const ctx = Route.useRouteContext()
	const [activeTab, setActiveTab] = useState<Tab>("info")
	const [currentEmail, setCurrentEmail] = useState(ctx.user.email)
	const [userData, setUserData] = useState<UserData | null>(initialUserData)
	const router = useRouter()

	const handleEmailUpdate = (newEmail: string) => {
		setCurrentEmail(newEmail)
		router.invalidate()
	}

	if (!fullUser) {
		return (
			<PageWrapper>
				<p className="text-muted-foreground">Could not load profile.</p>
			</PageWrapper>
		)
	}

	const firstName = userData?.first_name ?? undefined
	const lastName = userData?.last_name ?? undefined
	const displayName = firstName || lastName ? [firstName, lastName].filter(Boolean).join(" ") : null
	const initials = getInitials(currentEmail, firstName, lastName)
	const memberSince = formatDate(fullUser.created_at)

	return (
		<PageWrapper className="items-start py-10">
			<div className="flex w-full max-w-2xl flex-col gap-6">
				{/* ── Profile header card ── */}
				<Card className="overflow-hidden">
					<div className="h-24 bg-linear-to-r from-primary/20 via-primary/10 to-transparent" />
					<CardContent className="-mt-10 flex flex-col items-center gap-4 pb-6 sm:flex-row sm:items-end sm:gap-6">
						{/* Avatar */}
						<div className="flex size-20 shrink-0 items-center justify-center rounded-full border-4 border-background bg-primary font-bold text-primary-foreground text-xl shadow-md">
							{initials}
						</div>

						{/* Meta */}
						<div className="flex flex-1 flex-col items-center gap-0.5 sm:items-start">
							<h1 className="font-bold text-xl tracking-tight">{displayName ?? currentEmail}</h1>
							{displayName && <p className="text-muted-foreground text-sm">{currentEmail}</p>}
							<div className="mt-1 flex items-center gap-1.5 text-muted-foreground text-sm">
								<Calendar className="size-3.5" />
								<span>Member since {memberSince}</span>
							</div>
						</div>

						{/* Verified badge */}
						<div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700 text-xs dark:bg-emerald-950/30 dark:text-emerald-400">
							<ShieldCheck className="size-3.5" />
							Verified account
						</div>
					</CardContent>
				</Card>

				<StatPills fullUser={fullUser} currentEmail={currentEmail} />

				{/* ── Settings tabs ── */}
				<Tabs
					activeTab={activeTab}
					setTab={setActiveTab}
					currentEmail={currentEmail}
					handleEmailUpdate={handleEmailUpdate}
					userData={userData}
					setUserData={setUserData}
					foodItems={foodItems ?? []}
				/>
			</div>
		</PageWrapper>
	)
}

interface StatPillsProps {
	fullUser: User
	currentEmail: string
}

function StatPills({fullUser, currentEmail}: StatPillsProps) {
	return (
		<div className="grid grid-cols-2 gap-3">
			<div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
				<div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
					<UserIcon className="size-4 text-primary" />
				</div>
				<div>
					<p className="text-muted-foreground text-xs">Account ID</p>
					<p className="font-semibold text-sm">#{fullUser.id}</p>
				</div>
			</div>
			<div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
				<div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
					<Mail className="size-4 text-primary" />
				</div>
				<div className="min-w-0">
					<p className="text-muted-foreground text-xs">Email</p>
					<p className="truncate font-semibold text-sm">{currentEmail}</p>
				</div>
			</div>
		</div>
	)
}

interface TabsProps {
	activeTab: Tab
	setTab: (tab: Tab) => void
	currentEmail: string
	handleEmailUpdate: (email: string) => void
	userData: UserData | null
	setUserData: React.Dispatch<React.SetStateAction<UserData | null>>
	foodItems: Food[]
}

function Tabs({
	activeTab,
	setTab,
	currentEmail,
	handleEmailUpdate,
	userData,
	setUserData,
	foodItems,
}: TabsProps) {
	return (
		<div>
			<TabNav activeTab={activeTab} setTab={(tab: Tab) => setTab(tab)} />
			<TabPanels
				activeTab={activeTab}
				currentEmail={currentEmail}
				handleEmailUpdate={handleEmailUpdate}
				userData={userData}
				setUserData={setUserData}
				foodItems={foodItems ?? []}
			/>
		</div>
	)
}
