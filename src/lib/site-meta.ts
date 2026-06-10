export const SITE_NAME = "메일상자"

export const SITE_URL = "https://mail.ajou.app"

export const SITE_DESCRIPTION =
  "메일상자는 여러 이메일 계정을 한 곳에서 관리하고 AI 라벨링, 답장 초안, 정리를 돕는 인박스 자동화 서비스입니다."

export function pageTitle(title?: string) {
  return title ? `${title} | ${SITE_NAME}` : SITE_NAME
}

export function metaDescription(content: string) {
  return { name: "description", content }
}

export function canonicalLink(path = "/") {
  return { rel: "canonical", href: new URL(path, SITE_URL).toString() }
}
