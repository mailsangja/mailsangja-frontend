import { useEffect, useRef, useState } from "react"
import { ArrowUp, Loader2, Sparkles, Square, WandSparkles, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatNumber } from "@/lib/date"
import { cn } from "@/lib/utils"
import { m } from "@/paraglide/messages"
import { useAiModels } from "@/queries/ai"
import type { MailDraftStreamPhase, MailDraftUsage } from "@/types/email"

interface ComposeAiDraftPanelProps {
  prompt: string
  onPromptChange: (value: string) => void
  isDraftContentEmpty: boolean
  isStreaming: boolean
  phase: MailDraftStreamPhase
  usage: MailDraftUsage | null
  onGenerate: (model: string | null) => void
  onStop: () => void
}

const AUTO_MODEL_VALUE = "__auto__"

function getPhaseLabel(phase: MailDraftStreamPhase) {
  if (phase === "subject") return m.compose_ai_phase_subject()
  if (phase === "body") return m.compose_ai_phase_body()
  if (phase === "done") return m.compose_ai_phase_done()
  if (phase === "aborted") return m.compose_ai_phase_aborted()
  if (phase === "error") return m.compose_ai_phase_error()

  return ""
}

function formatUsage(usage: MailDraftUsage | null) {
  if (!usage) return null

  return `${formatNumber(usage.totalTokens)} tokens`
}

