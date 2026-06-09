import type { ReactNode } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router"

import { RootNotFoundComponent } from "@/components/layout/not-found-page"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { queryClient } from "@/lib/query-client"
import type { RouterContext } from "@/types/router"

import appCss from "@/index.css?url"

const themeScript = `
const themeColors = { light: "#faf9f5", dark: "#262624" }
const storedTheme = localStorage.getItem("theme")
const systemTheme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
const resolvedTheme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : systemTheme

const root = document.documentElement
root.classList.add(resolvedTheme)
root.style.colorScheme = resolvedTheme

document.querySelectorAll("meta[name='theme-color']").forEach((meta) => {
  meta.content = themeColors[resolvedTheme]
})
`

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "theme-color", content: "#faf9f5", media: "(prefers-color-scheme: light)" },
      { name: "theme-color", content: "#262624", media: "(prefers-color-scheme: dark)" },
      { name: "color-scheme", content: "light dark" },
      { title: "메일상자" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: RootNotFoundComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Outlet />
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </QueryClientProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko" dir="ltr">
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
