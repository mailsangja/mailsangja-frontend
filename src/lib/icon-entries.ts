import { createElement } from "react"
import type { LucideIcon, LucideProps } from "lucide-react"
import { Bell, Briefcase, Code, Gamepad2, GraduationCap, Home, Mail, ShoppingCart } from "lucide-react"

export const ICON_ENTRIES = [
  { name: "mail", Icon: Mail },
  { name: "briefcase", Icon: Briefcase },
  { name: "graduation-cap", Icon: GraduationCap },
  { name: "code", Icon: Code },
  { name: "gamepad-2", Icon: Gamepad2 },
  { name: "home", Icon: Home },
  { name: "shopping-cart", Icon: ShoppingCart },
  { name: "bell", Icon: Bell },
] as const satisfies readonly {
  readonly name: string
  readonly Icon: LucideIcon
}[]

export type AccountIconName = (typeof ICON_ENTRIES)[number]["name"]

const iconMap = new Map(ICON_ENTRIES.map(({ name, Icon }) => [name as string, Icon]))

export function AccountIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = iconMap.get(name) ?? iconMap.get(ICON_ENTRIES[0].name)!
  return createElement(Icon, props)
}
