import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import type { NavigateOptions } from "@tanstack/react-router"
import { toast } from "sonner"

import type { LoginPayload, RegisterPayload } from "@/types/auth"
import type { User } from "@/types/user"

import { login, logout, register } from "@/api/auth"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import { userKeys } from "@/queries/user"

type NavigateFn = (options: NavigateOptions) => Promise<void>

function getLogoutErrorDescription(error: unknown) {
  if (getHttpStatus(error) === 401) {
    return "이미 세션이 만료되었거나 로그아웃 요청을 인증할 수 없습니다."
  }

  return getErrorMessage(error, "로그아웃에 실패했습니다. 다시 시도해주세요.")
}

export const authMutationOptions = {
  login: (queryClient: ReturnType<typeof useQueryClient>, navigate: NavigateFn) => ({
    mutationFn: (data: LoginPayload) => login(data),
    onSuccess: (user: User) => {
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
      void navigate({ to: "/login" })
    },
  }),
  logout: (queryClient: ReturnType<typeof useQueryClient>, navigate: NavigateFn) => ({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.cancelQueries()
      queryClient.clear()
      void navigate({ to: "/login" })
    },
    onError: (error: unknown) => {
      toast.error("로그아웃에 실패했습니다", {
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
