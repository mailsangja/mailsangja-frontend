import { Mail } from "lucide-react"

export function ReferencePlaceholder() {
  return (
    <>
      <div className="flex h-11 shrink-0 items-center border-b px-4">
        <h1 className="text-sm font-medium">참고 메일</h1>
      </div>
      <div className="flex min-h-full flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <Mail className="size-7 text-muted-foreground/60" />
        </div>
        <div>
          <p className="font-medium text-muted-foreground">레퍼런스 메일</p>
          <p className="mt-1 text-sm text-muted-foreground">메일 작성시 참고할 메일이 여기 표시됩니다</p>
        </div>
      </div>
    </>
  )
}
