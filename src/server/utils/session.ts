import {useSession} from "@tanstack/react-start/server"
import {env} from "@/env"

interface SessionData {
	userId?: number
	role?: string
}

// Retrieves the application session using the useSession hook.
// This function sets up session management for the app, configuring the session name, encryption password,
// and cookie settings. It ensures that session cookies are secure in production, HTTP-only, and use lax same-site policy.
// The session data can include userId and role, which are used for authentication and authorization purposes.
export function getAppSession() {
	// biome-ignore lint/correctness/useHookAtTopLevel: <not relevant for this file>
	return useSession<SessionData>({
		// Session configuration
		name: "app-session",
		password: env.SESSION_SECRET,
		// Optional: customize cookie settings
		cookie: {
			secure: env.ENVIRONMENT === "production",
			sameSite: "lax",
			httpOnly: true,
			expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
		},
	})
}
