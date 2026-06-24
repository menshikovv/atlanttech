import fs from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), ".data")
const BUILDS_DIR = path.join(DATA_DIR, "app-builds")
const META_PATH = path.join(DATA_DIR, "app-builds.json")

export type AppBuild = {
  slug: string
  fileName: string // имя файла на диске
  originalName: string
  size: number
  version: number
  uploadedAt: string
}

function ensureDirs() {
  if (!fs.existsSync(BUILDS_DIR)) {
    fs.mkdirSync(BUILDS_DIR, { recursive: true })
  }
}

function readMeta(): Record<string, AppBuild> {
  ensureDirs()
  try {
    return JSON.parse(fs.readFileSync(META_PATH, "utf-8")) as Record<string, AppBuild>
  } catch {
    return {}
  }
}

function writeMeta(meta: Record<string, AppBuild>) {
  ensureDirs()
  fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2), "utf-8")
}

export function safeSlug(value: string): string {
  return String(value || "")
    .replace(/[^a-z0-9_-]/gi, "")
    .slice(0, 64)
}

function extOf(name: string): string {
  const ext = path.extname(name || "")
  return /^\.[a-z0-9]+$/i.test(ext) ? ext.toLowerCase() : ""
}

export function getBuilds(): AppBuild[] {
  return Object.values(readMeta()).sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  )
}

export function getBuild(slug: string): AppBuild | null {
  return readMeta()[safeSlug(slug)] ?? null
}

// Сохраняет (или обновляет) билд. При повторной загрузке версия увеличивается,
// файл на диске перезаписывается.
export function saveBuild(slug: string, originalName: string, data: Buffer): AppBuild {
  ensureDirs()
  const clean = safeSlug(slug)
  if (!clean) {
    throw new Error("Invalid slug")
  }
  const meta = readMeta()
  const prev = meta[clean]
  const version = (prev?.version ?? 0) + 1
  const ext = extOf(originalName)
  const fileName = `${clean}${ext}`

  // Если расширение изменилось — удаляем старый файл, чтобы не плодить хвосты.
  if (prev && prev.fileName !== fileName) {
    try {
      fs.unlinkSync(path.join(BUILDS_DIR, prev.fileName))
    } catch {
      // ignore
    }
  }

  fs.writeFileSync(path.join(BUILDS_DIR, fileName), data)

  const build: AppBuild = {
    slug: clean,
    fileName,
    originalName: originalName || fileName,
    size: data.length,
    version,
    uploadedAt: new Date().toISOString(),
  }
  meta[clean] = build
  writeMeta(meta)
  return build
}

export function getBuildFile(slug: string): { build: AppBuild; fullPath: string } | null {
  const build = getBuild(slug)
  if (!build) return null
  const fullPath = path.join(BUILDS_DIR, build.fileName)
  if (!fs.existsSync(fullPath)) return null
  return { build, fullPath }
}

export function deleteBuild(slug: string): boolean {
  const clean = safeSlug(slug)
  const meta = readMeta()
  const prev = meta[clean]
  if (!prev) return false
  try {
    fs.unlinkSync(path.join(BUILDS_DIR, prev.fileName))
  } catch {
    // ignore
  }
  delete meta[clean]
  writeMeta(meta)
  return true
}
