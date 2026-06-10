import { createFileRoute } from "@tanstack/react-router"

import { RootNotFoundComponent } from "@/components/layout/not-found-page"
import { metaDescription, pageTitle } from "@/lib/site-meta"

export const Route = createFileRoute("/404")({
  head: () => ({
    meta: [
      { title: pageTitle("페이지를 찾을 수 없음") },
      metaDescription("요청한 페이지를 찾을 수 없습니다. 메일상자 홈으로 이동하거나 이전 페이지로 돌아갈 수 있습니다."),
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RootNotFoundComponent,
})
