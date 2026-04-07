import { createElement } from "react"
import {
  Bell,
  Briefcase,
  Code,
  Gamepad2,
  GraduationCap,
  Home,
  Mail,
  ShoppingCart,
} from "lucide-react"
import type { LucideIcon, LucideProps } from "lucide-react"
import type { AccountIconName } from "@/lib/icon-entries"

const iconMap: Record<AccountIconName, LucideIcon> = {
  mail: Mail,
  briefcase: Briefcase,
  "graduation-cap": GraduationCap,
  code: Code,
  "gamepad-2": Gamepad2,
  home: Home,
  "shopping-cart": ShoppingCart,
  bell: Bell,
}

function isAccountIconName(name: string): name is AccountIconName {
  return name in iconMap
}

export function AccountIcon({
  name,
  ...props
}: { name: string } & LucideProps) {
  const iconName = isAccountIconName(name) ? name : "mail"
  return createElement(iconMap[iconName], props)
}
