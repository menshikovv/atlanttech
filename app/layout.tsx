import type React from "react"
import type { Metadata } from "next"
import { Prosto_One } from "next/font/google"
import { AnimatedBackground } from "@/components/animated-background"
import { YandexMetrica } from "@/components/yandex-metrica"
import { CookieConsent } from "@/components/cookie-consent"
import { Footer } from "@/components/footer"
import "./globals.css"

const prostoOne = Prosto_One({
  subsets: ["latin", "cyrillic"],
  weight: "400",
})

export const metadata: Metadata = {
  title: "Atlant Technology — ПО для киберспорта",
  description:
    "Разработка программного обеспечения для киберспортивных команд. Автоматизация скаутинга, аналитика, дашборды и CRM.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <body className={`${prostoOne.className} antialiased`}>
        <AnimatedBackground />
        {children}
        <Footer />
        <YandexMetrica />
        <CookieConsent />
      </body>
    </html>
  )
}
