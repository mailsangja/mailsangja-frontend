import { useEffect, useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Plus, Trash2 } from "lucide-react"

import { AddAccountDialog } from "@/components/add-account-dialog"
import { MailAccountIcon } from "@/components/mail-account-icon"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { m } from "@/paraglide/messages"
import { useActivateMailAccount, useDeactivateMailAccount } from "@/mutations/mail-accounts"
import { useUpdateDefaultAccount } from "@/mutations/user"
import { useMailAccounts } from "@/queries/mail-accounts"
import { useUser } from "@/queries/user"

export const Route = createFileRoute("/_authenticated/settings/account")({
  component: SettingsAccountPage,
})

function SettingsAccountPage() {
  const { data: user, isPending: isUserPending } = useUser()
  const { data: mailAccounts, isPending: isAccountsPending, isError: isAccountsError } = useMailAccounts()
  const [defaultAccount, setDefaultAccount] = useState<string | null>(null)
  const [pendingAccountId, setPendingAccountId] = useState<string | null>(null)
  const updateDefaultAccountMutation = useUpdateDefaultAccount()
  const { mutate: mutateDefaultAccount } = updateDefaultAccountMutation
  const { mutate: activate } = useActivateMailAccount()
  const { mutate: deactivate } = useDeactivateMailAccount()

  const accounts = useMemo(() => mailAccounts ?? [], [mailAccounts])

  const defaultAccountItems = useMemo(
    () =>
      accounts.map((mailAccount) => ({
        value: mailAccount.id,
        label: mailAccount.emailAddress,
      })),
    [accounts]
  )

  const selectedDefaultAccount = defaultAccount ?? user?.defaultMailAccountId ?? null

  useEffect(() => {
    if (
      !isUserPending &&
      user &&
      !isAccountsPending &&
      !isAccountsError &&
      !user.defaultMailAccountId &&
      mailAccounts &&
      mailAccounts.length > 0
    ) {
      mutateDefaultAccount({ mailAccountId: mailAccounts[0].id })
    }
  }, [mailAccounts, user, isUserPending, isAccountsPending, isAccountsError, mutateDefaultAccount])

  const handleSaveDefaultAccount = () => {
    if (!selectedDefaultAccount) return
    updateDefaultAccountMutation.mutate({ mailAccountId: selectedDefaultAccount })
  }

  const handleToggleActive = (id: string, isActive: boolean) => {
    setPendingAccountId(id)
    const onSettled = () => setPendingAccountId(null)
    if (isActive) {
      deactivate(id, { onSettled })
    } else {
      activate(id, { onSettled })
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{m.settings_default_mail_account_title()}</CardTitle>
          <CardDescription>{m.settings_default_mail_account_description()}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Select
            value={selectedDefaultAccount}
            onValueChange={setDefaultAccount}
            items={defaultAccountItems}
            disabled={isAccountsPending || accounts.length === 0}
          >
            <SelectTrigger className="w-72" aria-label={m.settings_default_mail_account_select_aria()}>
              <SelectValue
                placeholder={
                  isAccountsPending
                    ? m.settings_mail_accounts_loading_short()
                    : m.settings_default_mail_account_placeholder()
                }
              />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              {defaultAccountItems.map((item) => (
                <SelectItem key={item.value} value={item.value} className="px-3 py-2">
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleSaveDefaultAccount}
            disabled={
              !selectedDefaultAccount ||
              selectedDefaultAccount === user?.defaultMailAccountId ||
              updateDefaultAccountMutation.isPending
            }
          >
            {updateDefaultAccountMutation.isPending ? m.settings_default_mail_account_saving() : m.common_save()}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{m.settings_mail_accounts_title()}</CardTitle>
          <CardDescription>{m.settings_mail_accounts_description()}</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">{m.settings_mail_accounts_icon_column()}</TableHead>
                <TableHead className="w-full">{m.settings_mail_accounts_email_column()}</TableHead>
                <TableHead className="text-center">{m.settings_mail_accounts_active_column()}</TableHead>
                <TableHead className="text-center">{m.common_delete()}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAccountsPending && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    {m.settings_mail_accounts_loading()}
                  </TableCell>
                </TableRow>
              )}
              {isAccountsError && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-destructive">
                    {m.settings_mail_accounts_error()}
                  </TableCell>
                </TableRow>
              )}
              {!isAccountsPending && !isAccountsError && accounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    {m.settings_mail_accounts_empty()}
                  </TableCell>
                </TableRow>
              )}
              {accounts.map((mailAccount) => (
                <TableRow key={mailAccount.id}>
                  <TableCell className="text-center">
                    {mailAccount.icon ? (
                      <MailAccountIcon
                        icon={mailAccount.icon}
                        color={mailAccount.color}
                        size="md"
                        className="mx-auto"
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{mailAccount.emailAddress}</span>
                      <span className="text-xs text-muted-foreground">{mailAccount.alias}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Switch
                        checked={mailAccount.isActive}
                        disabled={pendingAccountId === mailAccount.id}
                        onCheckedChange={() => handleToggleActive(mailAccount.id, mailAccount.isActive)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Button variant="ghost" size="icon-sm" disabled>
                        <Trash2 data-icon="inline-start" className="text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{m.settings_add_mail_account_title()}</CardTitle>
          <CardDescription>{m.settings_add_mail_account_description()}</CardDescription>
        </CardHeader>
        <CardContent>
          <AddAccountDialog>
            <Button variant="outline">
              <Plus data-icon="inline-start" />
              {m.settings_add_mail_account_button()}
            </Button>
          </AddAccountDialog>
        </CardContent>
      </Card>
    </>
  )
}
