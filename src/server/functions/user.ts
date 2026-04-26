import {redirect} from "@tanstack/react-router"
import {createServerFn} from "@tanstack/react-start"
import {userDataDao, usersDao} from "@/db"
import {
	CreateUserSchema,
	LoginUserSchema,
	UpdateEmailSchema,
	UpdatePasswordSchema,
	UpdateUserProfileSchema,
	UserSchema,
} from "@/lib/schemas"
import {comparePassword, hashPassword} from "../utils/password.server"
import {deleteUserFromCache, getUserFromCache, storeUserInCache} from "../utils/redis.server"
import {getAppSession} from "../utils/session"
import {HttpStatusCode} from "../utils/status_code"

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
			role: user.is_admin ? "admin" : "user",
		})

		// Cache the user in Redis so subsequent lookups skip the DB
		try {
			await storeUserInCache({userId: user.id, user})
		} catch (_err) {}

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
			// biome-ignore lint/suspicious/noConsole: <logging>
			console.error("Failed to delete user from cache during logout", err)
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
		const cachedUser = await getUserFromCache(userId)
		if (cachedUser !== null) {
			const parsedUser = UserSchema.safeParse(cachedUser)
			if (parsedUser.success) {
				return parsedUser.data
			}
			// Cached data is stale or corrupt — fall through to DB
			// biome-ignore lint/suspicious/noConsole: <logging>
			console.warn("[getCurrentUserFn] Cached user failed schema validation, falling back to DB")
		}
	} catch (err) {
		// biome-ignore lint/suspicious/noConsole: <logging>
		console.error("[getCurrentUserFn] Redis error, falling back to DB", err)
	}

	// Cache miss, stale data, or Redis error — fall back to the DB
	const user = await usersDao.findById(userId)
	if (!user) {
		return null
	}

	// Re-populate the cache so the next request is served from Redis
	try {
		await storeUserInCache({userId, user})
	} catch (err) {
		// biome-ignore lint/suspicious/noConsole: <logging>
		console.error("[getCurrentUserFn] Failed to cache user after DB lookup", err)
	}

	return user
})

// Update user email
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

// Get user profile data
export const getUserProfileFn = createServerFn({method: "GET"}).handler(async () => {
	const session = await getAppSession()
	const userId = session.data.userId
	if (!userId) {
		return {error: "Not authenticated", data: null, status: HttpStatusCode.UNAUTHORIZED}
	}
	const data = await userDataDao.findById(userId)
	return {error: null, data, status: HttpStatusCode.OK}
})

// Update user profile data
export const updateUserProfileFn = createServerFn({method: "POST"})
	.inputValidator(UpdateUserProfileSchema)
	.handler(async ({data}) => {
		const session = await getAppSession()
		const userId = session.data.userId
		if (!userId) {
			return {error: "Not authenticated", data: null, status: HttpStatusCode.UNAUTHORIZED}
		}

		const updated = await userDataDao.upsert(userId, {
			age: data.age ?? null,
			gender: data.gender ?? null,
			firstName: data.firstName,
			lastName: data.lastName,
			occupation: data.occupation,
			height: data.height ?? null,
			weight: data.weight ?? null,
			city: data.city,
			country: data.country,
		})

		if (!updated) {
			return {error: "Failed to save profile", data: null, status: HttpStatusCode.BAD_REQUEST}
		}
		return {error: null, data: updated, status: HttpStatusCode.OK}
	})

// Function to get users foodItems
export const getFoodItemsFn = createServerFn({method: "GET"}).handler(async () => {
	const session = await getAppSession()
	const userId = session.data.userId
	if (!userId) {
		return {error: "Not authenticated", data: [], status: HttpStatusCode.UNAUTHORIZED}
	}
	try {
		const myFoodItems = await usersDao.findAllFoodItems(userId)
		return {error: null, data: myFoodItems, status: HttpStatusCode.OK}
	} catch (_e) {
		return {
			error: "Failed to fetch food items",
			data: [],
			status: HttpStatusCode.INTERNAL_SERVER_ERROR,
		}
	}
})
