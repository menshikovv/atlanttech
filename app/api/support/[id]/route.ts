import { NextResponse } from "next/server"
import {
  getSupportTicketById,
  updateSupportTicketStatus,
  deleteSupportTicket,
} from "@/lib/support-storage"
import type { SupportStatus } from "@/lib/support-types"

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin(request)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  const { id } = await params
  const existing = getSupportTicketById(id)
  if (!existing) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
  }

  try {
    const body = (await request.json()) as { status?: SupportStatus }
    if (!body.status || !["new", "read", "closed"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    const ticket = updateSupportTicketStatus(id, body.status)
    return NextResponse.json({ item: ticket })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdmin(request)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  const { id } = await params
  const deleted = deleteSupportTicket(id)
  if (!deleted) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
  }
  return NextResponse.json({ status: "deleted" })
}
