import type * as React from "react"

import { AccountIcon } from "@/lib/icon-entries"
import { cn } from "@/lib/utils"

const DEFAULT_MAIL_ACCOUNT_ICON_COLOR = "#6B7280"
const DEFAULT_MAIL_ACCOUNT_ICON_NAME = "mail"

const mailAccountIconSizes = {
  sm: {
    container: "size-5",
    icon: "size-3",
  },
  md: {
    container: "size-8",
    icon: "size-4",
  },
  lg: {
    container: "size-16",
    icon: "size-8",
  },
} as const

type MailAccountIconSize = keyof typeof mailAccountIconSizes

interface MailAccountIconProps extends Omit<React.ComponentPropsWithoutRef<"span">, "color"> {
  icon?: string | null
  color?: string | null
  size?: MailAccountIconSize
  iconClassName?: string
}

export function MailAccountIcon({
  icon,
  color,
  size = "sm",
  className,
  iconClassName,
  style,
  ...props
}: MailAccountIconProps) {
  const sizeClassNames = mailAccountIconSizes[size]

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        sizeClassNames.container,
        className
      )}
      style={{ ...style, backgroundColor: color || DEFAULT_MAIL_ACCOUNT_ICON_COLOR }}
      {...props}
    >
      <AccountIcon
        name={icon || DEFAULT_MAIL_ACCOUNT_ICON_NAME}
        className={cn(sizeClassNames.icon, iconClassName)}
        stroke="var(--color-white)"
        aria-hidden="true"
      />
    </span>
  )
}
