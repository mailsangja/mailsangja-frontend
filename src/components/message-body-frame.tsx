import { useState } from "react"

export function MessageBodyFrame({ html }: { html: string }) {
  const [height, setHeight] = useState(0)

  const srcDoc = `<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>html,body{margin:0;padding:0;font-family:ui-sans-serif,system-ui,sans-serif;font-size:14px;color:#111;word-break:break-word;overflow-wrap:anywhere;overflow:hidden}img{max-width:100%;height:auto}</style></head><body>${html}</body></html>`

  return (
    <iframe
      title="메일 본문"
      sandbox="allow-same-origin allow-popups"
      srcDoc={srcDoc}
      className="w-full border-0 bg-white"
      style={{ height: height || 200 }}
      onLoad={(event) => {
        const doc = event.currentTarget.contentDocument
        if (!doc) return
        const next = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight)
        setHeight(next)
      }}
    />
  )
}
