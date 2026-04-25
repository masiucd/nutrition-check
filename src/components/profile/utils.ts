export function getInitials(email: string, firstName?: string, lastName?: string) {
	if (firstName && lastName) {
		const initials = firstName[0] + lastName[0]
		return initials.toUpperCase()
	}
	if (firstName) return firstName.slice(0, 2).toUpperCase()
	return email.split("@")[0]?.slice(0, 2).toUpperCase() ?? "N/A"
}

export function formatDate(date: Date | string): string {
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	})
}
