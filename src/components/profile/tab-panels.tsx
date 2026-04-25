import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import type {Food, UserData} from "@/lib/schemas"
import {ChangePasswordForm} from "./change-password-form"
import {EditEmailForm} from "./edit-email-form"
import {FoodItemsList} from "./food-items-list"
import {PersonalDetailsForm} from "./personal-details-form"
import type {Tab} from "./types"

export function TabPanels({
	activeTab,
	currentEmail,
	handleEmailUpdate,
	userData,
	setUserData,
	foodItems,
}: {
	activeTab: Tab
	currentEmail: string
	handleEmailUpdate: (newEmail: string) => void
	userData: UserData | null
	setUserData: (data: UserData | null) => void
	foodItems: Food[]
}) {
	return (
		<>
			{activeTab === "info" && (
				<Card className="shadow-sm">
					<CardHeader>
						<CardTitle className="text-lg">Account information</CardTitle>
						<CardDescription>Update the email address for your account</CardDescription>
					</CardHeader>
					<EditEmailForm currentEmail={currentEmail} onSuccess={handleEmailUpdate} />
				</Card>
			)}

			{activeTab === "personal" && (
				<Card className="shadow-sm">
					<CardHeader>
						<CardTitle className="text-lg">Personal details</CardTitle>
						<CardDescription>
							Tell us a bit about yourself — this helps personalise your experience
						</CardDescription>
					</CardHeader>
					<PersonalDetailsForm initialData={userData} onSuccess={setUserData} />
				</Card>
			)}

			{activeTab === "security" && (
				<Card className="shadow-sm">
					<CardHeader>
						<CardTitle className="text-lg">Change password</CardTitle>
						<CardDescription>Choose a strong password at least 6 characters long</CardDescription>
					</CardHeader>
					<ChangePasswordForm />
				</Card>
			)}

			{activeTab === "foods" && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Foods</CardTitle>
						<CardDescription>
							Manage your food items{" "}
							<span className="font-s font-semibold text-muted-foreground text-sm">
								({foodItems.length})
							</span>
						</CardDescription>
					</CardHeader>
					<FoodItemsList foodItems={foodItems} />
				</Card>
			)}
		</>
	)
}
