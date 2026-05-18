import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react"
import { EmailEditor, type EmailEditorRef } from "@react-email/editor"
import {
  EDITOR_THEMES,
  extendTheme,
  setCurrentTheme,
  setGlobalStyles,
  themeStylesToPanelOverrides,
} from "@react-email/editor/plugins"
import type { JSONContent } from "@tiptap/core"
import { Loader2, Paperclip, X } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

import { LocalAttachmentChip } from "@/components/attachment/local-chip"
import { ComposeAiDraftPanel } from "@/components/compose/compose-ai-draft-panel"
import { ComposeEditorToolbar, type ComposeEditor } from "@/components/compose/compose-editor-toolbar"
import { ComposeSendPreviewDialog, type ComposeSendPreviewData } from "@/components/compose/compose-send-preview-dialog"
import { RecipientInput } from "@/components/compose/recipient-input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MailDraftStreamError, streamMailDraft } from "@/api/emails"
import { getErrorMessage } from "@/lib/http-error"
import { formatMailAddressesForSend, parseMailRecipients } from "@/lib/mail-address"
import { cn } from "@/lib/utils"
import { useSendMail } from "@/mutations/emails"
import { useActiveMailAccounts } from "@/queries/mail-accounts"
import { useUser } from "@/queries/user"
import type { ComposeInlineImage, MailAddress, MailDraftStreamPhase, MailDraftUsage } from "@/types/email"

interface ComposeEmailProps {
  fromAddress: string | null
  onFromAddressChange: (value: string | null) => void
  messageId?: string
  initialTo?: string
  initialSubject?: string
  initialCc?: string
}

interface PendingInlineImage extends ComposeInlineImage {
  fileKey: string
  id: string
  objectUrl: string
}

interface ComposeImageMetadata {
  alignment: "left" | "center" | "right" | null
}

interface RecipientFieldProps {
  id: string
  label: string
  recipients: MailAddress[]
  onRecipientsChange: (recipients: MailAddress[]) => void
  disabled?: boolean
  children?: ReactNode
}

const MAX_SEND_FILE_BYTES = 20 * 1024 * 1024
const EDITOR_THEME = extendTheme("basic", {
  body: { backgroundColor: "transparent" },
  container: {
    backgroundColor: "#fff",
    padding: "1rem",
  },
  paragraph: {
    paddingTop: "0.25em",
    paddingBottom: "0.25em",
  },
})
const EDITOR_THEME_STYLES = themeStylesToPanelOverrides(EDITOR_THEME.styles, EDITOR_THEMES.basic)

function createInlineImageCid() {
  return `inline-${crypto.randomUUID()}`
}

function getFilesSize(files: readonly File[]) {
  return files.reduce((total, file) => total + file.size, 0)
}

function getFileKey(file: File) {
  return [file.name, file.type, file.size, file.lastModified].join(":")
}

function getInlineImagesSize(inlineImages: readonly PendingInlineImage[]) {
  return getFilesSize(Array.from(new Map(inlineImages.map((image) => [image.fileKey, image.file])).values()))
}

function getSendFileSize(attachments: readonly File[], inlineImages: readonly PendingInlineImage[]) {
  return getFilesSize(attachments) + getInlineImagesSize(inlineImages)
}

function getGlobalContentData(content: JSONContent) {
  const globalContent = content.content?.find((node) => node.type === "globalContent")
  const data = globalContent?.attrs?.data

  return data && typeof data === "object" && !Array.isArray(data) ? (data as Record<string, unknown>) : null
}

function hasEditorTheme(content: JSONContent) {
  const data = getGlobalContentData(content)

  return data?.theme === (EDITOR_THEME.extends ?? "basic") && Array.isArray(data.styles)
}

function applyEditorTheme(editor: ComposeEditor | null, content?: JSONContent) {
  if (!editor) return
  if (content && hasEditorTheme(content)) return

  setCurrentTheme(editor, EDITOR_THEME.extends ?? "basic")
  setGlobalStyles(editor, EDITOR_THEME_STYLES)
}

function normalizeImageAlignment(value: unknown): ComposeImageMetadata["alignment"] {
  return value === "left" || value === "center" || value === "right" ? value : null
}

