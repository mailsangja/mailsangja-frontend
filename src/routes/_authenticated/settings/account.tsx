import { useMemo, useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowLeft, Home, Trash2, LogOut, Plus } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { useMailAccounts } from "@/queries/mail-accounts"
import { useUser } from "@/queries/user"


export const Route = createFileRoute("/_authenticated/settings/account")({
  component: SettingsAccountPage,
})

function SettingsAccountPage() {
  const { data: user, isPending: isUserPending } = useUser()
  const { data: fetchedAccounts, isPending: isAccountsPending, isError: isAccountsError } = useMailAccounts()
  const [toggledIds, setToggledIds] = useState<Set<string>>(new Set())

  const accounts = useMemo(() => {
    if (!fetchedAccounts) return []
    return fetchedAccounts.map((acc) =>
      toggledIds.has(acc.id) ? { ...acc, isActive: !acc.isActive } : acc
    )
  }, [fetchedAccounts, toggledIds])

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
      <main className="flex-1 overflow-y-auto p-8">
        <div>
          <Link to="/settings" className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
            <ArrowLeft className="size-5" />
          </Link>
        </div>
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
                <BreadcrumbLink render={<Link to="/settings" />}>
                  설정
                </BreadcrumbLink>
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
                <p className="text-sm text-muted-foreground">{user?.username ?? "-"}</p>
                <p className="text-sm text-muted-foreground">{user?.plan ?? "-"}</p>
              </div>
              {/* TODO: 회원 탈퇴 API 연동 */}
              <Link to="/" className={cn(buttonVariants({ variant: "outline", size: "default" }), "ml-2 px-8")}>
                회원 탈퇴
              </Link>
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
                  {isAccountsError && !isAccountsPending && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-destructive">
                        계정 목록을 불러오지 못했습니다.
                      </TableCell>
                    </TableRow>
                  )}
                  {accounts.map((MailAccount) => (
                    <TableRow key={MailAccount.id}>
                      <TableCell className="text-center text-lg">
                        {MailAccount.icon || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{MailAccount.emailAddress}</span>
                          <span className="text-xs text-muted-foreground">{MailAccount.alias}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Switch
                            checked={MailAccount.isActive}
                            onCheckedChange={() =>
                              handleToggleActive(MailAccount.id)
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled
                          >
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
              {/* TODO: 링크 수정 */}
              <Link to="/settings" className={cn(buttonVariants({ variant: "outline", size: "default" }), "px-8")}>
                <Plus className="size-4" />
                계정 추가
              </Link>
            </div>
          </section>

          {/* 로그아웃 버튼 */}
          <div className="flex justify-end pt-8">
            <Link to="/login" className={cn(buttonVariants({ variant: "default" }), "ml-2")}>
              로그아웃
              <LogOut className="size-4" />
            </Link>
          </div>
        </div>
      </main>
  )
}
