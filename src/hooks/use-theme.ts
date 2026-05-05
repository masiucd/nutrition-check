import {useEffect, useState} from "react"

type Theme = "light" | "dark"

function readStoredTheme(): Theme {
	try {
		const stored = localStorage.getItem("theme")
		if (stored === "light" || stored === "dark") return stored
		return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
	} catch {
		return "light"
	}
}

export function useTheme() {
	const [theme, setThemeState] = useState<Theme | null>(null)

	useEffect(() => {
		setThemeState(readStoredTheme())
	}, [])

	useEffect(() => {
		if (theme === null) return
		document.documentElement.classList.toggle("dark", theme === "dark")
		try {
			localStorage.setItem("theme", theme)
		} catch {}
	}, [theme])

	const toggleTheme = () => setThemeState((prev) => (prev === "dark" ? "light" : "dark"))

	return {theme, toggleTheme}
}
