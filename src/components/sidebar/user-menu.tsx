import { Link } from "@tanstack/react-router"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { useLogout } from "@/mutations/auth"
import { m } from "@/paraglide/messages"
import { useUser } from "@/queries/user"
import { ChevronsUpDown, CircleArrowUp, LogOut, Settings, Tag, UserIcon } from "lucide-react"

export function SidebarUserMenu() {
  const { data: user } = useUser()
  const logoutMutation = useLogout()
  const { isMobile } = useSidebar()

  if (!user) return null

  const initials = user.name
    .split("")
    .filter((_, i) => i < 2)
    .join("")

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />}>
            <Avatar size="sm">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">{m.user_plan_suffix({ plan: user.plan })}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar size="sm">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.username}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link to="/upgrade" />}>
                <CircleArrowUp />
                <span>{m.user_upgrade_plan()}</span>
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link to="/settings" />}>
                <Settings />
                <span>{m.user_settings()}</span>
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link to="/settings/account" />}>
                <UserIcon />
                <span>{m.user_account()}</span>
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link to="/settings/label" />}>
                <Tag />
                <span>{m.user_label_management()}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending}>
              <LogOut />
              <span>{m.user_logout()}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
