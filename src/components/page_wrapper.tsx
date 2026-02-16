import type {PropsWithChildren} from "react"
import {cn} from "@/lib/utils"

interface Props {
	fluid?: boolean
	className?: string
}

export function PageWrapper(props: PropsWithChildren<Props>) {
	return (
		<section
			className={cn(
				"mx-auto flex w-full max-w-7xl flex-1",
				props.fluid ? "max-w-full" : null,
				props.className,
			)}
		>
			{props.children}
		</section>
	)
}
