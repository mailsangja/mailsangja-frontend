import { useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRegister } from "@/mutations/auth"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/_guest/signup")({
  component: SignUpPage,
})

function SignUpPage() {
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const registerMutation = useRegister()

  const isFormValid =
    name.trim() !== "" &&
    username.trim() !== "" &&
    password !== "" &&
    passwordConfirm !== "" &&
    password === passwordConfirm &&
    agreedToTerms

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    registerMutation.mutate({ name, username, password })
  }

  return (
    <Card className="bg-transparent">
      <CardHeader className="items-center justify-items-center text-center">
        <CardTitle className="text-xl font-bold tracking-tight">{m.auth_signup_title()}</CardTitle>
        <CardDescription>{m.auth_signup_description()}</CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">
              {m.auth_name_label()}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder={m.auth_name_placeholder()}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="username">
              {m.auth_username_label()}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="username"
              type="text"
              placeholder={m.auth_username_label()}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">
              {m.auth_password_label()}
              <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={m.auth_password_label()}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                required
                autoComplete="new-password"
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="password-confirm">
              {m.auth_password_confirm_label()}
              <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password-confirm"
                type={showPasswordConfirm ? "text" : "password"}
                placeholder={m.auth_password_confirm_placeholder()}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="pr-10"
                required
              />
              <button
                type="button"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPasswordConfirm ? m.auth_hide_password() : m.auth_show_password()}
                onClick={() => setShowPasswordConfirm((v) => !v)}
                tabIndex={-1}
              >
                {showPasswordConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(v) => setAgreedToTerms(v === true)} />
            <Label htmlFor="terms" className="gap-1 text-xs leading-relaxed font-normal">
              {m.auth_terms_agree_prefix()}
              <Link to="/terms" className="font-medium text-primary hover:underline" target="_blank">
                {m.auth_terms_link()}
              </Link>
              {m.auth_terms_and()}
              <Link to="/privacy" className="font-medium text-primary hover:underline" target="_blank">
                {m.auth_privacy_link()}
              </Link>
              {m.auth_terms_agree_suffix()}
            </Label>
          </div>

          {registerMutation.isError && (
            <p className="flex items-center gap-1.5 text-sm text-destructive">
              <span className="inline-block size-1.5 shrink-0 rounded-full bg-destructive" />
              {m.auth_signup_error()}
            </p>
          )}

          <Button type="submit" size="lg" className="mt-1 w-full" disabled={!isFormValid || registerMutation.isPending}>
            {registerMutation.isPending && <Loader2 className="animate-spin" />}
            {m.auth_signup_link()}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {m.auth_login_prompt()} &nbsp;
          <Link to="/login" className="font-medium text-primary hover:underline">
            {m.auth_login_submit()}
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
