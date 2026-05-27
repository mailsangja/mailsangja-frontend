import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import type { NavigateOptions } from "@tanstack/react-router"
import { toast } from "sonner"

import type { LoginPayload, RegisterPayload } from "@/types/auth"
import type { User } from "@/types/user"

import { login, logout, register } from "@/api/auth"
import { unregisterFcmToken } from "@/api/users"
import { identifyAnalyticsUser, resetAnalyticsUser, trackEvent } from "@/lib/analytics"
import { clearFcmToken, disableFcm } from "@/lib/fcm"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import { m } from "@/paraglide/messages"
import { userKeys } from "@/queries/user"

type NavigateFn = (options: NavigateOptions) => Promise<void>

function getLogoutErrorDescription(error: unknown) {
  if (getHttpStatus(error) === 401) {
    return m.auth_logout_session_expired()
  }

  return getErrorMessage(error, m.auth_logout_error_description())
}

export const authMutationOptions = {
  login: (queryClient: ReturnType<typeof useQueryClient>, navigate: NavigateFn) => ({
    mutationFn: (data: LoginPayload) => login(data),
    onSuccess: (user: User) => {
      identifyAnalyticsUser(user)
      trackEvent("login", { method: "password" })
      queryClient.setQueryData(userKeys.me(), user)
      void navigate({
        to: "/mail/$mailbox",
        params: { mailbox: "inbox" },
      })
    },
  }),
  register: (navigate: NavigateFn) => ({
    mutationFn: (data: RegisterPayload) => register(data),
    onSuccess: async () => {
      trackEvent("sign_up", { method: "password" })
      void navigate({ to: "/login" })
    },
  }),
  logout: (queryClient: ReturnType<typeof useQueryClient>, navigate: NavigateFn) => ({
    mutationFn: async () => {
      const user = queryClient.getQueryData<User | null>(userKeys.me())

      if (user) {
        try {
          await disableFcm(user.id, (fcmToken) => unregisterFcmToken({ fcmToken }))
        } catch {
          await clearFcmToken(user.id)
        }
      }

      await logout()
    },
    onSuccess: async () => {
      trackEvent("logout")
      resetAnalyticsUser()
      await queryClient.cancelQueries()
      queryClient.clear()
      void navigate({ to: "/login" })
    },
    onError: (error: unknown) => {
      toast.error(m.auth_logout_error_title(), {
        description: getLogoutErrorDescription(error),
      })
    },
  }),
}

export function useLogin() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation(authMutationOptions.login(queryClient, navigate))
}

export function useRegister() {
  const navigate = useNavigate()

  return useMutation(authMutationOptions.register(navigate))
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation(authMutationOptions.logout(queryClient, navigate))
}
