import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { dbUrl } from "./src/db/connect";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/db/schema/index.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: dbUrl,
	},
});
