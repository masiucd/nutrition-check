import {fireEvent, render, screen} from "@testing-library/react"
import {describe, expect, it, vi} from "vitest"
import {Button} from "./button"

describe("Button", () => {
	it("renders its children", () => {
		render(<Button>Click me</Button>)
		expect(screen.getByRole("button", {name: "Click me"})).toBeInTheDocument()
	})

	it("has the correct data-slot attribute", () => {
		render(<Button>Click me</Button>)
		expect(screen.getByRole("button")).toHaveAttribute("data-slot", "button")
	})

	it("calls onClick when clicked", () => {
		const onClick = vi.fn()
		render(<Button onClick={onClick}>Click me</Button>)
		fireEvent.click(screen.getByRole("button"))
		expect(onClick).toHaveBeenCalledOnce()
	})

	it("is disabled when the disabled prop is set", () => {
		render(<Button disabled>Click me</Button>)
		expect(screen.getByRole("button")).toBeDisabled()
	})

	it("does not call onClick when disabled", () => {
		const onClick = vi.fn()
		render(
			<Button disabled onClick={onClick}>
				Click me
			</Button>,
		)
		fireEvent.click(screen.getByRole("button"))
		expect(onClick).not.toHaveBeenCalled()
	})

	it("applies the variant as a data attribute", () => {
		render(<Button variant="destructive">Delete</Button>)
		expect(screen.getByRole("button")).toHaveAttribute("data-variant", "destructive")
	})

	it("applies the size as a data attribute", () => {
		render(<Button size="sm">Small</Button>)
		expect(screen.getByRole("button")).toHaveAttribute("data-size", "sm")
	})

	it("forwards extra props to the underlying element", () => {
		render(<Button aria-label="submit form">Submit</Button>)
		expect(screen.getByRole("button", {name: "submit form"})).toBeInTheDocument()
	})
})
