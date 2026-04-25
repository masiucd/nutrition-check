import {Apple, ClipboardList, KeyRound, User} from "lucide-react"
import {TabButton} from "./tab-button"
import type {Tab} from "./types"

export function TabNav({activeTab, setTab}: {activeTab: Tab; setTab: (tab: Tab) => void}) {
	return (
		<div className="mb-4 flex gap-1 rounded-xl border bg-muted/50 p-1">
			<TabButton active={activeTab === "info"} onClick={() => setTab("info")}>
				<User className="size-4" />
				Account info
			</TabButton>
			<TabButton active={activeTab === "foods"} onClick={() => setTab("foods")}>
				<Apple className="size-4" />
				Foods
			</TabButton>
			<TabButton active={activeTab === "personal"} onClick={() => setTab("personal")}>
				<ClipboardList className="size-4" />
				Personal details
			</TabButton>
			<TabButton active={activeTab === "security"} onClick={() => setTab("security")}>
				<KeyRound className="size-4" />
				Security
			</TabButton>
		</div>
	)
}
