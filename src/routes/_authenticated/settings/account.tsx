import { useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Plus, Trash2 } from "lucide-react"

import { AddAccountDialog } from "@/components/add-account-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

  const defaultAccountItems = useMemo(
    () =>
      accounts.map((mailAccount) => ({
        value: mailAccount.id,
        label: mailAccount.emailAddress,
      })),
    [accounts]
  )

  const selectedDefaultAccount = defaultAccount ?? user?.defaultMailAccountId ?? null

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
    <div className="flex flex-col gap-6 pb-6">
      <Card>
        <CardHeader>
          <CardTitle>계정 정보</CardTitle>
          <CardDescription>현재 로그인한 사용자와 구독 플랜 정보를 확인합니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="font-medium">{isUserPending ? "불러오는 중..." : (user?.name ?? "-")}</p>
            <p className="text-sm text-muted-foreground">아이디: {user?.username ?? "-"}</p>
            <p className="text-sm text-muted-foreground">플랜: {user?.plan ?? "-"}</p>
          </div>
          <Button variant="outline" disabled>
            회원 탈퇴
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>기본 메일 계정</CardTitle>
          <CardDescription>계정 중 하나를 기본 발신 계정으로 선택할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Select
            value={selectedDefaultAccount}
            onValueChange={setDefaultAccount}
            items={defaultAccountItems}
            disabled={isAccountsPending || accounts.length === 0}
          >
            <SelectTrigger className="w-72" aria-label="기본 발신 계정 선택">
              <SelectValue
                placeholder={isAccountsPending ? "계정 목록을 불러오는 중..." : "기본 메일 계정을 선택하세요"}
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
            {updateDefaultAccountMutation.isPending ? "저장 중..." : "저장"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>계정 관리</CardTitle>
          <CardDescription>연결된 메일 계정의 활성화 상태와 별칭을 확인합니다.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
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
          <CardTitle>계정 추가하기</CardTitle>
          <CardDescription>
            계정의 별칭, 아이콘, 색상을 선택한 뒤 로그인 절차를 거쳐 메일 계정을 연결할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddAccountDialog>
            <Button variant="outline">
              <Plus data-icon="inline-start" />
              계정 추가
            </Button>
          </AddAccountDialog>
        </CardContent>
      </Card>
    </div>
  )
}
