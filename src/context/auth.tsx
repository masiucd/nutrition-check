// contexts/auth.tsx

import {type RefetchOptions, useQuery} from "@tanstack/react-query"
import {useServerFn} from "@tanstack/react-start"
import {createContext, type ReactNode, useContext} from "react"
import {getCurrentUserFn} from "@/utils/functions/user.functions"

type User = {
	id: number
	username: string
	email: string
}

type AuthContextType = {
	user: User | null
	isLoading: boolean
	refetch: (options?: RefetchOptions | undefined) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({
	children,
	initialUser,
}: {
	children: ReactNode
	initialUser: User | null
}) {
	// useServerFn correctly wraps the server function so it can be called from the client
	const fetchUser = useServerFn(getCurrentUserFn)
	const {
		data: serverUser,
		isLoading,
		refetch: refetchQuery,
	} = useQuery({
		queryKey: ["user"],
		queryFn: () => {
			return fetchUser()
		},
		initialData: initialUser, // initial user data from the server helps us avoid a flash of loading state
		staleTime: 5 * 60 * 1000, // 5 minutes
	})

	const refetch = async (options?: RefetchOptions) => {
		await refetchQuery(options)
	}

	return (
		<AuthContext.Provider value={{user: serverUser, isLoading, refetch}}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider")
	}
	return context
}
