// src/db/index.ts
// SERVER-ONLY — never import this in client components or routes directly.
// Always access through createServerFn() handlers.
import postgres from "postgres"
import {env} from "@/env"

const dbUrl = `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`

export const sql = postgres(dbUrl, {
	max: 20,
	idle_timeout: 30,
	connect_timeout: 2,
})

export {dailyLogsDao} from "./daily_logs.dao.server"
export {foodsDao} from "./foods.dao.server"
export {foodTypesDao} from "./type.dao.server"
// Types
export type {DailyLog, DailyLogWithFood, Food, User, UserData} from "./types"
// DAOs — import these in server functions, never in client code
export {userDataDao} from "./user_data.dao.server"
export {usersDao} from "./users.dao.server"
