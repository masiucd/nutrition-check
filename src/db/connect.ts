import {env} from "@/data/env"
import {PrismaClient} from "@/generated/prisma"

export const dbUrl = `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`

// Use a global singleton to avoid creating multiple PrismaClient instances
// during hot-module reload in development
const globalForPrisma = global as unknown as {prisma: PrismaClient}

export const db =
	globalForPrisma.prisma ??
	new PrismaClient({
		datasources: {
			db: {url: dbUrl},
		},
		log: env.ENVIRONMENT === "development" ? ["query", "warn", "error"] : ["warn", "error"],
	})

if (env.ENVIRONMENT !== "production") {
	globalForPrisma.prisma = db
}
