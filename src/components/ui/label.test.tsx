import {render, screen} from "@testing-library/react"
import {describe, expect, it} from "vitest"
import {Label} from "./label"

describe("Label", () => {
	it("renders its children", () => {
		render(<Label>Email address</Label>)
		expect(screen.getByText("Email address")).toBeInTheDocument()
	})

	it("has the correct data-slot attribute", () => {
		render(<Label>Username</Label>)
		expect(screen.getByText("Username")).toHaveAttribute("data-slot", "label")
	})

	it("associates with an input via htmlFor", () => {
		render(
			<div>
				<Label htmlFor="email">Email</Label>
				<input id="email" type="email" />
			</div>,
		)
		expect(screen.getByLabelText("Email")).toBeInTheDocument()
	})

	it("forwards extra props to the underlying element", () => {
		render(<Label className="custom-class">Label text</Label>)
		expect(screen.getByText("Label text")).toHaveClass("custom-class")
	})
})
