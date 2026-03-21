// Server function wrappers (createServerFn)
// These functions can be called from the client to interact with the server
// For example, they can be used to register a new user or log in an existing user
import {createServerFn} from "@tanstack/react-start"
import z from "zod"
import {comparePassword, hashPassword} from "@/lib/hash.server"
import { findUserByEmail, insertUser } from "./user.server"
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode('super-secret')

const token = await new SignJWT({ userId: 42 })
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime('1h')
  .sign(secret)

const { payload } = await jwtVerify(token, secret)
console.log(payload.userId) // 42





const NewUserSchema = z
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

export const createNewUser = createServerFn({method: "POST"})
	.inputValidator(NewUserSchema)
	.handler(async ({data}) => {
		const existingUser = await findUserByEmail(data.email)
		if (existingUser !== null) {
			console.log("Existing user exists so we cannot create a new one", existingUser)
			return null
		}
		try {
			return insertUser({...data, password: await hashPassword(data.password)})
		} catch (error) {
			console.error("An error occurred:", error)
			return null
		}
	})

const LoginSchema = z.object({
	email: z.email().max(100),
	password: z.string().min(1),
})

export const loginUser = createServerFn({method: "POST"})
	.inputValidator(LoginSchema)
	.handler(async ({data}) => {
		const existingUser = await findUserByEmail(data.email)
		if (existingUser === null) {
			return {success: false, message: "Invalid email or password"} as const
		}
		const passwordMatch = await comparePassword(data.password, existingUser.passwordHash)
		if (!passwordMatch) {
			return {success: false, message: "Invalid email or password"} as const
		}

		// TODO
		// if OK we want to create a session cookie with a JWT token
		//

		let token =

		return {
			success: true,
			user: {id: existingUser.id, username: existingUser.username, email: existingUser.email},
		} as const
	})