function collectImageMetadata(content: JSONContent) {
  const metadata = new Map<string, ComposeImageMetadata>()

  const visit = (node: JSONContent) => {
    if (node.type === "image" && typeof node.attrs?.src === "string") {
      metadata.set(node.attrs.src, {
        alignment: normalizeImageAlignment(node.attrs.align ?? node.attrs.alignment),
      })
    }

    for (const child of node.content ?? []) {
      visit(child)
    }
  }

  visit(content)

  return metadata
}

function mergeInlineStyle(element: HTMLElement, styles: Record<string, string>) {
  for (const [property, value] of Object.entries(styles)) {
    element.style.setProperty(property, value)
  }
}

function isSingleImageLink(element: Element | null, imageElement: HTMLImageElement): element is HTMLAnchorElement {
  return (
    element instanceof HTMLAnchorElement && element.children.length === 1 && element.firstElementChild === imageElement
  )
}

function applyImageAlignment(
  document: Document,
  imageElement: HTMLImageElement,
  alignment: ComposeImageMetadata["alignment"]
) {
  if (!alignment) return

  mergeInlineStyle(imageElement, {
    display: "inline-block",
    "margin-left": "0",
    "margin-right": "0",
    "vertical-align": "top",
  })

  const parentElement = imageElement.parentElement
  const alignmentTarget: HTMLElement = isSingleImageLink(parentElement, imageElement) ? parentElement : imageElement

  if (!alignmentTarget.parentNode) {
    return
  }

  const table = document.createElement("table")
  const tbody = document.createElement("tbody")
  const row = document.createElement("tr")
  const cell = document.createElement("td")

  table.setAttribute("role", "presentation")
  table.setAttribute("border", "0")
  table.setAttribute("cellpadding", "0")
  table.setAttribute("cellspacing", "0")
  table.setAttribute("width", "100%")
  mergeInlineStyle(table, {
    width: "100%",
    "border-collapse": "collapse",
  })
  cell.setAttribute("align", alignment)
  mergeInlineStyle(cell, {
    "text-align": alignment,
    "line-height": "0",
  })

  alignmentTarget.parentNode.insertBefore(table, alignmentTarget)
  cell.appendChild(alignmentTarget)
  row.appendChild(cell)
  tbody.appendChild(row)
  table.appendChild(tbody)
}

function applyListIndentation(document: Document) {
  for (const listElement of Array.from(document.querySelectorAll<HTMLElement>("ul, ol"))) {
    mergeInlineStyle(listElement, {
      "padding-bottom": "0.5rem",
      "padding-left": "0.25rem",
    })
  }
}

function textToEditorContent(text: string): JSONContent {
  const lines = text.replace(/\r\n/g, "\n").split("\n")

  return {
    type: "doc",
    content: lines.map((line) => ({
      type: "paragraph",
      content: line ? [{ type: "text", text: line }] : undefined,
    })),
  }
}

const CONTENTFUL_EDITOR_NODE_TYPES = new Set(["button", "horizontalRule", "image", "section", "table"])

function hasVisibleEditorContent(node: JSONContent): boolean {
  if (node.type === "globalContent" || node.type === "hardBreak") {
    return false
  }

  if (typeof node.text === "string") {
    return node.text.trim().length > 0
  }

  if (node.type && CONTENTFUL_EDITOR_NODE_TYPES.has(node.type)) {
    return true
  }

  return (node.content ?? []).some(hasVisibleEditorContent)
}

function isEditorContentEmpty(content: JSONContent) {
  return !hasVisibleEditorContent(content)
}

