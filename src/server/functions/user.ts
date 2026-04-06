import {redirect} from "@tanstack/react-router"
import {createServerFn} from "@tanstack/react-start"
import {z} from "zod"
import {usersDao} from "@/db"
import {comparePassword, hashPassword} from "../utils/password.server"
import {deleteUserFromCache, getUserFromCache, storeUserInCache} from "../utils/redis.server"
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

		// Cache the user in Redis so subsequent lookups skip the DB
		try {
			await storeUserInCache({userId: user.id, user})
		} catch (err) {
			console.error("[Redis] Failed to cache user on login:", err)
		}

		return {
			error: null,
			data: user,
			status: HttpStatusCode.OK,
		}
	})

// Logout server function
export const logoutFn = createServerFn({method: "POST"}).handler(async () => {
	const session = await getAppSession()

	// Invalidate the cached user before clearing the session
	const userId = session.data.userId
	if (userId) {
		try {
			await deleteUserFromCache(userId)
		} catch (err) {
			console.error("[Redis] Failed to invalidate user cache on logout:", err)
		}
	}

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

	// Redis cache handles repeated lookups — only falls back to the DB on a miss or Redis error
	try {
		// const cached = await redis.get(getUserCacheKey(userId))
		const cashedUser = await getUserFromCache(userId)
		if (cashedUser !== null) {
			// since cached data is already deserialised, we can return it directly , no need to hit the DB
			return cashedUser
		}
	} catch (err) {
		console.error("[Redis] Cache read failed, falling back to DB:", err)
	}

	// If cached data is not available, fall back to the DB
	const user = await usersDao.findById(userId)

	if (user) {
		try {
			await storeUserInCache({userId, user})
		} catch (err) {
			console.error("[Redis] Failed to cache user after DB fetch:", err)
		}
	}

	return user
})
