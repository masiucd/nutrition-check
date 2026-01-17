import { z } from "zod";

const EnvSchema = z.object({
	DB_USER: z.string(),
	DB_PASSWORD: z.string(),
	DB_HOST: z.string(),
	DB_PORT: z.string(),
	DB_NAME: z.string(),
	JWT_ACCESS_SECRET: z.string(),
	JWT_REFRESH_SECRET: z.string(),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
	throw new Error("Invalid environment variables");
}

export const env = parsed.data;
