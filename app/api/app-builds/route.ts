import { NextResponse } from "next/server"
import { getBuilds, saveBuild } from "@/lib/app-builds-storage"

export const runtime = "nodejs"
export const maxDuration = 60

const API_PREFIX = "https://atlanttech.pro/api/site"

async function verifyAdmin(request: Request): Promise<{ ok: boolean; error?: string }> {
  const auth = request.headers.get("Authorization")
  if (!auth || !auth.startsWith("Bearer ")) {
    return { ok: false, error: "Missing Authorization header" }
  }
  const token = auth.slice(7)
  try {
    const res = await fetch(`${API_PREFIX}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return { ok: false, error: "Invalid token" }
    const payload = (await res.json()) as { user: { siteRole?: string } }
    const role = (payload.user?.siteRole ?? "").trim().toLowerCase()
    // Загружать сборки может только main_admin.
    if (role !== "main_admin") {
      return { ok: false, error: "Only main admin can upload builds" }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: "Failed to verify token" }
  }
}

// Список загруженных сборок с версиями (публично — нужно для кнопки скачивания).
export async function GET() {
  return NextResponse.json({ items: getBuilds() })
}

export async function POST(request: Request) {
  const auth = await verifyAdmin(request)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 })
  }

  const slug = String(form.get("slug") || "").trim()
  const file = form.get("file")

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 })
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const build = saveBuild(slug, file.name, buffer)
    return NextResponse.json({ build }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save build"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
