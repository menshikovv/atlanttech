import { NextResponse } from "next/server"
import {
  getSupportTickets,
  createSupportTicket,
} from "@/lib/support-storage"
import type { SupportTicket } from "@/lib/support-types"

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
    if (role !== "admin" && role !== "main_admin") {
      return { ok: false, error: "Not an admin" }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: "Failed to verify token" }
  }
}

export async function GET(request: Request) {
  const auth = await verifyAdmin(request)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }
  const tickets: SupportTicket[] = getSupportTickets()
  return NextResponse.json({ items: tickets, total: tickets.length })
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string
      email?: string
      subject?: string
      message?: string
    }
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const ticket = createSupportTicket({
      name: body.name,
      email: body.email,
      subject: body.subject,
      message: body.message,
    })
    return NextResponse.json({ item: ticket }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
