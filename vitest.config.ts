import viteReact from "@vitejs/plugin-react"
import {defineConfig} from "vitest/config"
import viteTsConfigPaths from "vite-tsconfig-paths"

export default defineConfig({
	plugins: [viteReact(), viteTsConfigPaths()],
	test: {
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
	},
})
