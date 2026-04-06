import {z} from "zod"

const EnvSchema = z.object({
	DB_USER: z.string(),
	DB_PASSWORD: z.string(),
	DB_HOST: z.string(),
	DB_PORT: z.string(),
	DB_NAME: z.string(),
	JWT_ACCESS_SECRET: z.string(),
	JWT_REFRESH_SECRET: z.string(),
	SESSION_SECRET: z.string(),
	// Not used currently - implemented in the future
	BETTER_AUTH_API_KEY: z.string(),

	// Local development vs production
	ENVIRONMENT: z.string().default("development"),

	REDIS_URL: z.string().default("redis://localhost:6379"),
})

const parsed = EnvSchema.safeParse(process.env)
if (!parsed.success) {
	throw new Error("Invalid environment variables")
}

export const env = parsed.data
