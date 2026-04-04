import {createServerFn} from "@tanstack/react-start"
import {z} from "zod"
import {usersDao} from "@/db"
import {hashPassword} from "../utils/password.server"
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
		console.log("Data from createUser (SERVER ):", data)
		const maybeUser = await usersDao.findByEmail(data.email)
		console.log("maybeUser:", maybeUser)
		if (maybeUser) {
			return {
				error: "Failed to create user",
				data: null,
				status: HttpStatusCode.FORBIDDEN,
			}
		}
		const hashedPassword = await hashPassword(data.password)
		const maybeNewUser = await usersDao.create(data.email, hashedPassword)
		console.log("maybeNewUser", maybeNewUser)
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
