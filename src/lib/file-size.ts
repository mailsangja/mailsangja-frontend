const FILE_SIZE_UNITS = ["KB", "MB", "GB"] as const

export function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B"
  }

  if (bytes < 1024) {
    return `${bytes} B`
  }

  let size = bytes / 1024
  let unitIndex = 0

  while (size >= 1024 && unitIndex < FILE_SIZE_UNITS.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  const formattedSize = size >= 10 ? size.toFixed(0) : size.toFixed(1)

  return `${formattedSize} ${FILE_SIZE_UNITS[unitIndex]}`
}
