import {createServerFn} from "@tanstack/react-start"
import {hash} from "bcryptjs"
import {eq} from "drizzle-orm"
import z from "zod"
import {db} from "@/db/connect"
import {user} from "@/db/schema"

let NewUserSchema = z
	.object({
		username: z.string().min(3).max(100),
		email: z.email().max(100),
		password: z.string().min(6).max(100),
		repeatPassword: z.string().min(6).max(100),
	})
	.refine(data => data.password === data.repeatPassword, {
		message: "Passwords do not match",
		path: ["repeatPassword"],
	})

export let createNewUser = createServerFn({method: "POST"})
	.inputValidator(NewUserSchema)
	.handler(async ({data}) => {
		let hashedPassword = await hash(data.password, 10)
		console.log("Hashed ---> ", hashedPassword)
		console.log("Data", data)

		// check if user already exists
		const existingUser = await db.select().from(user).where(eq(user.email, data.email)).limit(1)
		if (existingUser.length > 0) {
			console.log("Existing user", existingUser)
			return null
		}

		let rows = await db.insert(user).values({
			username: data.username,
			email: data.email,
			passwordHash: hashedPassword,
		})
		console.log("Rows", rows)
		return rows.rows.length > 0 ? rows.rows[0] : null
	})
