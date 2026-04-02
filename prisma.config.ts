import "dotenv/config"
import { defineConfig } from "prisma/config"

const {
	DB_USER = "",
	DB_PASSWORD = "",
	DB_HOST = "localhost",
	DB_PORT = "5432",
	DB_NAME = "postgres",
} = process.env

if (!DB_USER || !DB_PASSWORD || !DB_NAME) {
	throw new Error(
		"Missing required database environment variables (DB_USER, DB_PASSWORD, DB_NAME). " +
			"Please check your .env file.",
	)
}

const DATABASE_URL = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`

// Also inject into process.env so that schema.prisma's env("DATABASE_URL")
// resolves correctly during validation (the schema url field is checked
// independently from prisma.config.ts's datasource.url override).
process.env.DATABASE_URL = DATABASE_URL

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
	},
	datasource: {
		url: DATABASE_URL,
	},
})
