import {cn} from "@/lib/utils"
import type {AlertState} from "./types"

export function Alert({state}: {state: AlertState}) {
	if (!state) return null
	return (
		<p
			role="alert"
			className={cn(
				"rounded-lg px-3 py-2 text-sm",
				state.type === "success"
					? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
					: "bg-destructive/10 text-destructive",
			)}
		>
			{state.message}
		</p>
	)
}
