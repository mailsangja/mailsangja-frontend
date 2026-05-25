import { createFileRoute, Link } from "@tanstack/react-router"
import { Mail } from "lucide-react"

export const Route = createFileRoute("/terms")({
  component: TermsPage,
})

function TermsPage() {
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
          <span className="text-sm font-medium">서비스 이용약관</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-bold">메일상자 서비스 이용약관</h1>
        <p className="mt-2 text-sm text-muted-foreground">시행일: 2026년 05월 25일</p>

        <div className="mt-10 space-y-10 text-[15px] leading-7 text-foreground/90">
          <Section title="제1조(목적)">
            본 약관은 메일상자 운영팀(이하 &quot;회사&quot;라 합니다)이 운영하는 메일상자 서비스(이하
            &quot;서비스&quot;라 합니다)를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로
            합니다.
          </Section>

          <Section title="제2조(정의)">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                &quot;서비스&quot;란 회사가 제공하는 Gmail 기반 통합 메일 인박스, 메일 조회, 메일 검색, 메일 라벨링, AI
                기반 초안 작성 및 답장 보조 기능을 의미합니다.
              </li>
              <li>&quot;이용자&quot;란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 자를 말합니다.</li>
              <li>
                &quot;회원&quot;이란 Google 계정 연동 또는 회원가입 절차를 통해 서비스 이용 자격을 부여받은 자로서,
                지속적으로 서비스를 이용할 수 있는 자를 말합니다.
              </li>
              <li>
                &quot;Google 계정&quot;이란 이용자가 서비스와 연동하는 Gmail 또는 Google Workspace 계정을 의미합니다.
              </li>
              <li>
                &quot;Google 사용자 데이터&quot;란 Google API를 통해 회사가 접근하는 이용자의 Gmail 메일, 메일
                메타데이터, 라벨 정보, 스레드 정보, 계정 이메일 정보, Google 주소록 및 기타 연락처 정보를 의미합니다.
              </li>
              <li>
                &quot;AI 기능&quot;이란 메일 본문 또는 대화 맥락을 기반으로 메일 초안 작성, 답장 추천 등을 제공하는
                기능을 의미합니다.
              </li>
            </ol>
          </Section>

          <Section title="제3조(회원가입 및 Google 계정 연동)">
            <ol className="list-decimal space-y-2 pl-5">
              <li>이용자는 Google 계정을 통해 서비스 이용을 신청할 수 있습니다.</li>
              <li>
                회사는 서비스 제공을 위해 다음 각 호의 정보를 수집하거나 접근할 수 있습니다.
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>Google 계정 이메일 주소</li>
                  <li>Google 계정 이메일 검증 여부</li>
                  <li>이용자가 연동한 Gmail 계정 정보</li>
                  <li>이용자가 연동한 Google 주소록 및 기타 연락처 정보</li>
                  <li>이용자가 Google OAuth 동의 화면에서 허용한 범위 내의 Gmail 데이터</li>
                </ul>
              </li>
              <li>
                회사는 다음 각 호에 해당하는 경우 회원가입 또는 Google 계정 연동을 제한하거나 거절할 수 있습니다.
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>타인의 Google 계정을 무단으로 사용하는 경우</li>
                  <li>허위 정보를 제공한 경우</li>
                  <li>이전에 본 약관 위반으로 서비스 이용이 제한된 이력이 있는 경우</li>
                  <li>서비스 운영 또는 보안상 현저한 지장이 있다고 판단되는 경우</li>
                </ul>
              </li>
            </ol>
          </Section>

          <Section title="제4조(Google OAuth 권한 및 데이터 접근)">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                회사는 이용자의 명시적인 동의를 받은 경우에 한하여 Google API를 통해 Google 사용자 데이터에 접근합니다.
              </li>
              <li>회사는 서비스 제공에 필요한 최소한의 Google OAuth Scope만 요청합니다.</li>
              <li>
                회사가 요청할 수 있는 Google OAuth Scope와 사용 목적은 다음 각 호와 같습니다.
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">openid</code>: Google 계정 연동 과정에서
                    이용자 식별을 위해 사용합니다.
                  </li>
                  <li>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">email</code>: 연동된 Google 계정의 이메일
                    주소 확인을 위해 사용합니다.
                  </li>
                  <li>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      https://www.googleapis.com/auth/gmail.modify
                    </code>
                    : Gmail 메일 목록, 본문, 스레드, 라벨 및 상태 정보를 조회하고, 메일 발송, 읽음/안읽음 처리, 라벨
                    변경, 휴지통 이동/복구 등 서비스 내 Gmail 기능 제공을 위해 사용합니다.
                  </li>
                  <li>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      https://www.googleapis.com/auth/contacts.readonly
                    </code>
                    : 이용자의 Google 주소록 연락처를 조회하여 메일 작성 및 수신자 추천 등 주소록 기반 기능을 제공하기
                    위해 사용합니다.
                  </li>
                  <li>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      https://www.googleapis.com/auth/contacts.other.readonly
                    </code>
                    : 이용자의 Google 기타 연락처를 조회하여 메일 작성 및 수신자 추천 등 주소록 기반 기능을 제공하기
                    위해 사용합니다.
                  </li>
                </ul>
              </li>
              <li>회사는 이용자가 허용하지 않은 Google 사용자 데이터에는 접근하지 않습니다.</li>
              <li>이용자는 언제든지 Google 계정 설정을 통해 서비스의 Google 계정 접근 권한을 해제할 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="제5조(서비스의 제공 내용)">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                회사는 회원에게 다음 각 호의 서비스를 제공할 수 있습니다.
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>여러 Gmail 계정의 통합 인박스 조회</li>
                  <li>메일 목록 및 상세 내용 조회</li>
                  <li>메일 스레드 조회</li>
                  <li>메일 검색</li>
                  <li>메일 라벨링 및 자동 분류</li>
                  <li>읽음/안읽음 상태 변경</li>
                  <li>메일 라벨 및 상태 변경</li>
                  <li>메일 삭제 요청 및 휴지통 이동/복구</li>
                  <li>AI 기반 메일 초안 작성</li>
                  <li>AI 기반 답장 추천</li>
                  <li>이용자의 Gmail 계정을 통한 메일 발송</li>
                </ul>
              </li>
              <li>회사는 운영상, 기술상 필요에 따라 서비스의 일부 또는 전부를 변경할 수 있습니다.</li>
              <li>
                회사는 서비스 변경이 이용자에게 중대한 영향을 미치는 경우 사전에 서비스 화면 또는 이메일 등을 통해
                안내합니다.
              </li>
            </ol>
          </Section>

          <Section title="제6조(AI 기능 이용)">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                회사는 이용자의 메일 작성 및 답장 작성을 보조하기 위해 AI 기반 초안 작성, 답장 추천 기능을 제공할 수
                있습니다.
              </li>
              <li>
                AI 기능은 이용자의 요청에 따라 선택된 메일 내용, 이용자가 입력한 내용 또는 대화 맥락을 기반으로
                동작합니다.
              </li>
              <li>
                AI 기능 제공을 위해 이용자가 요청한 메일 내용 또는 입력 내용이 AI 처리 서비스 제공업체에 전송될 수
                있습니다.
              </li>
              <li>AI가 생성한 내용은 참고용이며, 회사는 AI 생성 결과의 정확성, 완전성, 적법성을 보장하지 않습니다.</li>
              <li>이용자는 AI가 생성한 내용을 직접 검토한 후 사용해야 합니다.</li>
              <li>AI가 생성한 메일 내용을 검토하지 않고 사용하여 발생한 문제에 대한 책임은 이용자에게 있습니다.</li>
              <li>회사는 이용자의 Gmail 데이터를 광고 목적 또는 AI 모델 학습 목적으로 사용하지 않습니다.</li>
            </ol>
          </Section>

          <Section title="제7조(메일 발송)">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                회사는 이용자가 서비스에서 작성하거나 승인한 메일을 이용자의 Gmail 계정을 통해 발송할 수 있도록 기능을
                제공합니다.
              </li>
              <li>회사는 이용자의 명시적인 발송 요청 없이 메일을 자동으로 발송하지 않습니다.</li>
              <li>
                이용자가 서비스를 통해 발송한 메일의 내용, 수신자, 첨부파일 및 그로 인해 발생하는 법적 책임은 이용자에게
                있습니다.
              </li>
              <li>
                이용자는 스팸, 피싱, 사기, 명예훼손, 개인정보 침해, 저작권 침해 등 불법적이거나 부적절한 메일을
                발송해서는 안 됩니다.
              </li>
            </ol>
          </Section>

          <Section title="제8조(개인정보 및 Google 사용자 데이터 보호)">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                회사는 관련 법령 및 Google API Services User Data Policy를 준수하여 이용자의 개인정보와 Google 사용자
                데이터를 보호합니다.
              </li>
              <li>회사는 Google API를 통해 수집한 사용자 데이터를 서비스 제공 목적 범위 내에서만 사용합니다.</li>
              <li>
                회사의 Google API를 통해 수집한 정보의 사용 및 이전은 Google API Services User Data Policy의 Limited Use
                요구사항을 준수합니다.
              </li>
              <li>회사는 Google 사용자 데이터를 광고 목적으로 사용하지 않으며, 제3자에게 판매하지 않습니다.</li>
              <li>회사는 서비스 제공에 필요한 최소한의 데이터만 접근하고 저장합니다.</li>
              <li>
                개인정보 및 Google 사용자 데이터 처리에 관한 상세한 내용은 개인정보처리방침을 통해 확인할 수 있습니다.
              </li>
            </ol>
          </Section>

          <Section title="제9조(회원의 의무)">
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                회원은 다음 각 호의 행위를 하여서는 안 됩니다.
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>타인의 Google 계정을 무단으로 연결하거나 사용하는 행위</li>
                  <li>타인의 메일을 무단으로 열람, 저장, 전송하는 행위</li>
                  <li>허위 정보를 등록하거나 타인의 정보를 도용하는 행위</li>
                  <li>서비스의 정상적인 운영을 방해하는 행위</li>
                  <li>비정상적인 자동화 요청, 과도한 트래픽, 공격성 요청을 발생시키는 행위</li>
                  <li>회사 또는 제3자의 저작권, 개인정보, 명예 등 권리를 침해하는 행위</li>
                  <li>스팸, 피싱, 악성코드, 사기성 메일을 발송하는 행위</li>
                  <li>관련 법령, Google API 정책 또는 본 약관을 위반하는 행위</li>
                </ul>
              </li>
            </ol>
          </Section>

          <Section title="제10조(서비스 이용 제한 및 계약 해지)">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                회사는 회원이 다음 각 호에 해당하는 경우 서비스 이용을 제한하거나 계약을 해지할 수 있습니다.
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>본 약관을 위반한 경우</li>
                  <li>타인의 Google 계정을 무단으로 사용한 경우</li>
                  <li>서비스 운영을 고의 또는 중대한 과실로 방해한 경우</li>
                  <li>비정상적인 트래픽 또는 보안 위협을 발생시킨 경우</li>
                  <li>Google API 정책 또는 관련 법령을 위반한 경우</li>
                </ul>
              </li>
              <li>회원은 언제든지 서비스 탈퇴 또는 Google 계정 연결 해제를 요청할 수 있습니다.</li>
              <li>
                회원이 Google 계정 연결을 해제하는 경우 Gmail 데이터 동기화 및 일부 서비스 기능 이용이 제한될 수
                있습니다.
              </li>
            </ol>
          </Section>

          <Section title="제11조(서비스 중단)">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                회사는 다음 각 호에 해당하는 경우 서비스의 전부 또는 일부를 일시적으로 중단할 수 있습니다.
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>서버 점검, 유지보수 또는 배포가 필요한 경우</li>
                  <li>서비스 장애 또는 보안 사고가 발생한 경우</li>
                  <li>Google API, Gmail, 클라우드 인프라 등 외부 서비스 장애가 발생한 경우</li>
                  <li>네트워크 장애 또는 천재지변 등 불가항력적 사유가 발생한 경우</li>
                </ul>
              </li>
              <li>회사는 서비스 중단이 예상되는 경우 가능한 범위 내에서 사전에 안내합니다.</li>
              <li>긴급 장애, 보안 사고 등 부득이한 사유가 있는 경우 사전 안내 없이 서비스가 중단될 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="제12조(데이터 삭제 및 계정 연결 해제)">
            <ol className="list-decimal space-y-2 pl-5">
              <li>회원은 언제든지 서비스 탈퇴, Google 계정 연결 해제 또는 저장된 데이터 삭제를 요청할 수 있습니다.</li>
              <li>회사는 회원의 데이터 삭제 요청이 접수된 경우 본인 확인 후 관련 데이터를 삭제합니다.</li>
              <li>
                단, 관련 법령에 따라 일정 기간 보관이 필요한 정보는 해당 법령에서 정한 기간 동안 보관할 수 있습니다.
              </li>
              <li>
                데이터 삭제 요청은 아래 연락처를 통해 접수할 수 있습니다.
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>
                    이메일:{" "}
                    <a href="mailto:mailsangja2026@gmail.com" className="text-primary underline underline-offset-2">
                      mailsangja2026@gmail.com
                    </a>
                  </li>
                </ul>
              </li>
            </ol>
          </Section>

          <Section title="제13조(책임의 제한)">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                회사는 안정적인 서비스 제공을 위해 노력하나, 다음 각 호의 사유로 발생한 손해에 대해서는 책임을 지지
                않습니다.
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>이용자의 귀책 사유로 발생한 문제</li>
                  <li>이용자의 Google 계정 관리 소홀로 발생한 문제</li>
                  <li>Google API, Gmail, 외부 클라우드 서비스 장애로 발생한 문제</li>
                  <li>천재지변, 네트워크 장애, 서버 장애 등 불가항력적 사유로 발생한 문제</li>
                  <li>이용자가 AI 생성 결과를 검토하지 않고 사용하여 발생한 문제</li>
                  <li>이용자가 서비스를 통해 발송한 메일로 인해 발생한 분쟁</li>
                </ul>
              </li>
              <li>회사는 AI 기능이 생성한 결과의 정확성, 완전성, 적합성을 보장하지 않습니다.</li>
              <li>회사는 이용자의 명시적인 요청 또는 조작 없이 메일을 임의로 발송하지 않습니다.</li>
            </ol>
          </Section>

          <Section title="제14조(지식재산권)">
            <ol className="list-decimal space-y-2 pl-5">
              <li>서비스의 소프트웨어, 디자인, 로고, UI, 문서 등에 대한 권리는 회사에게 있습니다.</li>
              <li>이용자는 서비스를 이용함으로써 서비스 자체에 대한 소유권 또는 지식재산권을 취득하지 않습니다.</li>
              <li>
                이용자는 회사의 사전 동의 없이 서비스의 일부 또는 전부를 복제, 배포, 수정, 역설계하거나 상업적으로
                이용할 수 없습니다.
              </li>
            </ol>
          </Section>

          <Section title="제15조(약관의 변경)">
            <ol className="list-decimal space-y-2 pl-5">
              <li>회사는 필요한 경우 본 약관을 변경할 수 있습니다.</li>
              <li>회사는 약관을 변경하는 경우 변경 내용과 시행일을 서비스 화면 또는 이메일 등을 통해 안내합니다.</li>
              <li>회원이 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
              <li>변경된 약관 시행 이후에도 서비스를 계속 이용하는 경우 변경된 약관에 동의한 것으로 봅니다.</li>
            </ol>
          </Section>

          <Section title="제16조(분쟁 해결)">
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                회사와 회원 간에 발생한 서비스 이용과 관련한 분쟁은 원만한 합의에 의해 해결하는 것을 원칙으로 합니다.
              </li>
              <li>본 약관은 대한민국 법률에 따라 규정되고 이행됩니다.</li>
              <li>서비스 이용과 관련하여 소송이 제기되는 경우 관할 법원은 관련 법령에 따릅니다.</li>
            </ol>
          </Section>

          <div className="rounded-lg border bg-muted/30 px-6 py-4">
            <p className="text-sm font-medium">부칙</p>
            <p className="mt-1 text-sm text-muted-foreground">본 약관은 2026년 05월 25일부터 시행합니다.</p>
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
