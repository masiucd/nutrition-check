import {render, screen} from "@testing-library/react"
import {describe, expect, it} from "vitest"
import {PageWrapper} from "./page"

describe("PageWrapper", () => {
	it("renders its children", () => {
		render(<PageWrapper>page content</PageWrapper>)
		expect(screen.getByText("page content")).toBeInTheDocument()
	})
	it("When fluid is true, applies max-w-full", () => {
		const {container} = render(<PageWrapper fluid>content</PageWrapper>)
		expect(container.querySelector("div")).toHaveClass("max-w-full")
	})

	it("When column is true, applies flex-col", () => {
		const {container} = render(<PageWrapper column>content</PageWrapper>)
		expect(container.querySelector("div")).toHaveClass("flex-col")
	})

	it("When className is provided, applies it", () => {
		const {container} = render(<PageWrapper className="custom-class">content</PageWrapper>)
		expect(container.querySelector("div")).toHaveClass("custom-class")
	})
})
