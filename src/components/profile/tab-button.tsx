import type {PropsWithChildren} from "react"
import {cn} from "@/lib/utils"

export function TabButton({
	active,
	onClick,
	children,
}: PropsWithChildren<{active: boolean; onClick: () => void}>) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-sm transition-colors",
				active
					? "bg-primary text-primary-foreground shadow-sm"
					: "text-muted-foreground hover:bg-muted hover:text-foreground",
			)}
		>
			{children}
		</button>
	)
}

export function SectionDivider({label}: {label: string}) {
	return (
		<div className="flex items-center gap-3 pt-2">
			<span className="shrink-0 font-semibold text-muted-foreground text-xs uppercase tracking-widest">
				{label}
			</span>
			<div className="h-px flex-1 bg-border" />
		</div>
	)
}
