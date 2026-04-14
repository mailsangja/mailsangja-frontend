const NAMED_HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
}

function decodeHtmlEntity(entity: string): string | null {
  if (entity.startsWith("#x") || entity.startsWith("#X")) {
    const codePoint = Number.parseInt(entity.slice(2), 16)

    if (Number.isNaN(codePoint)) {
      return null
    }

    return String.fromCodePoint(codePoint)
  }

  if (entity.startsWith("#")) {
    const codePoint = Number.parseInt(entity.slice(1), 10)

    if (Number.isNaN(codePoint)) {
      return null
    }

    return String.fromCodePoint(codePoint)
  }

  return NAMED_HTML_ENTITIES[entity] ?? null
}

export function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]+);/g, (match, entity) => {
    return decodeHtmlEntity(entity) ?? match
  })
}

export function normalizeSnippetText(value: string): string {
  return decodeHtmlEntities(value)
    .replace(/[\u034F\u200B-\u200D\u2060\uFEFF]/g, "")
    .trim()
}
