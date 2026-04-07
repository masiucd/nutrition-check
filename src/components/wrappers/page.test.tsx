import {render, screen} from "@testing-library/react"
import {describe, expect, it} from "vitest"
import {PageWrapper} from "./page"

describe("PageWrapper", () => {
	it("renders its children", () => {
		render(<PageWrapper>page content</PageWrapper>)
		expect(screen.getByText("page content")).toBeInTheDocument()
	})

	it("renders a section element", () => {
		const {container} = render(<PageWrapper>content</PageWrapper>)
		expect(container.querySelector("section")).toBeInTheDocument()
	})

	it("applies extra className", () => {
		const {container} = render(<PageWrapper className="extra">content</PageWrapper>)
		expect(container.querySelector("section")).toHaveClass("extra")
	})

	it("applies max-w-full when fluid is true", () => {
		const {container} = render(<PageWrapper fluid>content</PageWrapper>)
		expect(container.querySelector("section")).toHaveClass("max-w-full")
	})
})
