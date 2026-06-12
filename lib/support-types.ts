export type SupportStatus = "new" | "read" | "closed"

export type SupportTicket = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
  status: SupportStatus
}
