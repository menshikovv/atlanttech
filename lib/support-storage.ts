import fs from "fs"
import path from "path"
import type { SupportTicket, SupportStatus } from "@/lib/support-types"

const DATA_DIR = path.join(process.cwd(), ".data")
const FILE_PATH = path.join(DATA_DIR, "support.json")

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function readAll(): SupportTicket[] {
  ensureDataDir()
  try {
    const raw = fs.readFileSync(FILE_PATH, "utf-8")
    return JSON.parse(raw) as SupportTicket[]
  } catch {
    return []
  }
}

function writeAll(tickets: SupportTicket[]) {
  ensureDataDir()
  fs.writeFileSync(FILE_PATH, JSON.stringify(tickets, null, 2), "utf-8")
}

export function getSupportTickets(): SupportTicket[] {
  return readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getSupportTicketById(id: string): SupportTicket | null {
  return readAll().find((t) => t.id === id) ?? null
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function createSupportTicket(data: {
  name: string
  email: string
  subject: string
  message: string
}): SupportTicket {
  const tickets = readAll()
  const ticket: SupportTicket = {
    id: generateId(),
    name: data.name,
    email: data.email,
    subject: data.subject,
    message: data.message,
    createdAt: new Date().toISOString(),
    status: "new",
  }
  tickets.push(ticket)
  writeAll(tickets)
  return ticket
}

export function updateSupportTicketStatus(
  id: string,
  status: SupportStatus
): SupportTicket | null {
  const tickets = readAll()
  const index = tickets.findIndex((t) => t.id === id)
  if (index === -1) return null
  tickets[index].status = status
  writeAll(tickets)
  return tickets[index]
}

export function deleteSupportTicket(id: string): boolean {
  const tickets = readAll()
  const filtered = tickets.filter((t) => t.id !== id)
  if (filtered.length === tickets.length) return false
  writeAll(filtered)
  return true
}
