import { useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLogin } from "@/mutations/auth"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/_guest/login")({
  component: LoginPage,
})

function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const loginMutation = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate({ username, password })
  }

  return (
    <Card className="bg-transparent">
      <CardHeader className="items-center justify-items-center text-center">
        <CardTitle className="text-xl font-bold tracking-tight">{m.auth_login_title()}</CardTitle>
        <CardDescription>{m.auth_login_description()}</CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">{m.auth_username_label()}</Label>
            <Input
              id="username"
              type="text"
              placeholder={m.auth_username_placeholder()}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">{m.auth_password_label()}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={m.auth_password_placeholder()}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? m.auth_hide_password() : m.auth_show_password()}
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {loginMutation.isError && (
            <p className="flex items-center gap-1.5 text-sm text-destructive">
              <span className="inline-block size-1.5 shrink-0 rounded-full bg-destructive" />
              {m.auth_login_error()}
            </p>
          )}

          <Button type="submit" size="lg" className="mt-1 w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending && <Loader2 className="animate-spin" />}
            {m.auth_login_submit()}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {m.auth_signup_prompt()} &nbsp;
          <Link to="/signup" className="font-medium text-primary hover:underline">
            {m.auth_signup_link()}
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
