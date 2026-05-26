export function LightPreview() {
  return (
    <div className="w-full overflow-hidden rounded-lg">
      <div className="flex h-4 items-center gap-1 bg-slate-50 px-2">
        <div className="size-1.5 rounded-full bg-slate-300" />
        <div className="h-1 w-10 rounded-full bg-slate-200" />
      </div>
      <div className="flex gap-1.5 bg-white p-1.5">
        <div className="flex w-5 flex-col gap-1">
          <div className="h-1.5 rounded bg-slate-100" />
          <div className="h-1.5 rounded bg-slate-100" />
          <div className="h-1.5 rounded bg-slate-200" />
          <div className="h-1.5 rounded bg-slate-100" />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <div className="h-1.5 rounded bg-slate-100" />
          <div className="h-1.5 w-3/4 rounded bg-slate-200" />
          <div className="h-1.5 rounded bg-slate-100" />
          <div className="h-1.5 w-3/4 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  )
}

export function SystemPreview() {
  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <div className="absolute inset-0 left-0 w-1/2 bg-white" />
      <div className="absolute inset-0 left-1/2" style={{ background: "var(--tds-grey-900)" }} />
      <div className="absolute inset-y-0 left-1/2 w-px" style={{ background: "var(--tds-grey-600)" }} />
      <div className="relative">
        <div
          className="flex h-4 items-center gap-1 px-2"
          style={{ background: "linear-gradient(90deg, #f8fafc 50%, var(--tds-grey-900) 50%)" }}
        >
          <div className="size-1.5 rounded-full" style={{ background: "var(--tds-grey-400)" }} />
          <div className="h-1 w-10 rounded-full" style={{ background: "var(--tds-grey-400)", opacity: 0.5 }} />
        </div>
        <div className="flex gap-1.5 p-1.5">
          <div className="flex w-5 flex-col gap-1">
            <div className="h-1.5 rounded" style={{ background: "var(--tds-grey-400)", opacity: 0.5 }} />
            <div className="h-1.5 rounded" style={{ background: "var(--tds-grey-400)", opacity: 0.5 }} />
            <div className="h-1.5 rounded" style={{ background: "var(--tds-grey-400)", opacity: 0.5 }} />
            <div className="h-1.5 rounded" style={{ background: "var(--tds-grey-400)", opacity: 0.35 }} />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <div className="h-1.5 rounded" style={{ background: "var(--tds-grey-400)", opacity: 0.5 }} />
            <div className="h-1.5 w-3/4 rounded" style={{ background: "var(--tds-grey-400)", opacity: 0.35 }} />
            <div className="h-1.5 rounded" style={{ background: "var(--tds-grey-400)", opacity: 0.5 }} />
            <div className="h-1.5 w-3/4 rounded" style={{ background: "var(--tds-grey-400)", opacity: 0.35 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// 다크 테마의 고정 미리보기 — 현재 테마와 무관하게 항상 어두운 색상을 유지해야 합니다.
// index.css의 --tds-grey 팔레트를 직접 참조합니다.
export function DarkPreview() {
  return (
    <div className="w-full overflow-hidden rounded-lg">
      <div className="flex h-4 items-center gap-1 px-2" style={{ background: "var(--tds-grey-900)" }}>
        <div className="size-1.5 rounded-full" style={{ background: "var(--tds-grey-700)" }} />
        <div className="h-1 w-10 rounded-full" style={{ background: "var(--tds-grey-700)" }} />
      </div>
      <div className="flex gap-1.5 p-1.5" style={{ background: "var(--tds-grey-900)" }}>
        <div className="flex w-5 flex-col gap-1">
          <div className="h-1.5 rounded" style={{ background: "var(--tds-grey-800)" }} />
          <div className="h-1.5 rounded" style={{ background: "var(--tds-grey-800)" }} />
          <div className="h-1.5 rounded" style={{ background: "var(--tds-grey-700)" }} />
          <div className="h-1.5 rounded" style={{ background: "var(--tds-grey-800)" }} />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <div className="h-1.5 rounded" style={{ background: "var(--tds-grey-700)" }} />
          <div className="h-1.5 w-3/4 rounded" style={{ background: "var(--tds-grey-800)" }} />
          <div className="h-1.5 rounded" style={{ background: "var(--tds-grey-700)" }} />
          <div className="h-1.5 w-3/4 rounded" style={{ background: "var(--tds-grey-800)" }} />
        </div>
      </div>
    </div>
  )
}
