import { Link } from "@tanstack/react-router"
import { Bell, Search, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"

export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-background p-4">
      <header className="flex items-center justify-between">
        <div className="relative max-w-lg flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="메일 검색"
            className="h-9 w-full rounded-md bg-muted/50 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon">
            <Bell className="size-5" />
          </Button>
          <Link to="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="size-5" />
            </Button>
          </Link>
        </div>
      </header>
      <div className="mt-4 flex-1 overflow-auto rounded-[30px] bg-card">
        {children}
      </div>
    </main>
  )
}
