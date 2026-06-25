import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { LabelRuleGroupList } from "@/components/label/label-condition-list"
import { LabelDeleteDialog } from "@/components/label/label-delete-dialog"
import { LabelRuleEditor } from "@/components/label/label-rule-editor"
import { getErrorMessage } from "@/lib/http-error"
import { useUpdateLabel } from "@/mutations/labels"
import { useLabelDetail } from "@/queries/labels"
import { m } from "@/paraglide/messages"
import { type LabelDetail } from "@/types/label"

export function LabelSettingsPanel({ labelId, onDeleted }: { labelId: string; onDeleted: () => void }) {
  const { data: label, isPending, isError } = useLabelDetail(labelId)

  if (isPending) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (isError || !label) {
    return <p className="p-4 text-sm text-destructive">{m.label_list_error()}</p>
  }

  return <LabelSettingsContent key={labelId} labelId={labelId} label={label} onDeleted={onDeleted} />
}

function LabelSettingsContent({
  labelId,
  label,
  onDeleted,
}: {
  labelId: string
  label: LabelDetail
  onDeleted: () => void
}) {
  const updateLabel = useUpdateLabel()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isEditingRules, setIsEditingRules] = useState(false)

  function handleSensitiveChange(isSensitive: boolean) {
    updateLabel.mutate(
      { labelId, data: { isSensitive } },
      {
        onError: (e) => toast.error(getErrorMessage(e, m.label_sensitive_update_error())),
      }
    )
  }

  const groups = label.rule?.groups ?? []

  return (
    <div className="flex flex-col gap-5 px-6 py-4">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">{m.label_rules_title()}</h3>
          {!isEditingRules && (
            <Button variant="outline" size="sm" onClick={() => setIsEditingRules(true)}>
              <Pencil data-icon="inline-start" />
              {m.label_rule_edit()}
            </Button>
          )}
        </div>

        {isEditingRules ? (
          <LabelRuleEditor
            labelId={labelId}
            label={label}
            onCancel={() => setIsEditingRules(false)}
            onSaved={() => setIsEditingRules(false)}
          />
        ) : (
          <>
            {groups.length > 0 ? (
              <LabelRuleGroupList groups={groups} groupClassName="shadow-none" />
            ) : (
              <p className="text-sm text-muted-foreground">{m.label_rule_empty()}</p>
            )}
          </>
        )}
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <Switch
            id={`label-sensitive-${labelId}`}
            checked={label.isSensitive}
            onCheckedChange={handleSensitiveChange}
            disabled={updateLabel.isPending}
            aria-labelledby={`label-sensitive-title-${labelId}`}
          />
          <div className="min-w-0">
            <p id={`label-sensitive-title-${labelId}`} className="text-sm font-medium">
              {m.label_sensitive_title()}
            </p>
            <p className="text-xs text-muted-foreground">{m.label_sensitive_description()}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:text-destructive"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2 data-icon="inline-start" />
          {m.label_delete_title()}
        </Button>
      </section>

      <LabelDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        label={label}
        onSuccess={onDeleted}
      />
    </div>
  )
}
