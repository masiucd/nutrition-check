// Server function wrappers (createServerFn)
// These functions can be called from the client to interact with the server
// For example, they can be used to register a new user or log in an existing user
import {createServerFn} from "@tanstack/react-start"
import {hash} from "bcryptjs"
import z from "zod"
import {findUserByEmail, insertUser} from "./user.server"

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
		const existingUser = await findUserByEmail(data.email)
		if (existingUser !== null) {
			console.log("Existing user exists so we cannot create a new one", existingUser)
			return null
		}
		try {
			return insertUser({...data, password: await hash(data.password, 8)})
		} catch (error) {
			console.error("An error occurred:", error)
			return null
		}
	})
