import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import type { NavigateOptions } from "@tanstack/react-router"
import type { LoginPayload, RegisterPayload } from "@/types/auth"
import type { User } from "@/types/user"

import { login, register } from "@/api/auth"
import { userKeys } from "@/queries/user"

type NavigateFn = (options: NavigateOptions) => Promise<void>

export const authMutationOptions = {
  login: (queryClient: ReturnType<typeof useQueryClient>, navigate: NavigateFn) => ({
    mutationFn: (data: LoginPayload) => login(data),
    onSuccess: (user: User) => {
      queryClient.setQueryData(userKeys.me(), user)
      void navigate({ to: "/inbox" })
    },
  }),
  register: (navigate: NavigateFn) => ({
    mutationFn: (data: RegisterPayload) => register(data),
    onSuccess: async () => {
      void navigate({ to: "/login" })
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

  return () => {
    queryClient.setQueryData(userKeys.me(), null)
    void navigate({ to: "/login" })
  }
}
