import { createFileRoute, Link } from "@tanstack/react-router"
import { Mail } from "lucide-react"

import { canonicalLink, metaDescription, pageTitle } from "@/lib/site-meta"

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: pageTitle("개인정보처리방침") },
      metaDescription("메일상자가 개인정보와 Google 사용자 데이터를 수집, 이용, 보관, 삭제하는 기준을 안내합니다."),
    ],
    links: [canonicalLink("/privacy")],
  }),
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Mail className="size-5 text-primary" />
            <span className="font-semibold">메일상자</span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm font-medium">개인정보처리방침</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-bold">메일상자 개인정보처리방침</h1>
        <p className="mt-2 text-sm text-muted-foreground">시행일: 2026년 05월 25일</p>

        <div className="mt-10 space-y-10 text-[15px] leading-7 text-foreground/90">
          <Section title="제1조(목적)">
            <p>
              메일상자 운영팀(이하 &quot;회사&quot;라 합니다)은 메일상자 서비스(이하 &quot;서비스&quot;라 합니다)를
              제공함에 있어 이용자의 개인정보 및 Google 사용자 데이터를 안전하게 보호하기 위해 본 개인정보처리방침을
              수립합니다.
            </p>
            <p className="mt-2">
              본 개인정보처리방침은 회사가 어떤 정보를 수집하고, 어떤 목적으로 이용하며, 어떻게 보관 및 삭제하는지를
              설명합니다.
            </p>
          </Section>

          <Section title="제2조(수집하는 개인정보 항목)">
            <p className="mb-3">회사는 서비스 제공을 위해 다음 각 호의 개인정보를 수집할 수 있습니다.</p>
            <ol className="list-decimal space-y-4 pl-5">
              <li>
                <span className="font-medium">Google 계정 연동 시 수집하는 정보</span>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>Google 계정 이메일 주소</li>
                  <li>Google 계정 이메일 검증 여부</li>
                </ul>
              </li>
              <li>
                <span className="font-medium">서비스 이용 과정에서 수집되는 정보</span>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>서비스 내 사용자 식별자</li>
                  <li>로그인 기록</li>
                  <li>서비스 이용 기록</li>
                  <li>API 요청 기록</li>
                  <li>오류 로그</li>
                  <li>접속 기기 및 브라우저 정보</li>
                  <li>IP 주소</li>
                </ul>
              </li>
              <li>
                <span className="font-medium">문의 또는 데이터 삭제 요청 시 수집하는 정보</span>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>이메일 주소</li>
                  <li>문의 내용</li>
                  <li>본인 확인을 위해 필요한 정보</li>
                </ul>
              </li>
            </ol>
          </Section>

          <Section title="제3조(Google 사용자 데이터 수집 항목)">
            <p className="mb-3">
              회사는 이용자가 Google OAuth 동의 화면에서 허용한 권한 범위 내에서 다음 각 호의 Google 사용자 데이터에
              접근할 수 있습니다.
            </p>
            <ol className="list-decimal space-y-4 pl-5">
              <li>
                <span className="font-medium">Gmail 메일 데이터</span>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>메일 제목</li>
                  <li>메일 본문</li>
                  <li>발신자 정보</li>
                  <li>수신자 정보</li>
                  <li>참조 및 숨은참조 정보</li>
                  <li>수신 및 발신 시각</li>
                  <li>메일 스레드 정보</li>
                  <li>첨부파일 메타데이터</li>
                </ul>
              </li>
              <li>
                <span className="font-medium">Gmail 상태 및 라벨 데이터</span>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>읽음/안읽음 상태</li>
                  <li>Gmail 라벨 정보</li>
                  <li>메일 라벨 및 상태 정보</li>
                  <li>메일 삭제 또는 휴지통 이동/복구 상태</li>
                </ul>
              </li>
              <li>
                <span className="font-medium">메일 발송 관련 데이터</span>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>이용자가 작성한 메일 제목</li>
                  <li>이용자가 작성한 메일 본문</li>
                  <li>수신자, 참조, 숨은참조 정보</li>
                  <li>이용자가 발송 요청한 메일 정보</li>
                </ul>
              </li>
              <li>
                <span className="font-medium">Google 주소록 및 기타 연락처 데이터</span>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>연락처 이름</li>
                  <li>연락처 이메일 주소</li>
                  <li>Google 주소록 연락처 정보</li>
                  <li>Google 기타 연락처 정보</li>
                </ul>
              </li>
            </ol>
            <p className="mt-3 text-sm text-muted-foreground">
              회사는 이용자가 허용하지 않은 Google 사용자 데이터에는 접근하지 않습니다.
            </p>
          </Section>

          <Section title="제4조(개인정보 및 Google 사용자 데이터의 이용 목적)">
            <p className="mb-3">
              회사는 수집한 개인정보 및 Google 사용자 데이터를 다음 각 호의 목적을 위해 이용합니다.
            </p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>회원 식별 및 Google 계정 연동</li>
              <li>여러 Gmail 계정의 통합 인박스 제공</li>
              <li>메일 목록 및 상세 내용 조회</li>
              <li>메일 스레드 조회</li>
              <li>메일 검색 기능 제공</li>
              <li>메일 라벨링 및 자동 분류 기능 제공</li>
              <li>읽음/안읽음, 라벨 변경, 휴지통 이동/복구 등 Gmail 상태 동기화</li>
              <li>AI 기반 메일 초안 작성, 답장 추천 기능 제공</li>
              <li>이용자가 작성한 메일 또는 답장의 Gmail 발송</li>
              <li>메일 작성 및 수신자 추천 등 주소록 기반 기능 제공</li>
              <li>서비스 장애 분석 및 품질 개선</li>
              <li>보안 모니터링 및 비정상 이용 탐지</li>
              <li>이용자 문의 및 데이터 삭제 요청 처리</li>
            </ol>
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              회사는 Google 사용자 데이터를 광고 목적으로 사용하지 않으며, 제3자에게 판매하지 않습니다.
            </p>
          </Section>

          <Section title="제5조(Google OAuth Scope별 사용 목적)">
            <p className="mb-3">회사는 서비스 제공에 필요한 최소한의 Google OAuth Scope만 요청합니다.</p>
            <ol className="list-decimal space-y-4 pl-5">
              <li>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">openid</code>
                <p className="mt-1">Google 계정 연동 과정에서 이용자 식별을 위해 사용합니다.</p>
              </li>
              <li>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">email</code>
                <p className="mt-1">연동된 Google 계정의 이메일 주소 및 이메일 검증 여부를 확인하기 위해 사용합니다.</p>
              </li>
              <li>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  https://www.googleapis.com/auth/gmail.modify
                </code>
                <p className="mt-1">
                  Gmail 메일 목록, 메일 본문, 스레드, 라벨 및 상태 정보를 조회하고, 메일 발송, 읽음/안읽음 처리, 라벨
                  변경, 휴지통 이동/복구 등 서비스 내 Gmail 기능 제공을 위해 사용합니다.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  회사는 이용자의 명시적인 조작 또는 서비스 제공에 필요한 동기화 범위 내에서만 Gmail 데이터를
                  처리합니다.
                </p>
              </li>
              <li>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  https://www.googleapis.com/auth/contacts.readonly
                </code>
                <p className="mt-1">
                  이용자의 Google 주소록 연락처를 조회하여 메일 작성 및 수신자 추천 등 주소록 기반 기능을 제공하기 위해
                  사용합니다.
                </p>
              </li>
              <li>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  https://www.googleapis.com/auth/contacts.other.readonly
                </code>
                <p className="mt-1">
                  이용자의 Google 기타 연락처를 조회하여 메일 작성 및 수신자 추천 등 주소록 기반 기능을 제공하기 위해
                  사용합니다.
                </p>
              </li>
            </ol>
            <p className="mt-3 text-sm text-muted-foreground">
              회사는 <code className="rounded bg-muted px-1 py-0.5 text-xs">https://mail.google.com/</code>과 같이
              서비스 기능 제공 범위를 초과하는 권한은 요청하지 않으며, 서비스 제공에 필요한 최소 범위의 권한만
              요청합니다.
            </p>
          </Section>

          <Section title="제6조(Google API Services User Data Policy 준수)">
            <p className="mb-3">
              회사는 Google API를 통해 수신한 사용자 데이터를 Google API Services User Data Policy 및 Limited Use
              요구사항에 따라 처리합니다.
            </p>
            <p className="mb-2">회사는 Google 사용자 데이터에 대해 다음 각 호의 원칙을 준수합니다.</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>이용자가 명시적으로 동의한 서비스 기능 제공 목적에 한하여 사용합니다.</li>
              <li>Google 사용자 데이터를 광고 목적으로 사용하지 않습니다.</li>
              <li>Google 사용자 데이터를 제3자에게 판매하지 않습니다.</li>
              <li>Google 사용자 데이터를 이용자에게 제공되는 기능 외의 목적으로 사용하지 않습니다.</li>
              <li>서비스 제공에 필요한 최소한의 데이터만 접근하고 저장합니다.</li>
              <li>이용자가 요청하는 경우 관련 데이터를 삭제할 수 있도록 합니다.</li>
            </ol>
          </Section>

          <Section title="제7조(AI 기능에서의 데이터 처리)">
            <ol className="list-decimal space-y-2 pl-5">
              <li>회사는 이용자의 요청에 따라 메일 초안 작성, 답장 추천 등 AI 기능을 제공할 수 있습니다.</li>
              <li>AI 기능은 이용자가 선택한 메일 내용, 이용자가 입력한 내용 또는 대화 맥락을 기반으로 동작합니다.</li>
              <li>회사는 AI 기능 제공을 위해 필요한 최소한의 메일 데이터만 처리합니다.</li>
              <li>
                AI 기능 제공을 위해 이용자가 요청한 메일 내용 또는 입력 내용이 AI 처리 서비스 제공업체에 전송될 수
                있습니다.
              </li>
              <li>회사는 이용자의 Gmail 데이터를 광고 목적 또는 AI 모델 학습 목적으로 사용하지 않습니다.</li>
              <li>AI가 생성한 결과는 이용자가 직접 검토한 후 사용해야 합니다.</li>
            </ol>
          </Section>

          <Section title="제8조(개인정보 및 Google 사용자 데이터의 보관 기간)">
            <p className="mb-3">회사는 서비스 제공에 필요한 기간 동안 개인정보 및 Google 사용자 데이터를 보관합니다.</p>
            <p className="mb-2">다음 각 호에 해당하는 경우 회사는 관련 데이터를 삭제하거나 비식별화합니다.</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>이용자가 서비스 탈퇴를 요청한 경우</li>
              <li>이용자가 Google 계정 연결 해제를 요청한 경우</li>
              <li>이용자가 데이터 삭제를 요청한 경우</li>
              <li>서비스 제공 목적이 달성되어 더 이상 보관할 필요가 없는 경우</li>
            </ol>
            <p className="mt-3 text-sm text-muted-foreground">
              단, 관련 법령에 따라 일정 기간 보관이 필요한 정보는 해당 법령에서 정한 기간 동안 보관할 수 있습니다.
            </p>
          </Section>

          <Section title="제9조(개인정보 및 Google 사용자 데이터의 제3자 제공)">
            <p className="mb-3">
              회사는 이용자의 개인정보 및 Google 사용자 데이터를 제3자에게 판매하거나 제공하지 않습니다.
            </p>
            <p className="mb-2">다만 다음 각 호의 경우에는 예외적으로 제공될 수 있습니다.</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>이용자가 사전에 명시적으로 동의한 경우</li>
              <li>법령에 따라 제공 의무가 발생한 경우</li>
              <li>수사기관 또는 법원의 적법한 요청이 있는 경우</li>
            </ol>
          </Section>

          <Section title="제10조(개인정보 처리 위탁)">
            <p className="mb-3">
              회사는 안정적인 서비스 제공을 위해 클라우드 인프라, 데이터베이스, 모니터링, AI API 등 외부 서비스를 이용할
              수 있습니다.
            </p>
            <p className="mb-2">
              외부 서비스를 이용하는 경우에도 회사는 서비스 제공 목적 범위 내에서만 이용자 데이터를 처리하며, 필요한
              최소한의 데이터만 전달합니다.
            </p>
            <p className="mb-2">회사가 이용할 수 있는 위탁 업무의 범위는 다음 각 호와 같습니다.</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>클라우드 인프라 및 데이터베이스 운영</li>
              <li>서비스 장애 모니터링 및 로그 분석</li>
              <li>AI 기능 제공을 위한 AI API 처리</li>
              <li>이메일 문의 및 고객 지원 처리</li>
            </ol>
            <p className="mt-3 text-sm text-muted-foreground">
              구체적인 위탁 업체, 위탁 업무 내용, 보유 및 이용 기간이 확정되는 경우 회사는 개인정보처리방침 또는 별도
              고지를 통해 안내합니다.
            </p>
          </Section>

          <Section title="제11조(로그 및 보안 처리)">
            <ol className="list-decimal space-y-2 pl-5">
              <li>회사는 서비스 안정성, 장애 분석, 보안 모니터링을 위해 일부 로그를 수집할 수 있습니다.</li>
              <li>
                로그에는 다음 각 호의 정보가 포함될 수 있습니다.
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>요청 시각</li>
                  <li>사용자 식별자</li>
                  <li>API 요청 경로</li>
                  <li>오류 정보</li>
                  <li>응답 시간</li>
                  <li>외부 API 호출 결과</li>
                </ul>
              </li>
              <li>
                회사는 비밀번호, OAuth Access Token, Refresh Token, 인증 코드, 민감한 메일 본문 등 민감정보가 로그에
                남지 않도록 마스킹 및 접근 통제를 적용합니다.
              </li>
            </ol>
          </Section>

          <Section title="제12조(이용자의 권리)">
            <p className="mb-2">이용자는 언제든지 다음 각 호의 권리를 행사할 수 있습니다.</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>개인정보 열람 요청</li>
              <li>개인정보 정정 요청</li>
              <li>개인정보 삭제 요청</li>
              <li>Google 계정 연결 해제 요청</li>
              <li>서비스 탈퇴 요청</li>
              <li>Google 사용자 데이터 삭제 요청</li>
            </ol>
            <p className="mt-3 text-sm text-muted-foreground">
              이용자는 Google 계정 보안 설정 페이지에서도 메일상자의 Google 계정 접근 권한을 해제할 수 있습니다.
            </p>
          </Section>

          <Section title="제13조(데이터 삭제 요청 방법)">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                이용자는 아래 이메일을 통해 데이터 삭제를 요청할 수 있습니다.
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>
                    이메일:{" "}
                    <a href="mailto:mailsangja2026@gmail.com" className="text-primary underline underline-offset-2">
                      mailsangja2026@gmail.com
                    </a>
                  </li>
                </ul>
              </li>
              <li>
                회사는 데이터 삭제 요청을 접수한 경우 본인 확인 후 서비스 제공을 위해 저장된 개인정보 및 Google 사용자
                데이터를 삭제합니다.
              </li>
              <li>단, 관계 법령에 따라 보관이 필요한 정보는 해당 법령에서 정한 기간 동안 보관할 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="제14조(보안 조치)">
            <p className="mb-2">
              회사는 이용자의 개인정보 및 Google 사용자 데이터를 보호하기 위해 다음 각 호의 보안 조치를 적용합니다.
            </p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>HTTPS 기반 통신 암호화</li>
              <li>OAuth 기반 사용자 인증</li>
              <li>Access Token 및 Refresh Token의 안전한 저장</li>
              <li>민감정보 로그 마스킹</li>
              <li>데이터베이스 접근 권한 제한</li>
              <li>장애 및 이상 징후 모니터링</li>
              <li>사용자 요청 기반 데이터 삭제 절차 운영</li>
            </ol>
          </Section>

          <Section title="제15조(개인정보처리방침의 변경)">
            <ol className="list-decimal space-y-2 pl-5">
              <li>회사는 필요한 경우 본 개인정보처리방침을 변경할 수 있습니다.</li>
              <li>
                회사는 개인정보처리방침을 변경하는 경우 변경 내용과 시행일을 서비스 화면 또는 이메일 등을 통해
                안내합니다.
              </li>
              <li>중요한 변경 사항이 있는 경우 이용자가 명확히 확인할 수 있도록 별도로 고지합니다.</li>
            </ol>
          </Section>

          <Section title="제16조(문의처)">
            <p className="mb-2">
              개인정보 및 Google 사용자 데이터 처리와 관련한 문의는 아래 연락처로 문의할 수 있습니다.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>서비스명: 메일상자</li>
              <li>
                이메일:{" "}
                <a href="mailto:mailsangja2026@gmail.com" className="text-primary underline underline-offset-2">
                  mailsangja2026@gmail.com
                </a>
              </li>
              <li>
                홈페이지:{" "}
                <a
                  href="https://mail.ajou.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  https://mail.ajou.app/
                </a>
              </li>
            </ul>
          </Section>

          <div className="rounded-lg border bg-muted/30 px-6 py-4">
            <p className="text-sm font-medium">부칙</p>
            <p className="mt-1 text-sm text-muted-foreground">본 개인정보처리방침은 2026년 05월 25일부터 시행합니다.</p>
          </div>
        </div>
      </main>

      <footer className="border-t px-6 py-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail className="size-4" />
            <span>메일상자</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="transition-colors hover:text-foreground">
              이용약관
            </Link>
            <Link to="/privacy" className="transition-colors hover:text-foreground">
              개인정보처리방침
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div>{children}</div>
    </section>
  )
}
