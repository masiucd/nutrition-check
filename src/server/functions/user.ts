import {redirect} from "@tanstack/react-router"
import {createServerFn} from "@tanstack/react-start"
import {z} from "zod"
import {usersDao} from "@/db"
import {comparePassword, hashPassword} from "../utils/password.server"
import {getAppSession} from "../utils/session"
import {HttpStatusCode} from "../utils/status_code"

const CreateUserSchema = z.object({
	name: z.string(),
	email: z.email(),
	password: z.string(),
	confirmPassword: z.string(),
})

export const createUser = createServerFn({method: "POST"})
	.inputValidator(CreateUserSchema)
	.handler(async ({data}) => {
		const maybeUser = await usersDao.findByEmail(data.email)

		if (maybeUser) {
			return {
				error: "Failed to create user",
				data: null,
				status: HttpStatusCode.FORBIDDEN,
			}
		}

		const hashedPassword = await hashPassword(data.password)
		const maybeNewUser = await usersDao.create(data.email, hashedPassword)
		if (!maybeNewUser) {
			return {
				error: "Failed to create user",
				data: null,
				status: HttpStatusCode.BAD_REQUEST,
			}
		}

		return {
			error: null,
			data: maybeNewUser,
			status: HttpStatusCode.CREATED,
		}
	})

const LoginUserSchema = z.object({
	email: z.email(),
	password: z.string(),
})

export const loginUser = createServerFn({method: "POST"})
	.inputValidator(LoginUserSchema)
	.handler(async ({data}) => {
		const user = await usersDao.findByEmail(data.email)
		if (!user) {
			return {
				error: "Failed to login",
				data: null,
				status: HttpStatusCode.BAD_REQUEST,
			}
		}
		const passwordMatch = await comparePassword(data.password, user.password)
		if (!passwordMatch) {
			return {
				error: "Failed to login",
				data: null,
				status: HttpStatusCode.UNAUTHORIZED,
			}
		}

		const session = await getAppSession()

		await session.update({
			userId: user.id,
		})

		return {
			error: null,
			data: user,
			status: HttpStatusCode.OK,
		}
	})

// Logout server function
export const logoutFn = createServerFn({method: "POST"}).handler(async () => {
	const session = await getAppSession()
	await session.clear()
	throw redirect({to: "/login"})
})

// Get current user
export const getCurrentUserFn = createServerFn({method: "GET"}).handler(async () => {
	const session = await getAppSession()
	const userId = session.data.userId

	if (!userId) {
		return null
	}

	// This will do a DB call every time the user is fetched, can we optimize this? perhaps using a cache??
	return await usersDao.findById(userId)
})
