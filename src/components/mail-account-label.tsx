import { MailAccountIcon } from "@/components/mail-account-icon"
import { cn } from "@/lib/utils"
import type { MailAccount } from "@/types/mail-account"

interface MailAccountLabelProps {
  account: MailAccount
  className?: string
}

export function MailAccountLabel({ account, className }: MailAccountLabelProps) {
  return (
    <span className={cn("flex min-w-0 flex-1 items-center gap-2", className)}>
      <MailAccountIcon icon={account.icon} color={account.color} />
      <span className="min-w-0 truncate text-xs">
        {account.alias || account.emailAddress}
        {account.alias ? (
          <span className="ml-1 tracking-tight text-muted-foreground">({account.emailAddress})</span>
        ) : null}
      </span>
    </span>
  )
}
