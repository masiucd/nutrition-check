import {useRouter} from "@tanstack/react-router"
import {useServerFn} from "@tanstack/react-start"
import {Loader2} from "lucide-react"
import {useState} from "react"
import {Button} from "@/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import type {FoodItem} from "@/lib/schemas"
import {deleteFoodItem} from "@/server/functions/food"
import {HttpStatusCode} from "@/server/utils/status_code"

interface Props {
	item: FoodItem | null

	onOpenChange: (open: boolean) => void
}

export function DeleteFoodItemDialog({item, onOpenChange}: Props) {
	if (!item) return null
	return <DeleteDialogContent key={item.id} item={item} onOpenChange={onOpenChange} />
}

function DeleteDialogContent({
	item,
	onOpenChange,
}: {
	item: FoodItem
	onOpenChange: (open: boolean) => void
}) {
	const [isDeleting, setIsDeleting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const router = useRouter()
	const deleteFood = useServerFn(deleteFoodItem)

	async function handleDelete() {
		setIsDeleting(true)
		setError(null)

		const response = await deleteFood({data: {id: item.id}})

		if (response.status === HttpStatusCode.OK) {
			onOpenChange(false)
			await router.invalidate()
		} else {
			setError(response.error ?? "Failed to delete food item.")
			setIsDeleting(false)
		}
	}

	return (
		<Dialog open onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Delete food item</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete{" "}
						<span className="font-semibold text-foreground">{item.food_name}</span>? This action
						cannot be undone.
					</DialogDescription>
				</DialogHeader>

				{error && (
					<p
						className="rounded-lg bg-destructive/10 px-3 py-2 text-destructive text-sm"
						role="alert"
					>
						{error}
					</p>
				)}

				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="outline" disabled={isDeleting}>
							Cancel
						</Button>
					</DialogClose>
					<Button type="button" variant="destructive" disabled={isDeleting} onClick={handleDelete}>
						{isDeleting ? (
							<>
								<Loader2 size={16} className="animate-spin" />
								Deleting…
							</>
						) : (
							"Delete"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
