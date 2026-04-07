import {render, screen} from "@testing-library/react"
import {describe, expect, it} from "vitest"
import {Blockquote, Heading, InlineCode, List, Table, Text} from "./typography"

describe("Heading", () => {
	it("renders an h1 when tag is h1", () => {
		render(<Heading tag="h1">Hello</Heading>)
		expect(screen.getByRole("heading", {level: 1, name: "Hello"})).toBeInTheDocument()
	})

	it("renders an h2 when tag is h2", () => {
		render(<Heading tag="h2">Hello</Heading>)
		expect(screen.getByRole("heading", {level: 2, name: "Hello"})).toBeInTheDocument()
	})

	it("renders an h3 when tag is h3", () => {
		render(<Heading tag="h3">Hello</Heading>)
		expect(screen.getByRole("heading", {level: 3, name: "Hello"})).toBeInTheDocument()
	})

	it("renders an h4 when tag is h4", () => {
		render(<Heading tag="h4">Hello</Heading>)
		expect(screen.getByRole("heading", {level: 4, name: "Hello"})).toBeInTheDocument()
	})

	it("defaults to h2 when no tag is provided", () => {
		render(<Heading>Default heading</Heading>)
		expect(screen.getByRole("heading", {level: 2, name: "Default heading"})).toBeInTheDocument()
	})
})

describe("Text", () => {
	it("renders a paragraph by default", () => {
		render(<Text>paragraph text</Text>)
		expect(screen.getByText("paragraph text").tagName).toBe("P")
	})

	it("renders a paragraph when size is p", () => {
		render(<Text size="p">paragraph text</Text>)
		expect(screen.getByText("paragraph text").tagName).toBe("P")
	})

	it("renders a small element when size is small", () => {
		render(<Text size="small">small text</Text>)
		expect(screen.getByText("small text").tagName).toBe("SMALL")
	})

	it("renders a span when size is large", () => {
		render(<Text size="large">large text</Text>)
		expect(screen.getByText("large text").tagName).toBe("SPAN")
	})
})

describe("InlineCode", () => {
	it("renders a code element", () => {
		render(<InlineCode>const x = 1</InlineCode>)
		expect(screen.getByText("const x = 1").tagName).toBe("CODE")
	})
})

describe("Blockquote", () => {
	it("renders a blockquote element", () => {
		render(<Blockquote>A quote</Blockquote>)
		expect(screen.getByText("A quote").tagName).toBe("BLOCKQUOTE")
	})
})

describe("Table", () => {
	it("renders a table element", () => {
		const {container} = render(
			<Table>
				<tbody>
					<tr>
						<td>cell</td>
					</tr>
				</tbody>
			</Table>,
		)
		expect(container.querySelector("table")).toBeInTheDocument()
	})
})

describe("List", () => {
	it("renders a ul element", () => {
		render(
			<List>
				<li>item</li>
			</List>,
		)
		expect(screen.getByRole("list")).toBeInTheDocument()
	})

	it("renders list items", () => {
		render(
			<List>
				<li>item 1</li>
				<li>item 2</li>
			</List>,
		)
		expect(screen.getAllByRole("listitem")).toHaveLength(2)
	})
})