function formatModelLabel(modelId: string) {
  return modelId
    .split("/")
    .at(-1)!
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function ComposeAiDraftPanel({
  prompt,
  onPromptChange,
  isDraftContentEmpty,
  isStreaming,
  phase,
  usage,
  onGenerate,
  onStop,
}: ComposeAiDraftPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [model, setModel] = useState<string>(AUTO_MODEL_VALUE)
  const aiModels = useAiModels()
  const inputRef = useRef<HTMLInputElement>(null)
  const wasDraftContentEmptyRef = useRef(isDraftContentEmpty)
  const wasStreamingRef = useRef(false)

  useEffect(() => {
    if (isOpen && !isStreaming) {
      inputRef.current?.focus()
    }
  }, [isOpen, isStreaming])

  useEffect(() => {
    const didFinishStreaming = wasStreamingRef.current && !isStreaming && phase === "done"
    const didStartWriting = wasDraftContentEmptyRef.current && !isDraftContentEmpty && !isStreaming

    if (didFinishStreaming || didStartWriting) {
      setIsOpen(false)
    }

    wasDraftContentEmptyRef.current = isDraftContentEmpty
    wasStreamingRef.current = isStreaming
  }, [isDraftContentEmpty, isStreaming, phase])

  const selectedModel = model === AUTO_MODEL_VALUE ? null : model
  const modelItems = [
    { value: AUTO_MODEL_VALUE, label: "Auto" },
    ...(aiModels.data?.models.map((model) => ({ value: model.id, label: formatModelLabel(model.id) })) ?? []),
  ]
  const promptText = prompt.trim()
  const usageText = formatUsage(usage)
  const isPanelVisible = isOpen || isStreaming
  const isFloatingEntryVisible = isPanelVisible || isDraftContentEmpty
  const phaseLabel = getPhaseLabel(phase)
  const actionLabel = isStreaming
    ? m.compose_ai_stop_generation()
    : !isPanelVisible
      ? m.compose_ai_open()
      : promptText
        ? m.compose_ai_draft()
        : m.compose_ai_close()

  const handleActionClick = () => {
    if (isStreaming) {
      onStop()
      return
    }

    if (!isPanelVisible) {
      setIsOpen(true)
      return
    }

    if (!promptText) {
      setIsOpen(false)
      return
    }

    onGenerate(selectedModel)
  }

  return (
    <>
      <div
        className={cn(
          "pointer-events-none absolute z-40 flex justify-end transition-all duration-150 ease-out",
          isPanelVisible ? "right-3.5 bottom-4" : "right-3.5 bottom-4 sm:right-7 sm:bottom-8",
          isFloatingEntryVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"
        )}
        aria-hidden={!isFloatingEntryVisible}
        inert={!isFloatingEntryVisible}
      >
        <div className="group pointer-events-auto relative">
          {!isPanelVisible && (
            <span
              aria-hidden
              className="absolute -inset-1.5 -z-10 rounded-full bg-[conic-gradient(from_0deg,var(--primary),var(--chart-1),var(--ring),var(--primary))] opacity-0 blur-md transition-opacity duration-300 group-hover:[animation:spin_3s_linear_infinite] group-hover:opacity-70"
            />
          )}
          <Button
            type="button"
            size="icon-lg"
            onClick={handleActionClick}
            aria-label={actionLabel}
            aria-expanded={isPanelVisible}
            className={cn(
              "rounded-full border-transparent shadow-lg shadow-primary/25 transition-all duration-150 ease-out group-active:scale-95 focus-visible:border-transparent focus-visible:ring-0",
              isPanelVisible ? "size-9" : "size-12",
              !isPanelVisible &&
                !isStreaming &&
                "bg-linear-to-br from-primary to-primary/80 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/40",
              isPanelVisible && !promptText && "bg-muted text-muted-foreground hover:bg-muted/80",
              isPanelVisible && promptText && "bg-primary text-primary-foreground hover:bg-primary/90",
              isStreaming && "bg-background text-foreground hover:bg-background"
            )}
          >
            {isStreaming ? (
              <Square className="size-4 fill-current" />
            ) : isPanelVisible && !promptText ? (
              <X className="size-4" />
            ) : isPanelVisible ? (
              <ArrowUp className="size-4" />
            ) : (
              <WandSparkles className="size-6 transition-transform duration-300 group-hover:rotate-360" />
            )}
          </Button>
        </div>
      </div>

      <section
        className={cn(
          "pointer-events-auto absolute right-2 bottom-2 z-30 w-[calc(100%-1rem)] max-w-3xl origin-bottom-right transition-all duration-150 ease-out",
          isPanelVisible
            ? "translate-x-0 translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-x-3 translate-y-6 scale-75 opacity-0"
        )}
        aria-label={m.compose_ai_draft()}
        aria-hidden={!isPanelVisible}
        inert={!isPanelVisible}
      >
        <div className="w-full overflow-hidden rounded-lg border bg-muted/60 shadow-xl ring-1 shadow-foreground/10 ring-foreground/5">
          <div className="relative h-9 px-3">
            <div
              className={cn(
                "absolute inset-y-0 left-3 flex items-center transition-all duration-300 ease-out",
                isStreaming ? "pointer-events-none -translate-y-1 opacity-0" : "translate-y-0 opacity-100"
              )}
            >
              <Select
                value={model}
                onValueChange={(value) => setModel(value ?? AUTO_MODEL_VALUE)}
                items={modelItems}
                disabled={isStreaming}
              >
                <SelectTrigger
                  size="sm"
                  className="-ml-2 h-8 min-w-30 gap-1.5 border-transparent bg-transparent text-muted-foreground hover:bg-foreground/5 hover:text-foreground focus-visible:ring-0 dark:bg-transparent"
                  aria-label={m.compose_ai_model_select()}
                >
                  <Sparkles className="size-4 text-primary" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start" className="min-w-40">
                  <SelectGroup>
                    {modelItems.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="max-w-64">
                        <span className="block max-w-full truncate">{option.label}</span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div
              className={cn(
                "absolute inset-y-0 left-3 flex items-center gap-2 transition-all duration-300 ease-out",
                isStreaming ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"
              )}
              aria-live="polite"
            >
              <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
              <span className="truncate text-sm font-medium text-foreground">{phaseLabel}</span>
            </div>

            {!isStreaming && usageText ? (
              <span className="absolute inset-y-0 right-3 hidden items-center text-xs text-muted-foreground sm:flex">
                {usageText}
              </span>
            ) : null}
          </div>

          <Input
            ref={inputRef}
            value={prompt}
            onChange={(event) => onPromptChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.nativeEvent.isComposing && promptText) {
                event.preventDefault()
                onGenerate(selectedModel)
              }
            }}
            placeholder={m.compose_ai_prompt_placeholder()}
            aria-label={m.compose_ai_prompt_label()}
            disabled={isStreaming}
            className="h-13 border-0 bg-popover px-4 text-base shadow-none focus-visible:ring-0"
          />
        </div>
      </section>
    </>
  )
}
