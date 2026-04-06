import type {PropsWithChildren} from "react"

export function PageWrapper({children}: PropsWithChildren) {
	return <section className="flex items-center justify-center bg-muted/40 px-4">{children}</section>
}