function buildMailContentWithImages(
  html: string,
  inlineImages: readonly PendingInlineImage[],
  imageMetadata: ReadonlyMap<string, ComposeImageMetadata>,
  options: { replaceInlineImageSrcWithCid: boolean }
) {
  const parser = new DOMParser()
  const document = parser.parseFromString(html, "text/html")
  const imageByObjectUrl = new Map(inlineImages.map((image) => [image.objectUrl, image]))
  const usedInlineImages: PendingInlineImage[] = []
  const usedInlineImageCids = new Set<string>()

  for (const imageElement of Array.from(document.querySelectorAll<HTMLImageElement>("img[src]"))) {
    const src = imageElement.getAttribute("src")
    if (!src) continue

    applyImageAlignment(document, imageElement, imageMetadata.get(src)?.alignment ?? null)

    const inlineImage = imageByObjectUrl.get(src)
    if (!inlineImage) continue

    if (options.replaceInlineImageSrcWithCid) {
      imageElement.setAttribute("src", `cid:${inlineImage.cid}`)
    }

    if (!usedInlineImageCids.has(inlineImage.cid)) {
      usedInlineImages.push(inlineImage)
      usedInlineImageCids.add(inlineImage.cid)
    }
  }

  applyListIndentation(document)

  const isFullHtmlDocument = /^\s*(<!doctype|<html[\s>])/i.test(html)
  const content = isFullHtmlDocument
    ? `<!doctype html>\n${document.documentElement.outerHTML}`
    : document.body.innerHTML

  return {
    content,
    inlineImages: usedInlineImages.map(({ file, cid }) => ({ file, cid })),
  }
}

function RecipientField({
  id,
  label,
  recipients,
  onRecipientsChange,
  disabled = false,
  children,
}: RecipientFieldProps) {
  return (
    <div className="flex min-h-10 items-start border-b px-4 py-2">
      <label htmlFor={id} className="w-20 shrink-0 pt-1 text-sm text-muted-foreground">
        {label}
      </label>
      <div className="min-w-0 flex-1">
        <RecipientInput
          id={id}
          recipients={recipients}
          onRecipientsChange={onRecipientsChange}
          placeholder="이름 또는 이메일 입력"
          disabled={disabled}
        />
      </div>
      {children ? <div className="ml-2 flex shrink-0 items-center gap-1">{children}</div> : null}
    </div>
  )
}

