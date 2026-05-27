import { useState } from "react"
import { Plus } from "lucide-react"

import { CreateLabelGroupDialog } from "@/components/label/label-group-form-dialog"
import { SidebarLabelGroupItem } from "@/components/sidebar/label-group-item"
import { Button } from "@/components/ui/button"
import { SidebarGroup, SidebarGroupLabel, SidebarMenu } from "@/components/ui/sidebar"
import { useLabelGroups, useLabels } from "@/queries/labels"
import { m } from "@/paraglide/messages"

interface SidebarLabelGroupsSectionProps {
  activeLabelGroupId?: string
  onLabelGroupToggle: (groupId: string) => void
  className?: string
}

export function SidebarLabelGroupsSection({
  activeLabelGroupId,
  onLabelGroupToggle,
  className,
}: SidebarLabelGroupsSectionProps) {
  const { data: groups = [] } = useLabelGroups()
  const { data: labels = [] } = useLabels()
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <SidebarGroup className={className}>
      <SidebarGroupLabel className="flex items-center justify-between pr-1">
        <span>{m.sidebar_label_groups()}</span>
        <Button variant="ghost" size="icon-xs" title={m.sidebar_label_group_add()} onClick={() => setCreateOpen(true)}>
          <Plus />
          <span className="sr-only">{m.sidebar_label_group_add()}</span>
        </Button>
      </SidebarGroupLabel>

      {groups.length > 0 && (
        <SidebarMenu>
          {groups.map((group) => (
            <SidebarLabelGroupItem
              key={group.id}
              group={group}
              allLabels={labels}
              isActive={activeLabelGroupId === group.id}
              onGroupToggle={onLabelGroupToggle}
            />
          ))}
        </SidebarMenu>
      )}

      <CreateLabelGroupDialog open={createOpen} onOpenChange={setCreateOpen} labels={labels} groups={groups} />
    </SidebarGroup>
  )
}
