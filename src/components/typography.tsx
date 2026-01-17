import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export function Heading({
	children,
	size,
	tag,
	className,
}: PropsWithChildren<{
	size?: "h1" | "h2" | "h3" | "h4";
	tag?: "h1" | "h2" | "h3" | "h4";
	className?: string;
}>) {
	const sizeClass = getSizeClass(size, tag);
	switch (tag) {
		case "h1": {
			return (
				<TypographyH1 className={cn(className, sizeClass)}>
					{children}
				</TypographyH1>
			);
		}
		case "h2": {
			return (
				<TypographyH2 className={cn(className, sizeClass)}>
					{children}
				</TypographyH2>
			);
		}
		case "h3": {
			return (
				<TypographyH3 className={cn(className, sizeClass)}>
					{children}
				</TypographyH3>
			);
		}
		case "h4": {
			return (
				<TypographyH4 className={cn(className, sizeClass)}>
					{children}
				</TypographyH4>
			);
		}
		default: {
			return (
				<TypographyH2 className={cn(className, sizeClass)}>
					{children}
				</TypographyH2>
			);
		}
	}
}

export function Text({
	children,
	size,
	tag,
	className,
}: PropsWithChildren<{
	size?: "p" | "lead" | "large" | "small" | "muted";
	tag?: "p" | "lead" | "large" | "small" | "muted";
	className?: string;
}>) {
	const sizeClass = getSizeClass(size, tag);
	switch (size) {
		case "p":
			return (
				<TypographyP className={cn(className, sizeClass)}>
					{children}
				</TypographyP>
			);
		case "lead":
			return (
				<TypographyLead className={cn(className, sizeClass)}>
					{children}
				</TypographyLead>
			);
		case "large":
			return (
				<TypographyLarge className={cn(className, sizeClass)}>
					{children}
				</TypographyLarge>
			);
		case "small":
			return (
				<TypographySmall className={cn(className, sizeClass)}>
					{children}
				</TypographySmall>
			);
		case "muted":
			return (
				<TypographyMuted className={cn(className, sizeClass)}>
					{children}
				</TypographyMuted>
			);
		default:
			return (
				<TypographyP className={cn(className, sizeClass)}>
					{children}
				</TypographyP>
			);
	}
}

export function InlineCode({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) {
	return (
		<code
			className={cn(
				"relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-sm",
				className,
			)}
		>
			{children}
		</code>
	);
}

export function Blockquote({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) {
	return (
		<blockquote className={cn("mt-6 border-l-2 pl-6 italic", className)}>
			{children}
		</blockquote>
	);
}

export function Table({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) {
	return (
		<div className={cn("my-6 w-full overflow-y-auto", className)}>
			<table className="w-full">{children}</table>
		</div>
	);
}

export function List({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) {
	return (
		<ul className={cn("my-6 ml-6 list-none [&>li]:mt-2", className)}>
			{children}
		</ul>
	);
}

function TypographyH1({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) {
	return (
		<h1
			className={cn(
				"scroll-m-20 text-balance font-extrabold text-4xl tracking-tight",
				className,
			)}
		>
			{children}
		</h1>
	);
}

function TypographyH2({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) {
	return (
		<h2
			className={cn(
				"scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight first:mt-0",
				className,
			)}
		>
			{children}
		</h2>
	);
}

function TypographyH3({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) {
	return (
		<h3
			className={cn(
				"scroll-m-20 font-semibold text-2xl tracking-tight",
				className,
			)}
		>
			{children}
		</h3>
	);
}

function TypographyH4({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) {
	return (
		<h4
			className={cn(
				"scroll-m-20 font-semibold text-xl tracking-tight",
				className,
			)}
		>
			{children}
		</h4>
	);
}

function TypographyP({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) {
	return (
		<p className={cn("not-first:mt-6 leading-7", className)}>{children}</p>
	);
}

function TypographyLead({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) {
	return (
		<p className={cn("text-muted-foreground text-xl", className)}>{children}</p>
	);
}

function TypographyLarge({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) {
	return (
		<span className={cn("block font-semibold text-lg", className)}>
			{children}
		</span>
	);
}

function TypographySmall({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) {
	return (
		<small className={cn("font-medium text-sm leading-none", className)}>
			{children}
		</small>
	);
}

function TypographyMuted({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) {
	return (
		<p className={cn("text-muted-foreground text-sm", className)}>{children}</p>
	);
}

function getSizeClass(
	size?: "h1" | "h2" | "h3" | "h4" | "p" | "lead" | "large" | "small" | "muted",
	tag:
		| "h1"
		| "h2"
		| "h3"
		| "h4"
		| "p"
		| "lead"
		| "large"
		| "small"
		| "muted" = "h1",
) {
	switch (size) {
		case "h1":
			return "text-4xl";
		case "h2":
			return "text-3xl";
		case "h3":
			return "text-2xl";
		case "h4":
			return "text-xl";
		case "p":
			return "text-base";
		case "lead":
			return "text-xl";
		case "large":
			return "text-lg";
		case "small":
			return "text-sm";
		case "muted":
			return "text-sm text-muted-foreground";
		default:
			return defaultSize(tag);
	}
}

function defaultSize(
	tag: "h1" | "h2" | "h3" | "h4" | "p" | "lead" | "large" | "small" | "muted",
) {
	switch (tag) {
		case "h1":
			return "text-4xl";
		case "h2":
			return "text-3xl";
		case "h3":
			return "text-2xl";
		case "h4":
			return "text-xl";
		case "p":
			return "text-base";
		case "lead":
			return "text-xl";
		case "large":
			return "text-lg";
		case "small":
			return "text-sm";
		case "muted":
			return "text-sm text-muted-foreground";
		default:
			return "text-base";
	}
}
