import {fireEvent, render, screen} from "@testing-library/react"
import {describe, expect, it, vi} from "vitest"
import {Input} from "./input"

describe("Input", () => {
	it("renders an input element", () => {
		render(<Input />)
		expect(screen.getByRole("textbox")).toBeInTheDocument()
	})

	it("has the correct data-slot attribute", () => {
		render(<Input />)
		expect(screen.getByRole("textbox")).toHaveAttribute("data-slot", "input")
	})

	it("renders with the given type", () => {
		render(<Input type="email" />)
		expect(screen.getByRole("textbox")).toHaveAttribute("type", "email")
	})

	it("renders with the given placeholder", () => {
		render(<Input placeholder="Enter your name" />)
		expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument()
	})

	it("calls onChange when the value changes", () => {
		const onChange = vi.fn()
		render(<Input onChange={onChange} />)
		fireEvent.change(screen.getByRole("textbox"), {target: {value: "hello"}})
		expect(onChange).toHaveBeenCalledOnce()
	})

	it("is disabled when the disabled prop is set", () => {
		render(<Input disabled />)
		expect(screen.getByRole("textbox")).toBeDisabled()
	})

	it("forwards extra props to the underlying element", () => {
		render(<Input aria-label="search" />)
		expect(screen.getByRole("textbox", {name: "search"})).toBeInTheDocument()
	})
})
