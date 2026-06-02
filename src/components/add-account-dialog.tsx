import { useState } from "react"
import { Check } from "lucide-react"

import { authorizeGoogle } from "@/api/mail-accounts"
import { MailAccountIcon } from "@/components/mail-account-icon"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { trackEvent } from "@/lib/analytics"
import { ICON_ENTRIES, type AccountIconName } from "@/lib/icon-entries"
import { cn } from "@/lib/utils"
import { m } from "@/paraglide/messages"

const COLORS = ["#FA2A2A", "#FA882A", "#FAD42A", "#22C55E", "#36C0EB", "#3B82F6", "#8B5CF6", "#ED64A7"]

function getAccountIconLabel(name: AccountIconName) {
  switch (name) {
    case "mail":
      return m.account_icon_mail()
    case "briefcase":
      return m.account_icon_briefcase()
    case "graduation-cap":
      return m.account_icon_graduation_cap()
    case "code":
      return m.account_icon_code()
    case "gamepad-2":
      return m.account_icon_gamepad_2()
    case "home":
      return m.account_icon_home()
    case "shopping-cart":
      return m.account_icon_shopping_cart()
    case "bell":
      return m.account_icon_bell()
  }
}

interface AccountAppearanceFormProps {
  selectedIcon: AccountIconName
  onIconChange: (icon: AccountIconName) => void
  selectedColor: string
  onColorChange: (color: string) => void
  alias: string
  onAliasChange: (alias: string) => void
}

function AccountAppearanceForm({
  selectedIcon,
  onIconChange,
  selectedColor,
  onColorChange,
  alias,
  onAliasChange,
}: AccountAppearanceFormProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <MailAccountIcon icon={selectedIcon} color={selectedColor} size="lg" />

      <input
        type="text"
        placeholder={m.add_account_alias_placeholder()}
        value={alias}
        onChange={(e) => onAliasChange(e.target.value)}
        className="h-9 w-full max-w-xs rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
      />

      <div className="space-y-2">
        <p className="text-sm font-medium">{m.add_account_icon_section()}</p>
        <div className="flex flex-wrap gap-2">
          {ICON_ENTRIES.map(({ name, Icon }) => (
            <button
              key={name}
              type="button"
              title={getAccountIconLabel(name)}
              onClick={() => onIconChange(name)}
              className={cn(
                "flex size-10 items-center justify-center rounded-lg border transition-colors",
                selectedIcon === name ? "border-primary bg-primary/10" : "border-border hover:bg-accent"
              )}
            >
              <Icon className="size-5" />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">{m.add_account_color_section()}</p>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onColorChange(color)}
              className="flex size-10 items-center justify-center rounded-full border border-border transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
            >
              {selectedColor === color && <Check className="size-5 text-white" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AddAccountDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"logo" | "login">("logo")
  const [selectedIcon, setSelectedIcon] = useState<AccountIconName>(ICON_ENTRIES[0].name)
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [alias, setAlias] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenChange = (value: boolean) => {
    setOpen(value)
    if (!value) {
      setStep("logo")
      setSelectedIcon(ICON_ENTRIES[0].name)
      setSelectedColor(COLORS[0])
      setAlias("")
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    trackEvent("mail_account_connect_start", {
      provider: "google",
      has_alias: alias.trim().length > 0,
    })

    try {
      const { authorizationUrl } = await authorizeGoogle({
        alias,
        icon: selectedIcon,
        color: selectedColor,
      })
      window.location.href = authorizationUrl
    } catch {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {step === "logo" ? (
          <>
            <DialogHeader>
              <DialogTitle>{m.add_account_icon_title()}</DialogTitle>
            </DialogHeader>

            <AccountAppearanceForm
              selectedIcon={selectedIcon}
              onIconChange={setSelectedIcon}
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
              alias={alias}
              onAliasChange={setAlias}
            />

            <div className="flex justify-end">
              <Button onClick={() => setStep("login")} className="cursor-pointer hover:bg-primary/80">
                {m.add_account_next()}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{m.add_account_connect_title()}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col items-center gap-6 py-4">
              <MailAccountIcon icon={selectedIcon} color={selectedColor} size="lg" />

              <p className="text-sm text-muted-foreground">{m.add_account_google_connect_description()}</p>

              <Button className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
                {isLoading ? m.add_account_connecting() : m.add_account_google_login()}
              </Button>
            </div>

            <div className="flex justify-start">
              <Button variant="ghost" onClick={() => setStep("logo")}>
                {m.add_account_previous()}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface EditAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValues: {
    icon: AccountIconName
    color: string
    alias: string
  }
  onSave: (values: { icon: AccountIconName; color: string; alias: string }) => void
  isSaving?: boolean
}

export function EditAccountDialog({
  open,
  onOpenChange,
  initialValues,
  onSave,
  isSaving = false,
}: EditAccountDialogProps) {
  const [selectedIcon, setSelectedIcon] = useState<AccountIconName>(initialValues.icon)
  const [selectedColor, setSelectedColor] = useState(initialValues.color)
  const [alias, setAlias] = useState(initialValues.alias)

  const hasChanged =
    selectedIcon !== initialValues.icon || selectedColor !== initialValues.color || alias !== initialValues.alias

  const handleOpenChange = (value: boolean) => {
    onOpenChange(value)
    if (!value) {
      setSelectedIcon(initialValues.icon)
      setSelectedColor(initialValues.color)
      setAlias(initialValues.alias)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{m.add_account_edit_title()}</DialogTitle>
        </DialogHeader>

        <AccountAppearanceForm
          selectedIcon={selectedIcon}
          onIconChange={setSelectedIcon}
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
          alias={alias}
          onAliasChange={setAlias}
        />

        <div className="flex justify-end">
          <Button
            onClick={() => onSave({ icon: selectedIcon, color: selectedColor, alias })}
            disabled={isSaving || !hasChanged}
          >
            {isSaving ? m.common_saving() : m.common_save()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
