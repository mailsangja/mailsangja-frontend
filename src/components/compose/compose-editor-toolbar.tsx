import { useEffect, useRef, useState } from "react"
import type { EmailEditorRef } from "@react-email/editor"
import type {} from "@react-email/editor/extensions"
import type {} from "@react-email/editor/plugins"
import { defaultSlashCommands } from "@react-email/editor/ui"
import { setTextAlignment } from "@react-email/editor/utils"
import { useEditorState } from "@tiptap/react"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Strikethrough,
  Underline,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { m } from "@/paraglide/messages"

export type ComposeEditor = NonNullable<EmailEditorRef["editor"]>

const hiddenSlashCommandTitles = new Set(["Button", "Section", "2 columns", "3 columns", "4 columns"])

for (let index = defaultSlashCommands.length - 1; index >= 0; index -= 1) {
  if (hiddenSlashCommandTitles.has(defaultSlashCommands[index].title)) {
    defaultSlashCommands.splice(index, 1)
  }
}

interface ToolbarIconButtonProps {
  label: string
  icon: LucideIcon
  active?: boolean
  disabled?: boolean
  onClick: () => void
}

function ToolbarIconButton({ label, icon: Icon, active = false, disabled = false, onClick }: ToolbarIconButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      className={cn("rounded-md", active && "bg-muted text-foreground")}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      <Icon />
    </Button>
  )
}

function ToolbarSeparator() {
  return <div className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden />
}

function getActiveAlignment(editor: ComposeEditor | null) {
  if (!editor) return "left"

  const selectedNode = getSelectedNode(editor)
  const selectedAlignment = selectedNode?.attrs.align ?? selectedNode?.attrs.alignment

  if (typeof selectedAlignment === "string" && selectedAlignment.length > 0) {
    return selectedAlignment
  }

  const { $from } = editor.state.selection

  for (let depth = $from.depth; depth >= 0; depth -= 1) {
    const node = $from.node(depth)
    const alignment = node.attrs.align ?? node.attrs.alignment

    if (typeof alignment === "string" && alignment.length > 0) {
      return alignment
    }
  }

  return "left"
}

function getSelectedNode(editor: ComposeEditor) {
  const selection = editor.state.selection

  if (!("node" in selection)) {
    return null
  }

  return selection.node as { attrs: Record<string, unknown>; type: { name: string } } | null
}

function setEditorAlignment(editor: ComposeEditor, alignment: "left" | "center" | "right") {
  const selectedNode = getSelectedNode(editor)

  if (selectedNode?.type.name === "image") {
    editor.chain().focus().updateAttributes("image", { alignment }).run()
    return
  }

  editor.commands.focus()
  setTextAlignment(editor, alignment)
}

function getToolbarState(editor: ComposeEditor | null) {
  if (!editor) {
    return {
      activeAlignment: "left",
      isBlockquote: false,
      isBold: false,
      isBulletList: false,
      isCode: false,
      isHeading1: false,
      isHeading2: false,
      isHeading3: false,
      isItalic: false,
      isLink: false,
      isOrderedList: false,
      isParagraph: false,
      isStrike: false,
      isUnderline: false,
    }
  }

  return {
    activeAlignment: getActiveAlignment(editor),
    isBlockquote: editor.isActive("blockquote"),
    isBold: editor.isActive("bold"),
    isBulletList: editor.isActive("bulletList"),
    isCode: editor.isActive("code"),
    isHeading1: editor.isActive("heading", { level: 1 }),
    isHeading2: editor.isActive("heading", { level: 2 }),
    isHeading3: editor.isActive("heading", { level: 3 }),
    isItalic: editor.isActive("italic"),
    isLink: editor.isActive("link"),
    isOrderedList: editor.isActive("orderedList"),
    isParagraph: editor.isActive("paragraph"),
    isStrike: editor.isActive("strike"),
    isUnderline: editor.isActive("underline"),
  }
}

const safeLinkProtocols = new Set(["http:", "https:", "mailto:", "tel:"])

function normalizeLinkHref(value: string) {
  const trimmed = value.trim()

  if (trimmed.length === 0 || trimmed === "#") return trimmed

  try {
    const url = new URL(trimmed)
    return safeLinkProtocols.has(url.protocol) ? trimmed : null
  } catch {
    if (trimmed.includes("@") && !trimmed.includes(" ")) {
      return `mailto:${trimmed}`
    }

    if (trimmed.includes(".") && !trimmed.includes(" ")) {
      return `https://${trimmed}`
    }

    return null
  }
}

interface LinkSelectionRange {
  from: number
  to: number
}

