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

// Update user email
const UpdateEmailSchema = z.object({
	email: z.email("Please enter a valid email"),
})

export const updateUserEmailFn = createServerFn({method: "POST"})
	.inputValidator(UpdateEmailSchema)
	.handler(async ({data}) => {
		const session = await getAppSession()
		const userId = session.data.userId
		if (!userId) {
			return {error: "Not authenticated", status: HttpStatusCode.UNAUTHORIZED, data: null}
		}

		// Check the email is not already taken by another account
		const existing = await usersDao.findByEmail(data.email)
		if (existing && existing.id !== userId) {
			return {error: "This email is already in use", status: HttpStatusCode.FORBIDDEN, data: null}
		}

		const updatedUser = await usersDao.updateEmail(userId, data.email)
		if (!updatedUser) {
			return {error: "Failed to update email", status: HttpStatusCode.BAD_REQUEST, data: null}
		}

		try {
			await storeUserInCache({userId, user: updatedUser})
		} catch (_err) {}

		return {error: null, data: updatedUser, status: HttpStatusCode.OK}
	})

// Update user password
const UpdatePasswordSchema = z.object({
	currentPassword: z.string().min(1, "Current password is required"),
	newPassword: z.string().min(6, "Password must be at least 6 characters"),
	confirmPassword: z.string().min(6, "Please confirm your new password"),
})

export const updateUserPasswordFn = createServerFn({method: "POST"})
	.inputValidator(UpdatePasswordSchema)
	.handler(async ({data}) => {
		const session = await getAppSession()
		const userId = session.data.userId
		if (!userId) {
			return {error: "Not authenticated", status: HttpStatusCode.UNAUTHORIZED, data: null}
		}

		if (data.newPassword !== data.confirmPassword) {
			return {error: "New passwords do not match", status: HttpStatusCode.BAD_REQUEST, data: null}
		}

		const user = await usersDao.findById(userId)
		if (!user) {
			return {error: "User not found", status: HttpStatusCode.BAD_REQUEST, data: null}
		}

		const passwordMatch = await comparePassword(data.currentPassword, user.password)
		if (!passwordMatch) {
			return {
				error: "Current password is incorrect",
				status: HttpStatusCode.UNAUTHORIZED,
				data: null,
			}
		}

		const hashedPassword = await hashPassword(data.newPassword)
		const updatedUser = await usersDao.updatePassword(userId, hashedPassword)
		if (!updatedUser) {
			return {error: "Failed to update password", status: HttpStatusCode.BAD_REQUEST, data: null}
		}

		try {
			await storeUserInCache({userId, user: updatedUser})
		} catch (_err) {}

		return {error: null, data: updatedUser, status: HttpStatusCode.OK}
	})
