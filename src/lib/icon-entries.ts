import { createElement } from "react"
import type { LucideIcon, LucideProps } from "lucide-react"
import { Bell, Briefcase, Code, Gamepad2, GraduationCap, Home, Mail, ShoppingCart } from "lucide-react"

export const ICON_ENTRIES = [
  { name: "mail", label: "메일", Icon: Mail },
  { name: "briefcase", label: "회사", Icon: Briefcase },
  { name: "graduation-cap", label: "학교", Icon: GraduationCap },
  { name: "code", label: "코드", Icon: Code },
  { name: "gamepad-2", label: "게임", Icon: Gamepad2 },
  { name: "home", label: "집", Icon: Home },
  { name: "shopping-cart", label: "쇼핑", Icon: ShoppingCart },
  { name: "bell", label: "알림", Icon: Bell },
] as const satisfies readonly {
  readonly name: string
  readonly label: string
  readonly Icon: LucideIcon
}[]

export type AccountIconName = (typeof ICON_ENTRIES)[number]["name"]

const iconMap = new Map(ICON_ENTRIES.map(({ name, Icon }) => [name as string, Icon]))

export function AccountIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = iconMap.get(name) ?? iconMap.get(ICON_ENTRIES[0].name)!
  return createElement(Icon, props)
}
