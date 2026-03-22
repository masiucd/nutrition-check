// utils/session.ts

import {useSession} from "@tanstack/react-start/server"
import {env} from "@/data/env"

interface SessionData {
	userId?: string
	role?: string
}

const SevenDaysInSeconds = 60 * 60 * 24 * 7

export function appSession() {
	return useSession<SessionData>({
		// Session configuration
		name: "app-session",
		password: env.SESSION_SECRET, // At least 32 characters
		// Optional: customize cookie settings
		cookie: {
			secure: env.ENVIRONMENT === "production",
			sameSite: "lax",
			httpOnly: true,
			maxAge: SevenDaysInSeconds,
		},
	})
}
