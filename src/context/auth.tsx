// contexts/auth.tsx

import {useServerFn} from "@tanstack/react-start"
import {createContext, type ReactNode, useContext} from "react"
import {getCurrentUserFn} from "../server/auth" // TODO

type User = {
	id: string
	email: string
	role: string
}

type AuthContextType = {
	user: User | null
	isLoading: boolean
	refetch: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({children}: {children: ReactNode}) {
	const {data: user, isLoading, refetch} = useServerFn(getCurrentUserFn)

	return <AuthContext.Provider value={{user, isLoading, refetch}}>{children}</AuthContext.Provider>
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider")
	}
	return context
}