export function ComposeEmail({
  fromAddress,
  onFromAddressChange,
  messageId,
  initialTo,
  initialSubject,
  initialCc,
}: ComposeEmailProps) {
  const navigate = useNavigate()
  const editorRef = useRef<EmailEditorRef>(null)
  const attachmentInputRef = useRef<HTMLInputElement>(null)
  const attachmentsRef = useRef<File[]>([])
  const inlineImagesRef = useRef<PendingInlineImage[]>([])
  const draftAbortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)
  const { data: user, isPending: isUserPending } = useUser()
  const { data: activeMailAccounts, isPending: isMailAccountsPending } = useActiveMailAccounts()
  const sendMailMutation = useSendMail()
  const [editor, setEditor] = useState<ComposeEditor | null>(null)
  const [to, setTo] = useState<MailAddress[]>(() => parseMailRecipients(initialTo ?? ""))
  const [cc, setCc] = useState<MailAddress[]>(() => parseMailRecipients(initialCc ?? ""))
  const [bcc, setBcc] = useState<MailAddress[]>([])
  const [subject, setSubject] = useState(initialSubject ?? "")
  const [initialSubjectValue] = useState(() => initialSubject ?? "")
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [isEditorEmpty, setIsEditorEmpty] = useState(true)
  const [isPreparingPreview, setIsPreparingPreview] = useState(false)
  const [sendPreview, setSendPreview] = useState<ComposeSendPreviewData | null>(null)
  const [showCc, setShowCc] = useState(!!initialCc)
  const [showBcc, setShowBcc] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [inlineImages, setInlineImages] = useState<PendingInlineImage[]>([])
  const [draftPrompt, setDraftPrompt] = useState("")
  const [isDraftStreaming, setIsDraftStreaming] = useState(false)
  const [draftStreamPhase, setDraftStreamPhase] = useState<MailDraftStreamPhase>("idle")
  const [draftUsage, setDraftUsage] = useState<MailDraftUsage | null>(null)

  const activeFromAddressSet = useMemo(
    () => new Set((activeMailAccounts ?? []).map((mailAccount) => mailAccount.emailAddress)),
    [activeMailAccounts]
  )
  const defaultFromAddress =
    activeMailAccounts?.find((mailAccount) => mailAccount.id === user?.defaultMailAccountId)?.emailAddress ??
    activeMailAccounts?.[0]?.emailAddress ??
    null
  const validatedFromAddress = fromAddress && activeFromAddressSet.has(fromAddress) ? fromAddress : null
  const selectedFromAddress = validatedFromAddress ?? defaultFromAddress
  const fromAddressItems = useMemo(
    () =>
      (activeMailAccounts ?? []).map((mailAccount) => ({
        value: mailAccount.emailAddress,
        label: mailAccount.emailAddress,
      })),
    [activeMailAccounts]
  )
  const isFromAddressPending = isUserPending || isMailAccountsPending
  const isSendPreviewOpen = sendPreview !== null
  const cannotSend =
    sendMailMutation.isPending ||
    isPreparingPreview ||
    isDraftStreaming ||
    isFromAddressPending ||
    !selectedFromAddress ||
    !isEditorReady
  const isDraftSubjectEmpty = !subject.trim() || (!!initialSubjectValue && subject === initialSubjectValue)
  const isDraftContentEmpty = isDraftSubjectEmpty && isEditorEmpty
  const draftPromptText = draftPrompt.trim()
  useEffect(() => {
    attachmentsRef.current = attachments
  }, [attachments])

  useEffect(() => {
    inlineImagesRef.current = inlineImages
  }, [inlineImages])

  useEffect(() => {
    return () => {
      for (const inlineImage of inlineImagesRef.current) {
        URL.revokeObjectURL(inlineImage.objectUrl)
      }
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
      draftAbortControllerRef.current?.abort()
    }
  }, [])

  const replaceEditorBodyText = (text: string) => {
    const currentEditor = editorRef.current?.editor

    if (!currentEditor) {
      return
    }

    currentEditor.commands.setContent(textToEditorContent(text))
    setIsEditorEmpty(isEditorContentEmpty(currentEditor.getJSON()))
  }

  const getCurrentEditorContent = () => editorRef.current?.getJSON() ?? null
  const isCurrentEditorContentEmpty = () => {
    const content = getCurrentEditorContent()

    return !content || isEditorContentEmpty(content)
  }

  const isCurrentDraftContentEmpty = () => {
    return isDraftSubjectEmpty && isCurrentEditorContentEmpty()
  }

  const showUploadLimitError = () => {
    toast.error("첨부 용량은 본문 이미지를 포함해 20MB 이하만 가능합니다")
  }

  const handleAttachmentInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])
    event.target.value = ""

    if (selectedFiles.length === 0) {
      return
    }

    const nextAttachments = [...attachmentsRef.current, ...selectedFiles]

    if (getSendFileSize(nextAttachments, inlineImagesRef.current) > MAX_SEND_FILE_BYTES) {
      showUploadLimitError()
      return
    }

    attachmentsRef.current = nextAttachments
    setAttachments(nextAttachments)
  }

  const removeAttachment = (index: number) => {
    const nextAttachments = attachmentsRef.current.filter((_, currentIndex) => currentIndex !== index)

    attachmentsRef.current = nextAttachments
    setAttachments(nextAttachments)
  }

  const uploadInlineImage = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 본문에 삽입할 수 있습니다")
      throw new Error("Only image files can be inserted inline")
    }

    const fileKey = getFileKey(file)
    const reusableInlineImage = inlineImagesRef.current.find((inlineImage) => inlineImage.fileKey === fileKey)
    const inlineImagesSizeDelta = reusableInlineImage ? 0 : file.size

    if (
      getSendFileSize(attachmentsRef.current, inlineImagesRef.current) + inlineImagesSizeDelta >
      MAX_SEND_FILE_BYTES
    ) {
      showUploadLimitError()
      throw new Error("Inline image exceeds upload size limit")
    }

    const objectUrl = URL.createObjectURL(file)
    const inlineImage: PendingInlineImage = {
      fileKey,
      id: objectUrl,
      cid: reusableInlineImage?.cid ?? createInlineImageCid(),
      file: reusableInlineImage?.file ?? file,
      objectUrl,
    }

    const nextInlineImages = [...inlineImagesRef.current, inlineImage]

    inlineImagesRef.current = nextInlineImages
    setInlineImages(nextInlineImages)

    return { url: objectUrl }
  }, [])

  const pruneUnusedInlineImages = (content: JSONContent) => {
    const imageMetadata = collectImageMetadata(content)

    if (inlineImagesRef.current.length === 0) {
      return
    }

    const nextInlineImages = inlineImagesRef.current.filter((inlineImage) => imageMetadata.has(inlineImage.objectUrl))

    if (nextInlineImages.length === inlineImagesRef.current.length) {
      return
    }

    const nextInlineImageObjectUrls = new Set(nextInlineImages.map((inlineImage) => inlineImage.objectUrl))

    for (const inlineImage of inlineImagesRef.current) {
      if (!nextInlineImageObjectUrls.has(inlineImage.objectUrl)) {
        URL.revokeObjectURL(inlineImage.objectUrl)
      }
    }

    inlineImagesRef.current = nextInlineImages
    setInlineImages(nextInlineImages)
  }

  const handleGenerateDraft = async () => {
    if (draftAbortControllerRef.current) {
      return
    }

    if (!selectedFromAddress) {
      toast.error("발신 계정을 선택해주세요")
      return
    }

    if (!editorRef.current?.editor || !isEditorReady) {
      toast.error("메일 에디터를 불러오는 중입니다")
      return
    }

    if (!draftPromptText) {
      toast.error("AI 초안 요청을 입력해주세요")
      return
    }

    if (!isCurrentDraftContentEmpty()) {
      toast.error("작성 중인 내용을 비운 뒤 다시 시도해주세요")
      return
    }

    const abortController = new AbortController()
    let draftSubject = ""
    let draftBody = ""

    draftAbortControllerRef.current = abortController
    setSubject("")
    replaceEditorBodyText("")
    setDraftUsage(null)
    setDraftStreamPhase("subject")
    setIsDraftStreaming(true)

    try {
      await streamMailDraft(
        {
          mailAddress: selectedFromAddress,
          query: draftPromptText,
          replyMessageId: messageId ?? null,
          to: formatMailAddressesForSend(to),
          cc: formatMailAddressesForSend(cc),
        },
        {
          signal: abortController.signal,
          onEvent: (event) => {
            if (!isMountedRef.current || draftAbortControllerRef.current !== abortController) {
              return
            }

            if (event.type === "subject") {
              draftSubject += event.delta
              setSubject(draftSubject)
              setDraftStreamPhase("subject")
              return
            }

            if (event.type === "body") {
              draftBody += event.delta
              replaceEditorBodyText(draftBody)
              setDraftStreamPhase("body")
              return
            }

            if (event.type === "usage") {
              setDraftUsage(event.usage)
              return
            }
          },
        }
      )

      if (isMountedRef.current && draftAbortControllerRef.current === abortController) {
        setDraftStreamPhase("done")
      }
    } catch (error) {
      if (abortController.signal.aborted) {
        if (isMountedRef.current && draftAbortControllerRef.current === abortController) {
          setDraftStreamPhase("aborted")
        }

        return
      }

      if (!isMountedRef.current || draftAbortControllerRef.current !== abortController) {
        return
      }

      setDraftStreamPhase("error")
      toast.error("메일 초안 생성에 실패했습니다", {
        description:
          error instanceof MailDraftStreamError ? error.message : getErrorMessage(error, "잠시 후 다시 시도해주세요."),
      })
    } finally {
      if (draftAbortControllerRef.current === abortController) {
        draftAbortControllerRef.current = null

        if (isMountedRef.current) {
          setIsDraftStreaming(false)
        }
      }
    }
  }

  const handleStopDraft = () => {
    draftAbortControllerRef.current?.abort()
  }

  const createSendPreview = async () => {
    if (isFromAddressPending) {
      toast.error("발신 계정을 불러오는 중입니다")
      return null
    }

    if (!selectedFromAddress) {
      toast.error("발신 메일 계정을 먼저 연결해주세요")
      return null
    }

    if (!editorRef.current || !isEditorReady) {
      toast.error("메일 에디터를 불러오는 중입니다")
      return null
    }

    if (to.length === 0) {
      toast.error("받는 사람을 입력해주세요")
      return null
    }

    if (!subject.trim()) {
      toast.error("제목을 입력해주세요")
      return null
    }

    const editorContent = editorRef.current.getJSON()

    if (isEditorEmpty || isEditorContentEmpty(editorContent)) {
      toast.error("메일 내용을 입력해주세요")
      return null
    }

    const emailContent = await editorRef.current.getEmail()
    const imageMetadata = collectImageMetadata(editorContent)

    if (!emailContent.text.trim() && !emailContent.html.trim()) {
      toast.error("메일 내용을 입력해주세요")
      return null
    }

    const previewContent = buildMailContentWithImages(emailContent.html, inlineImagesRef.current, imageMetadata, {
      replaceInlineImageSrcWithCid: false,
    })
    const sendContent = buildMailContentWithImages(emailContent.html, inlineImagesRef.current, imageMetadata, {
      replaceInlineImageSrcWithCid: true,
    })

    return {
      mail: {
        from: selectedFromAddress,
        to: formatMailAddressesForSend(to),
        cc: formatMailAddressesForSend(cc),
        bcc: formatMailAddressesForSend(bcc),
        subject: subject.trim(),
        content: sendContent.content,
        ...(messageId ? { messageId } : {}),
        attachments,
        inlineImages: sendContent.inlineImages,
      },
      text: emailContent.text,
      html: previewContent.content,
    } satisfies ComposeSendPreviewData
  }

  const handleSendPreview = async () => {
    setIsPreparingPreview(true)

    try {
      const preview = await createSendPreview()

      if (preview) {
        setSendPreview(preview)
      }
    } catch (error) {
      toast.error("메일 미리보기를 생성하지 못했습니다", {
        description: getErrorMessage(error, "잠시 후 다시 시도해주세요."),
      })
    } finally {
      setIsPreparingPreview(false)
    }
  }

  const handleConfirmSend = async () => {
    if (!sendPreview) return

    try {
      await sendMailMutation.mutateAsync(sendPreview.mail)
      toast.success("메일이 발송되었습니다")
      setSendPreview(null)
      await navigate({ to: "/mail/$mailbox", params: { mailbox: "inbox" } })
    } catch (error) {
      toast.error("메일 발송에 실패했습니다", {
        description: getErrorMessage(error, "잠시 후 다시 시도해주세요."),
      })
    }
  }

  const handleClose = () => {
    if (isDraftStreaming) {
      return
    }

    navigate({ to: "/mail/$mailbox", params: { mailbox: "inbox" } })
  }

  return (
    <div className="relative flex h-full w-full min-w-0 flex-1 flex-col">
      <div className="flex h-11 shrink-0 items-center justify-between border-b px-4">
        <h1 className="text-sm font-medium">{messageId ? "답장" : "새 메일 작성"}</h1>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleClose}
          className="-mr-2"
          aria-label="메일 작성 닫기"
          disabled={isDraftStreaming}
        >
          <X className="size-4" />
        </Button>
      </div>

      <RecipientField
        id="compose-to"
        label="받는 사람"
        recipients={to}
        onRecipientsChange={setTo}
        disabled={isDraftStreaming}
      >
        {!showCc && (
          <Button variant="ghost" size="xs" onClick={() => setShowCc(true)} disabled={isDraftStreaming}>
            참조
          </Button>
        )}
        {!showBcc && (
          <Button variant="ghost" size="xs" onClick={() => setShowBcc(true)} disabled={isDraftStreaming}>
            숨은참조
          </Button>
        )}
      </RecipientField>

      {showCc && (
        <RecipientField
          id="compose-cc"
          label="참조"
          recipients={cc}
          onRecipientsChange={setCc}
          disabled={isDraftStreaming}
        />
      )}

      {showBcc && (
        <RecipientField
          id="compose-bcc"
          label="숨은 참조"
          recipients={bcc}
          onRecipientsChange={setBcc}
          disabled={isDraftStreaming}
        />
      )}

      <div className="flex h-10 items-center border-b px-4 py-2">
        <label htmlFor="compose-subject" className="w-20 shrink-0 text-sm text-muted-foreground">
          제목
        </label>
        <input
          id="compose-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="메일 제목 입력"
          disabled={isDraftStreaming}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      <div className="flex h-10 items-center border-b px-4 py-2">
        <span id="compose-from-label" className="w-20 shrink-0 text-sm text-muted-foreground">
          보내는 사람
        </span>
        <Select
          value={selectedFromAddress}
          onValueChange={onFromAddressChange}
          items={fromAddressItems}
          disabled={isDraftStreaming || isFromAddressPending || fromAddressItems.length === 0}
        >
          <SelectTrigger
            aria-labelledby="compose-from-label"
            className="h-auto min-w-0 flex-1 border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent"
          >
            <SelectValue placeholder={isFromAddressPending ? "발신 계정을 불러오는 중..." : "발신 계정을 선택하세요"} />
          </SelectTrigger>
          <SelectContent align="start" alignItemWithTrigger={false}>
            {(activeMailAccounts ?? []).map((mailAccount) => (
              <SelectItem key={mailAccount.id} value={mailAccount.emailAddress} className="px-3 py-2">
                <span className="flex items-center gap-2">
                  {mailAccount.emailAddress}
                  {mailAccount.id === user?.defaultMailAccountId && <Badge variant="secondary">default</Badge>}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ComposeEditorToolbar editor={editor} disabled={!isEditorReady || isDraftStreaming} />

      <div
        className={cn("relative flex-1 overflow-hidden", isDraftStreaming && "compose-email-editor-ai-streaming")}
        aria-label="메일 본문"
      >
        <EmailEditor
          ref={editorRef}
          theme={EDITOR_THEME}
          placeholder="메일 내용을 입력하세요. / 로 블록을 추가할 수 있습니다."
          bubbleMenu={{ hideWhenActiveNodes: ["button", "image"] }}
          className="compose-email-editor h-full overflow-auto text-sm outline-none"
          editable={!isDraftStreaming}
          onUploadImage={uploadInlineImage}
          onReady={(ref) => {
            applyEditorTheme(ref.editor)
            setIsEditorReady(true)
            setIsEditorEmpty(isEditorContentEmpty(ref.getJSON()))
            setEditor(ref.editor)
          }}
          onUpdate={(ref) => {
            const content = ref.getJSON()

            applyEditorTheme(ref.editor, content)
            setIsEditorEmpty(isEditorContentEmpty(content))
            pruneUnusedInlineImages(content)
          }}
        />
        {isDraftStreaming && (
          <>
            <div className="compose-email-editor-ai-sweep" aria-hidden />
          </>
        )}

        <ComposeAiDraftPanel
          prompt={draftPrompt}
          onPromptChange={setDraftPrompt}
          isDraftContentEmpty={isDraftContentEmpty}
          isStreaming={isDraftStreaming}
          phase={draftStreamPhase}
          usage={draftUsage}
          onGenerate={() => void handleGenerateDraft()}
          onStop={handleStopDraft}
        />
      </div>

      <div className="shrink-0 border-t px-4 py-3">
        <input
          ref={attachmentInputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={handleAttachmentInputChange}
        />

        {attachments.length > 0 && (
          <div className="mb-3">
            <div className="flex max-h-20 flex-wrap gap-2 overflow-y-auto pr-1">
              {attachments.map((file, index) => (
                <LocalAttachmentChip
                  key={`${file.name}-${file.lastModified}-${index}`}
                  file={file}
                  onRemove={isDraftStreaming ? undefined : () => removeAttachment(index)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => attachmentInputRef.current?.click()}
            disabled={isDraftStreaming || sendMailMutation.isPending || isPreparingPreview}
            aria-label="첨부파일 추가"
          >
            <Paperclip className="size-4" />
          </Button>
          <Button className="flex-1" size="lg" onClick={handleSendPreview} disabled={cannotSend}>
            {isPreparingPreview || sendMailMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            보내기
          </Button>
        </div>
      </div>

      <ComposeSendPreviewDialog
        open={isSendPreviewOpen}
        preview={sendPreview}
        isSending={sendMailMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setSendPreview(null)
        }}
        onConfirm={handleConfirmSend}
      />
    </div>
  )
}
