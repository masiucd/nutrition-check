import {Skeleton} from "@/components/ui/skeleton"
import {PageWrapper} from "@/components/wrappers/page"

/**
 * Generic full-page skeleton loader.
 * Drop it straight into any route's `pendingComponent`:
 *
 * ```ts
 * pendingComponent: PageSkeleton
 * ```
 */
export function PageSkeleton() {
	return (
		<PageWrapper className="items-start py-10">
			<div className="flex w-full max-w-2xl flex-col gap-6">
				{/* ── Hero card ── */}
				<div className="overflow-hidden rounded-xl border bg-card shadow-sm">
					{/* Gradient banner */}
					<Skeleton className="h-24 w-full rounded-none" />

					{/* Avatar + meta */}
					<div className="-mt-10 flex flex-col items-center gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:gap-6">
						<Skeleton className="size-20 shrink-0 rounded-full border-4 border-background" />

						<div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
							<Skeleton className="h-5 w-40 rounded-md" />
							<Skeleton className="h-4 w-28 rounded-md" />
							<Skeleton className="mt-1 h-3.5 w-36 rounded-md" />
						</div>

						{/* Badge placeholder */}
						<Skeleton className="h-6 w-28 rounded-full" />
					</div>
				</div>

				{/* ── Stat pills ── */}
				<div className="grid grid-cols-2 gap-3">
					{[0, 1].map(i => (
						<div
							key={i}
							className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm"
						>
							<Skeleton className="size-9 shrink-0 rounded-lg" />
							<div className="flex flex-col gap-1.5">
								<Skeleton className="h-3 w-16 rounded" />
								<Skeleton className="h-4 w-24 rounded" />
							</div>
						</div>
					))}
				</div>

				{/* ── Tab nav ── */}
				<div className="flex gap-2 border-b pb-1">
					{[80, 60, 96].map(w => (
						<Skeleton key={w} className="h-8 rounded-md" style={{width: w}} />
					))}
				</div>

				{/* ── Content block ── */}
				<div className="flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm">
					<Skeleton className="h-5 w-32 rounded-md" />
					<div className="flex flex-col gap-3">
						{[100, 90, 75].map(pct => (
							<Skeleton key={pct} className="h-4 rounded" style={{width: `${pct}%`}} />
						))}
					</div>

					<div className="mt-2 grid grid-cols-2 gap-3">
						{[0, 1].map(i => (
							<div key={i} className="flex flex-col gap-2 rounded-lg border p-4">
								<Skeleton className="h-3.5 w-20 rounded" />
								<Skeleton className="h-4 w-28 rounded" />
							</div>
						))}
					</div>

					<Skeleton className="mt-2 h-9 w-28 rounded-md" />
				</div>
			</div>
		</PageWrapper>
	)
}
