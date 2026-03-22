// Server function wrappers (createServerFn)
// These functions can be called from the client to interact with the server

import {redirect} from "@tanstack/react-router"
import {createServerFn} from "@tanstack/react-start"
import z from "zod"
import {comparePassword, hashPassword} from "@/lib/hash.server"
import {appSession} from "../session"
import {findUserByEmail, findUserById, insertUser} from "./user.server"

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
			return {success: false, message: "Invalid credentials"} as const
		}

		const passwordMatch = await comparePassword(data.password, existingUser.passwordHash)
		if (!passwordMatch) {
			return {success: false, message: "Invalid credentials"} as const
		}

		const session = await appSession()
		// TODO create token
		await session.update({userId: existingUser.id.toString()})

		return {
			success: true,
			user: {id: existingUser.id, username: existingUser.username, email: existingUser.email},
		} as const
	})

export const logoutFn = createServerFn({method: "POST"}).handler(async () => {
	const session = await appSession()
	await session.clear()
	throw redirect({to: "/"})
})

export const getCurrentUserFn = createServerFn({method: "GET"}).handler(async () => {
	const session = await appSession()
	const userId =
		session.data.userId && typeof session.data.userId === "string"
			? parseInt(session.data.userId, 10)
			: null

	if (!userId) {
		return null
	}

	return await findUserById(userId)
})
