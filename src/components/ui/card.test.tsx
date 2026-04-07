import {render, screen} from "@testing-library/react"
import {describe, expect, it} from "vitest"
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./card"

describe("Card", () => {
	it("renders its children", () => {
		render(<Card>card body</Card>)
		expect(screen.getByText("card body")).toBeInTheDocument()
	})

	it("has the correct data-slot attribute", () => {
		render(<Card>content</Card>)
		expect(screen.getByText("content").closest("[data-slot='card']")).toBeInTheDocument()
	})

	it("applies the default size data attribute", () => {
		const {container} = render(<Card>content</Card>)
		expect(container.firstChild).toHaveAttribute("data-size", "default")
	})

	it("applies the sm size data attribute", () => {
		const {container} = render(<Card size="sm">content</Card>)
		expect(container.firstChild).toHaveAttribute("data-size", "sm")
	})
})

describe("CardHeader", () => {
	it("renders its children", () => {
		render(<CardHeader>header content</CardHeader>)
		expect(screen.getByText("header content")).toBeInTheDocument()
	})

	it("has the correct data-slot attribute", () => {
		render(<CardHeader>header content</CardHeader>)
		expect(
			screen.getByText("header content").closest("[data-slot='card-header']"),
		).toBeInTheDocument()
	})
})

describe("CardTitle", () => {
	it("renders its children", () => {
		render(<CardTitle>My Title</CardTitle>)
		expect(screen.getByText("My Title")).toBeInTheDocument()
	})

	it("has the correct data-slot attribute", () => {
		render(<CardTitle>title</CardTitle>)
		expect(screen.getByText("title").closest("[data-slot='card-title']")).toBeInTheDocument()
	})
})

describe("CardDescription", () => {
	it("renders its children", () => {
		render(<CardDescription>A description</CardDescription>)
		expect(screen.getByText("A description")).toBeInTheDocument()
	})
})

describe("CardContent", () => {
	it("renders its children", () => {
		render(<CardContent>main content</CardContent>)
		expect(screen.getByText("main content")).toBeInTheDocument()
	})

	it("has the correct data-slot attribute", () => {
		render(<CardContent>content</CardContent>)
		expect(screen.getByText("content").closest("[data-slot='card-content']")).toBeInTheDocument()
	})
})

describe("CardAction", () => {
	it("renders its children", () => {
		render(<CardAction>action</CardAction>)
		expect(screen.getByText("action")).toBeInTheDocument()
	})
})

describe("CardFooter", () => {
	it("renders its children", () => {
		render(<CardFooter>footer content</CardFooter>)
		expect(screen.getByText("footer content")).toBeInTheDocument()
	})

	it("has the correct data-slot attribute", () => {
		render(<CardFooter>footer</CardFooter>)
		expect(screen.getByText("footer").closest("[data-slot='card-footer']")).toBeInTheDocument()
	})
})
