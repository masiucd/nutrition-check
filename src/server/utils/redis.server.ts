// SERVER-ONLY
import Redis from "ioredis"
import type {User} from "@/db/types"
import {env} from "@/env"
import type {AwaitNullable} from "@/lib/types"

export const redis = new Redis(env.REDIS_URL)

export const getUserCacheKey = (userId: number): string => `user:${userId}`

const ONE_HOUR_IN_SECONDS = 3600
interface StoreUserInCacheOptions {
	userId: number
	seconds?: number
	user: User
}
export async function storeUserInCache({
	userId,
	seconds = ONE_HOUR_IN_SECONDS,
	user,
}: StoreUserInCacheOptions) {
	await redis.setex(getUserCacheKey(userId), seconds, JSON.stringify(user))
}

export async function getUserFromCache(userId: number): AwaitNullable<User> {
	const user = await redis.get(getUserCacheKey(userId))
	return user ? JSON.parse(user) : null
}

export async function deleteUserFromCache(userId: number) {
	await redis.del(getUserCacheKey(userId))
}
