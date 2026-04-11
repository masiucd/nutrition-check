import type {VariantProps} from "class-variance-authority"
import {cva} from "class-variance-authority"
import type * as React from "react"

import {cn} from "@/lib/utils"

const badgeVariants = cva(
	"inline-flex items-center rounded-md border border-transparent px-2 py-0.5 font-medium text-xs transition-colors",
	{
		variants: {
			variant: {
				// ── Neutral / system ──────────────────────────────────────────
				default: "bg-primary text-primary-foreground",
				secondary: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
				outline: "border-border bg-transparent text-foreground",

				// ── Semantic greens ───────────────────────────────────────────
				/** Whole food, vegetables — clean & natural */
				success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
				/** Slightly lighter green — snacks, fresh produce */
				lime: "bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-300",

				// ── Warm / caution tones (no red) ─────────────────────────────
				/** Semi-processed, nuts & seeds — golden */
				warning: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
				/** Processed foods — warm orange, signals caution without alarm */
				orange: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
				/** Meat — earthy terracotta */
				terracotta: "bg-orange-200 text-orange-900 dark:bg-orange-900/40 dark:text-orange-300",

				// ── Cool tones ────────────────────────────────────────────────
				/** Dairy — calm sky blue */
				info: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
				/** Seafood — teal / ocean */
				teal: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
				/** Grains — cool slate-blue */
				indigo: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",

				// ── Purple / pink ─────────────────────────────────────────────
				/** Legumes — deep violet */
				purple: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
				/** Fruit — soft rose-pink */
				pink: "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
)

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({className, variant, ...props}: BadgeProps) {
	return <div className={cn(badgeVariants({variant}), className)} {...props} />
}

export {Badge, badgeVariants}
