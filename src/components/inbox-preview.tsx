import { cn } from "@/lib/utils"

export function InboxSingleLinePreview() {
  return (
    <div className="w-full overflow-hidden rounded-lg bg-slate-50">
      <div className="flex h-3.5 items-center gap-1 bg-slate-100 px-2">
        <div className="h-1 w-6 rounded-full bg-slate-300" />
      </div>
      <div className="flex flex-col divide-y divide-slate-100 bg-white">
        {[
          { bold: true, accent: false },
          { bold: true, accent: true },
          { bold: false, accent: false },
          { bold: false, accent: false },
        ].map(({ bold, accent }, i) => (
          <div key={i} className={cn("flex items-center gap-1.5 px-2 py-1", accent && "bg-sky-50")}>
            <div className={cn("size-2 shrink-0 rounded-full", bold ? "bg-blue-300" : "bg-slate-200")} />
            <div className={cn("h-1 w-5 shrink-0 rounded", bold ? "bg-slate-500" : "bg-slate-300")} />
            <div className={cn("h-1 flex-1 rounded", bold ? "bg-slate-300" : "bg-slate-200")} />
            <div className="h-1 w-3 shrink-0 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function InboxTwoLinePreview() {
  return (
    <div className="w-full overflow-hidden rounded-lg bg-slate-50">
      <div className="flex h-3.5 items-center gap-1 bg-slate-100 px-2">
        <div className="h-1 w-6 rounded-full bg-slate-300" />
      </div>
      <div className="flex flex-col divide-y divide-slate-100 bg-white">
        {[
          { bold: true, accent: false, subWidth: "3/4" },
          { bold: true, accent: true, subWidth: "1/2" },
          { bold: false, accent: false, subWidth: "2/3" },
        ].map(({ bold, accent, subWidth }, i) => (
          <div key={i} className={cn("flex gap-1.5 px-2 py-1", accent && "bg-sky-50")}>
            <div className={cn("mt-0.5 size-2 shrink-0 rounded-full", bold ? "bg-blue-300" : "bg-slate-200")} />
            <div className="flex flex-1 flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <div className={cn("h-1 w-5 rounded", bold ? "bg-slate-500" : "bg-slate-300")} />
                <div className="h-1 w-3 rounded bg-slate-200" />
              </div>
              <div
                className={cn(
                  "h-1 rounded bg-slate-200",
                  subWidth === "3/4" ? "w-3/4" : subWidth === "1/2" ? "w-1/2" : "w-2/3"
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
