import type { Metadata } from "next"
import { Suspense } from "react"
import { PaymentStatus } from "@/components/payment-status"

export const metadata: Metadata = {
  title: "Оплата не завершена | Atlant Technology",
  description: "Платёж был отменён или не прошёл. Можно попробовать оплату ещё раз.",
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<PaymentFallback />}>
      <PaymentStatus variant="fail" />
    </Suspense>
  )
}

function PaymentFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
    </div>
  )
}
