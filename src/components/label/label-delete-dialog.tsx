import { useQuery } from "@tanstack/react-query"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getErrorMessage } from "@/lib/http-error"
import { useDeleteLabel } from "@/mutations/labels"
import { emailQueries } from "@/queries/emails"
import { labelQueries } from "@/queries/labels"
import { type Label } from "@/types/label"
import { LabelConditionList } from "@/components/label/label-condition-list"
import { m } from "@/paraglide/messages"

interface LabelDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  label: Label
  onSuccess?: () => void
}

export function LabelDeleteDialog({ open, onOpenChange, label, onSuccess }: LabelDeleteDialogProps) {
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
        toast.warning(m.label_delete_success({ name: label.name }))
        if (onSuccess) {
          onSuccess()
        } else if ("labelId" in search && search.labelId === label.id) {
          void navigate({ to: "/mail/$mailbox", params: { mailbox: "inbox" }, replace: true })
        }
      },
      onError: (e) => toast.error(getErrorMessage(e, m.label_delete_error())),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.label_delete_title()}</DialogTitle>
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
                <p>{m.label_delete_confirmation_with_count({ name: label.name, count: threadCountData.totalCount })}</p>
              )}
              {labelDetail?.rule?.groups && (
                <div className="flex flex-col gap-1.5 rounded-xl border px-4 py-3">
                  {labelDetail.rule.groups.map((group, gi) => (
                    <div key={gi}>
                      {gi > 0 && <hr className="my-1 border-border" />}
                      <LabelConditionList conditions={group.conditions} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {m.common_cancel()}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteLabel.isPending || isInfoLoading}>
            {m.common_delete()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
