import { Languages } from "lucide-react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { m } from "@/paraglide/messages"
import { getLocale, locales, setLocale } from "@/paraglide/runtime"
import type { Locale } from "@/paraglide/runtime"

function getLanguageLabel(locale: Locale) {
  switch (locale) {
    case "ko":
      return m.settings_language_ko()
    case "en":
      return m.settings_language_en()
  }
}

function getShortLanguageLabel(locale: Locale) {
  return locale.toUpperCase()
}

function isLocale(value: string | null | undefined): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value)
}

interface LanguageSelectProps {
  className?: string
  triggerClassName?: string
  valueClassName?: string
  contentAlign?: "start" | "center" | "end"
  compact?: boolean
  size?: "sm" | "default"
}

export function LanguageSelect({
  className,
  triggerClassName,
  valueClassName,
  contentAlign = "start",
  compact = false,
  size,
}: LanguageSelectProps) {
  const currentLocale = getLocale()
  const languageItems = locales.map((locale) => ({
    value: locale,
    label: compact ? getShortLanguageLabel(locale) : getLanguageLabel(locale),
  }))

  const handleLocaleChange = (value: string | null) => {
    if (!isLocale(value) || value === currentLocale) {
      return
    }

    setLocale(value)
  }

  return (
    <Select value={currentLocale} onValueChange={handleLocaleChange} items={languageItems}>
      <SelectTrigger
        size={size}
        className={cn("w-full sm:w-72", triggerClassName, className)}
        aria-label={m.settings_language_title()}
      >
        <Languages className="size-4 text-muted-foreground" />
        <SelectValue className={valueClassName} />
      </SelectTrigger>
      <SelectContent align={contentAlign} alignItemWithTrigger={false}>
        {languageItems.map((item) => (
          <SelectItem key={item.value} value={item.value} className="px-3 py-2">
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