function insertLinkedText(editor: ComposeEditor, range: LinkSelectionRange, text: string, href: string) {
  const docSize = editor.state.doc.content.size
  const from = Math.max(0, Math.min(range.from, docSize))
  const to = Math.max(from, Math.min(range.to, docSize))

  editor
    .chain()
    .focus()
    .insertContentAt({ from, to }, { type: "text", text, marks: [{ type: "link", attrs: { href } }] })
    .unsetMark("link")
    .run()
}

interface ComposeEditorToolbarProps {
  editor: ComposeEditor | null
  disabled: boolean
}

export function ComposeEditorToolbar({ editor, disabled }: ComposeEditorToolbarProps) {
  const linkTextInputRef = useRef<HTMLInputElement>(null)
  const linkSelectionRangeRef = useRef<LinkSelectionRange | null>(null)
  const [isLinkEditorOpen, setIsLinkEditorOpen] = useState(false)
  const [linkTextInput, setLinkTextInput] = useState("")
  const [linkHrefInput, setLinkHrefInput] = useState("")
  const isDisabled = disabled || !editor
  const toolbarState = useEditorState({
    editor,
    selector: ({ editor }) => getToolbarState(editor),
  })
  const runCommand = (command: (editor: ComposeEditor) => void) => {
    if (!editor) return
    command(editor)
  }

  useEffect(() => {
    if (!isLinkEditorOpen) return
    linkTextInputRef.current?.focus()
    linkTextInputRef.current?.select()
  }, [isLinkEditorOpen])

  const openLinkEditor = (editor: ComposeEditor) => {
    if (editor.isActive("link")) {
      editor.chain().focus().extendMarkRange("link").run()
    }

    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, " ")
    const currentHref = editor.getAttributes("link").href
    linkSelectionRangeRef.current = { from, to }
    setLinkTextInput(selectedText)
    setLinkHrefInput(typeof currentHref === "string" ? currentHref : "")
    setIsLinkEditorOpen(true)
  }

  const closeLinkEditor = () => {
    setIsLinkEditorOpen(false)
    editor?.commands.focus()
  }

  const applyLink = () => {
    if (!editor) return

    const text = linkTextInput.trim()
    const href = normalizeLinkHref(linkHrefInput)

    if (text.length === 0) {
      toast.error(m.compose_editor_error_link_text_required())
      return
    }

    if (href === "") {
      toast.error(m.compose_editor_error_link_url_required())
      return
    }

    if (href === null) {
      toast.error(m.compose_editor_error_link_url_invalid())
      return
    }

    insertLinkedText(editor, linkSelectionRangeRef.current ?? editor.state.selection, text, href)
    closeLinkEditor()
  }

  return (
    <>
      <div className="flex min-h-10 shrink-0 flex-wrap items-center gap-0.5 border-b bg-background/70 px-3 py-1">
        <ToolbarIconButton
          label={m.compose_editor_paragraph()}
          icon={Pilcrow}
          active={toolbarState?.isParagraph ?? false}
          disabled={isDisabled}
          onClick={() => runCommand((editor) => editor.chain().focus().setParagraph().run())}
        />
        <ToolbarIconButton
          label={m.compose_editor_heading_1()}
          icon={Heading1}
          active={toolbarState?.isHeading1 ?? false}
          disabled={isDisabled}
          onClick={() => runCommand((editor) => editor.chain().focus().clearNodes().toggleHeading({ level: 1 }).run())}
        />
        <ToolbarIconButton
          label={m.compose_editor_heading_2()}
          icon={Heading2}
          active={toolbarState?.isHeading2 ?? false}
          disabled={isDisabled}
          onClick={() => runCommand((editor) => editor.chain().focus().clearNodes().toggleHeading({ level: 2 }).run())}
        />
        <ToolbarIconButton
          label={m.compose_editor_heading_3()}
          icon={Heading3}
          active={toolbarState?.isHeading3 ?? false}
          disabled={isDisabled}
          onClick={() => runCommand((editor) => editor.chain().focus().clearNodes().toggleHeading({ level: 3 }).run())}
        />

        <ToolbarSeparator />

        <ToolbarIconButton
          label={m.compose_editor_bold()}
          icon={Bold}
          active={toolbarState?.isBold ?? false}
          disabled={isDisabled}
          onClick={() => runCommand((editor) => editor.chain().focus().toggleBold().run())}
        />
        <ToolbarIconButton
          label={m.compose_editor_italic()}
          icon={Italic}
          active={toolbarState?.isItalic ?? false}
          disabled={isDisabled}
          onClick={() => runCommand((editor) => editor.chain().focus().toggleItalic().run())}
        />
        <ToolbarIconButton
          label={m.compose_editor_underline()}
          icon={Underline}
          active={toolbarState?.isUnderline ?? false}
          disabled={isDisabled}
          onClick={() => runCommand((editor) => editor.chain().focus().toggleUnderline().run())}
        />
        <ToolbarIconButton
          label={m.compose_editor_strikethrough()}
          icon={Strikethrough}
          active={toolbarState?.isStrike ?? false}
          disabled={isDisabled}
          onClick={() => runCommand((editor) => editor.chain().focus().toggleStrike().run())}
        />
        <ToolbarIconButton
          label={m.compose_editor_inline_code()}
          icon={Code2}
          active={toolbarState?.isCode ?? false}
          disabled={isDisabled}
          onClick={() => runCommand((editor) => editor.chain().focus().toggleCode().run())}
        />
        <ToolbarIconButton
          label={m.compose_editor_insert_link()}
          icon={LinkIcon}
          active={toolbarState?.isLink ?? false}
          disabled={isDisabled}
          onClick={() => runCommand(openLinkEditor)}
        />
        <ToolbarIconButton
          label={m.compose_editor_insert_image()}
          icon={ImageIcon}
          disabled={isDisabled}
          onClick={() => runCommand((editor) => editor.chain().focus().uploadImage().run())}
        />

        <ToolbarSeparator />

        <ToolbarIconButton
          label={m.compose_editor_bullet_list()}
          icon={List}
          active={toolbarState?.isBulletList ?? false}
          disabled={isDisabled}
          onClick={() => runCommand((editor) => editor.chain().focus().clearNodes().toggleBulletList().run())}
        />
        <ToolbarIconButton
          label={m.compose_editor_numbered_list()}
          icon={ListOrdered}
          active={toolbarState?.isOrderedList ?? false}
          disabled={isDisabled}
          onClick={() => runCommand((editor) => editor.chain().focus().clearNodes().toggleOrderedList().run())}
        />
        <ToolbarIconButton
          label={m.compose_editor_quote()}
          icon={Quote}
          active={toolbarState?.isBlockquote ?? false}
          disabled={isDisabled}
          onClick={() =>
            runCommand((editor) =>
              editor.chain().focus().clearNodes().toggleNode("paragraph", "paragraph").toggleBlockquote().run()
            )
          }
        />

        <ToolbarSeparator />

        <ToolbarIconButton
          label={m.compose_editor_align_left()}
          icon={AlignLeft}
          active={toolbarState?.activeAlignment === "left"}
          disabled={isDisabled}
          onClick={() => runCommand((editor) => setEditorAlignment(editor, "left"))}
        />
        <ToolbarIconButton
          label={m.compose_editor_align_center()}
          icon={AlignCenter}
          active={toolbarState?.activeAlignment === "center"}
          disabled={isDisabled}
          onClick={() => runCommand((editor) => setEditorAlignment(editor, "center"))}
        />
        <ToolbarIconButton
          label={m.compose_editor_align_right()}
          icon={AlignRight}
          active={toolbarState?.activeAlignment === "right"}
          disabled={isDisabled}
          onClick={() => runCommand((editor) => setEditorAlignment(editor, "right"))}
        />

        <ToolbarSeparator />

        <ToolbarIconButton
          label={m.compose_editor_divider()}
          icon={Minus}
          disabled={isDisabled}
          onClick={() => runCommand((editor) => editor.chain().focus().setHorizontalRule().run())}
        />
      </div>

      <Dialog
        open={isLinkEditorOpen}
        onOpenChange={(open) => {
          if (!open) closeLinkEditor()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              applyLink()
            }}
          >
            <DialogHeader>
              <DialogTitle>{m.compose_link_dialog_title()}</DialogTitle>
              <DialogDescription>{m.compose_link_dialog_description()}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <label htmlFor="compose-link-text" className="text-sm font-medium">
                  {m.compose_link_text_label()}
                </label>
                <Input
                  id="compose-link-text"
                  ref={linkTextInputRef}
                  value={linkTextInput}
                  onChange={(event) => setLinkTextInput(event.target.value)}
                  placeholder={m.compose_link_text_placeholder()}
                />
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="compose-link-href" className="text-sm font-medium">
                  {m.compose_link_url_label()}
                </label>
                <Input
                  id="compose-link-href"
                  value={linkHrefInput}
                  onChange={(event) => setLinkHrefInput(event.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeLinkEditor}>
                {m.common_cancel()}
              </Button>
              <Button type="submit">{m.compose_insert()}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
