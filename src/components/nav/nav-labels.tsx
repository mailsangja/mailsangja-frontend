import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const LABEL_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
  "#64748b", // slate
  "#78716c", // stone
  "#6b7280", // gray
]

interface Label {
  id: string
  name: string
  color: string
}

export function NavLabels({ className }: { className?: string }) {
  const [labels, setLabels] = useState<Label[]>([])
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0])

  function handleCreate() {
    if (!name.trim()) return
    setLabels((prev) => [...prev, { id: crypto.randomUUID(), name: name.trim(), color: selectedColor }])
    setName("")
    setSelectedColor(LABEL_COLORS[0])
    setOpen(false)
  }

  return (
    <SidebarGroup className={className}>
      <SidebarGroupLabel className="flex items-center justify-between pr-1">
        <span>라벨</span>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon-xs" title="라벨 추가">
              <Plus />
              <span className="sr-only">라벨 추가</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 라벨 만들기</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
              <Input
                placeholder="라벨 이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
              <div>
                <p className="mb-2 text-xs text-muted-foreground">색상 선택</p>
                <div className="grid grid-cols-10 gap-1.5">
                  {LABEL_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="size-6 rounded-full ring-offset-2 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      style={{
                        backgroundColor: color,
                        boxShadow: selectedColor === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : undefined,
                      }}
                      onClick={() => setSelectedColor(color)}
                      aria-label={color}
                      aria-pressed={selectedColor === color}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={!name.trim()}>
                만들기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarGroupLabel>

      {labels.length > 0 && (
        <SidebarMenu>
          {labels.map((label) => (
            <SidebarMenuItem key={label.id}>
              <SidebarMenuButton tooltip={label.name}>
                <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: label.color }} />
                <span className="truncate">{label.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      )}
    </SidebarGroup>
  )
}
