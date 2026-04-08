import { useMemo, useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Home, Trash2, Plus } from "lucide-react"

import { AddAccountDialog } from "@/components/add-account-dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AccountIcon } from "@/lib/icon-entries"
import { useMailAccounts } from "@/queries/mail-accounts"
import { useUser } from "@/queries/user"
import { useUpdateDefaultAccount } from "@/mutations/user"

export const Route = createFileRoute("/_authenticated/settings/account")({
  component: SettingsAccountPage,
})

function SettingsAccountPage() {
  const { data: user, isPending: isUserPending } = useUser()
  const { data: mailAccounts, isPending: isAccountsPending, isError: isAccountsError } = useMailAccounts()
  const [toggledIds, setToggledIds] = useState<Set<string>>(new Set())
  const [defaultAccount, setDefaultAccount] = useState<string | null>(null)
  const updateDefaultAccountMutation = useUpdateDefaultAccount()

  // 추후 API 구현 후, 연동 예정
  const accounts = useMemo(() => {
    if (!mailAccounts) return []
    return mailAccounts.map((mailAccount) =>
      toggledIds.has(mailAccount.id) ? { ...mailAccount, isActive: !mailAccount.isActive } : mailAccount
    )
  }, [mailAccounts, toggledIds])

  const selectedDefaultAccount = defaultAccount ?? user?.defaultMailAccountId ?? accounts[0]?.id ?? null

  const handleSaveDefaultAccount = () => {
    if (!selectedDefaultAccount) return
    updateDefaultAccountMutation.mutate({ mailAccountId: selectedDefaultAccount })
  }

  const handleToggleActive = (id: string) => {
    setToggledIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/inbox" />}>
                <Home className="size-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/settings" />}>설정</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>계정</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* 계정 정보 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">계정 정보</h2>
          <div className="flex items-center justify-between rounded-lg border border-border bg-background p-5">
            <div className="space-y-1">
              <p className="font-medium">{isUserPending ? "불러오는 중..." : (user?.name ?? "-")}</p>
              <p className="text-sm text-muted-foreground">아이디: {user?.username ?? "-"}</p>
              <p className="text-sm text-muted-foreground">플랜: {user?.plan ?? "-"}</p>
            </div>
            {/* TODO: 회원 탈퇴 API 연동 */}
            <Button variant="outline" className="ml-2 px-8" disabled>
              회원 탈퇴
            </Button>
          </div>
        </section>

        {/* Default 계정 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Default 계정</h2>
          <p className="text-sm text-muted-foreground">계정 중 하나를 기본 발신 계정으로 선택할 수 있습니다.</p>
          <div className="flex items-center gap-3">
            <Select
              value={selectedDefaultAccount ?? ""}
              onValueChange={(id) => setDefaultAccount(id)}
            >
              <SelectTrigger className="w-72">
                <SelectValue>
                  {(value: string) =>
                    accounts.find((mailAccount) => mailAccount.id === value)?.emailAddress ?? ""
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="start" alignItemWithTrigger={false}>
                {accounts.map((mailAccount) => (
                  <SelectItem key={mailAccount.id} value={mailAccount.id} className="px-3 py-2">
                    {mailAccount.emailAddress}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="px-4"
              onClick={handleSaveDefaultAccount}
              disabled={
                !selectedDefaultAccount ||
                selectedDefaultAccount === user?.defaultMailAccountId ||
                updateDefaultAccountMutation.isPending
              }
            >
              {updateDefaultAccountMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </div>
        </section>

        {/* 계정 관리 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">계정 관리</h2>
          <div className="rounded-lg border border-border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">아이콘</TableHead>
                  <TableHead className="w-full">메일주소</TableHead>
                  <TableHead className="text-center">활성화</TableHead>
                  <TableHead className="text-center">삭제</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isAccountsPending && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      계정 목록을 불러오는 중입니다.
                    </TableCell>
                  </TableRow>
                )}
                {isAccountsError && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-destructive">
                      계정 목록을 불러오지 못했습니다.
                    </TableCell>
                  </TableRow>
                )}
                {!isAccountsPending && !isAccountsError && accounts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      등록된 계정이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
                {accounts.map((mailAccount) => (
                  <TableRow key={mailAccount.id}>
                    <TableCell className="text-center">
                      {mailAccount.icon ? (
                        <div
                          className="mx-auto flex size-8 items-center justify-center rounded-full"
                          style={{ backgroundColor: mailAccount.color || "#6B7280" }}
                        >
                          <AccountIcon name={mailAccount.icon} className="size-4 text-white" />
                        </div>
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
                          onCheckedChange={() => handleToggleActive(mailAccount.id)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Button variant="ghost" size="icon-sm" disabled>
                          <Trash2 className="size-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* 계정 추가하기 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">계정 추가하기</h2>
          <p className="text-sm text-muted-foreground">
            아래 버튼을 눌러 계정의 별칭, 아이콘, 색상을 선택한 후 계정에 로그인하여 계정을 추가해보세요.
          </p>
          <div>
            <AddAccountDialog>
              <Button variant="outline" className="px-8">
                <Plus className="size-4" />
                계정 추가
              </Button>
            </AddAccountDialog>
          </div>
        </section>
      </div>
    </div>
  )
}
