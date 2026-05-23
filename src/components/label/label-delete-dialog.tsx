import { useQuery } from "@tanstack/react-query"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useDeleteLabel } from "@/mutations/labels"
import { emailQueries } from "@/queries/emails"
import { labelQueries } from "@/queries/labels"
import { LABEL_CONDITION_FIELD_LABELS, LABEL_CONDITION_OPERATOR_LABELS, type LabelListItem } from "@/types/label"

interface LabelDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  label: LabelListItem
}

export function LabelDeleteDialog({ open, onOpenChange, label }: LabelDeleteDialogProps) {
  const navigate = useNavigate()
  const search = useSearch({ strict: false })
  const deleteLabel = useDeleteLabel()
  const { data: labelDetail, isLoading: isLoadingDetail } = useQuery({
    ...labelQueries.detail(label.id),
    enabled: open,
  })
  const { data: threadCountData, isLoading: isLoadingCount } = useQuery({
    ...emailQueries.labelCount(label.id),
    enabled: open,
  })
  const isInfoLoading = isLoadingDetail || isLoadingCount

  function handleDelete() {
    deleteLabel.mutate(label.id, {
      onSuccess: () => {
        onOpenChange(false)
        toast.success(`${label.name} 라벨이 삭제되었습니다`)
        if ("labelId" in search && search.labelId === label.id) {
          void navigate({ to: "/mail/$mailbox", params: { mailbox: "inbox" }, replace: true })
        }
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>라벨 삭제</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {isInfoLoading ? (
            <div className="space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <>
              {threadCountData?.totalCount != null && (
                <p>
                  {label.name} 라벨을 대화 {threadCountData.totalCount}개에서 제거하고 삭제하시겠습니까?
                </p>
              )}
              {labelDetail?.rule?.groups && (
                <div className="space-y-1.5">
                  <div className="space-y-1 rounded-md border bg-muted/40 px-3 py-2 text-xs">
                    {labelDetail.rule.groups.flatMap((group, gi) => [
                      ...(gi > 0 ? [<hr key={`sep-${gi}`} className="my-1 border-border" />] : []),
                      ...group.conditions.map((cond, ci) => (
                        <p key={`${gi}-${ci}`} className="text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {LABEL_CONDITION_FIELD_LABELS[cond.field]}
                          </span>{" "}
                          {LABEL_CONDITION_OPERATOR_LABELS[cond.operator]}{" "}
                          {cond.operator !== "BOOLEAN" && (
                            <span className="font-mono text-foreground">&quot;{cond.value}&quot;</span>
                          )}
                        </p>
                      )),
                    ])}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteLabel.isPending || isInfoLoading}>
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
