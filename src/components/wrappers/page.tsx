import type {PropsWithChildren} from "react"
import {cn} from "@/lib/utils"

interface Props {
	className?: string
	fluid?: boolean
	column?: boolean
}

export function PageWrapper({children, className, fluid, column}: PropsWithChildren<Props>) {
	return (
		<div
			className={cn(
				"mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4",
				className,
				fluid ? "max-w-full" : null,
				column ? "flex-col" : null,
			)}
		>
			{children}
		</div>
	)
}
