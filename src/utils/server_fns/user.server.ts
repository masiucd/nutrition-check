import {createServerFn} from "@tanstack/react-start"
import {z} from "zod"

let _NewUserSchema = z
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
	// .inputValidator(_NewUserSchema)
	// .inputValidator(data => {
	// 	if (!(data instanceof FormData)) {
	// 		throw new Error("Invalid form data")
	// 	}
	// 	let username = data.get("username")
	// 	let email = data.get("email")
	// 	let password = data.get("password")
	// 	let repeatPassword = data.get("repeatPassword")

	// 	// Will throw if any of the fields are missing or invalid - option is to use safeParse if we want to handle errors differently
	// 	let parsed = NewUserSchema.parse({
	// 		username: username,
	// 		email: email,
	// 		password: password,
	// 		repeatPassword: repeatPassword,
	// 	})

	// 	return parsed
	// })
	//   .inputValidator(( { email: string; password: string; name: string }) => data)
	.handler(async ({data}) => {
		// let hashedPassword = await hash(data.password, 10)
		// let rows = await db.insert(user).values({
		// 	username: data.username,
		// 	email: data.email,
		// 	passwordHash: hashedPassword,
		// })
		// return rows.rows.length > 0 ? rows.rows[0] : null
		console.log(data)
		return "Hello"
	})
