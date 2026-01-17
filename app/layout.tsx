import type React from "react"
import type { Metadata } from "next"
import { Prosto_One } from "next/font/google"
import { GoogleAnalytics } from "@/components/google-analytics"
import { AnimatedBackground } from "@/components/animated-background"
import "./globals.css"

const prostoOne = Prosto_One({
  subsets: ["latin", "cyrillic"],
  weight: "400"
})

export const metadata: Metadata = {
  title: "Twizz Project — ПО для киберспорта",
  description:
    "Разработка программного обеспечения для киберспортивных команд. Автоматизация скаутинга, аналитика, дашборды и CRM.",
  keywords: ["киберспорт", "esports", "скаутинг", "аналитика", "CRM", "разработка ПО", "ScoutScope", "PerformanceCoach", "AI", "машинное обучение"],
  authors: [{ name: "Twizz" }],
  creator: "Twizz",
  publisher: "Twizz",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://twizz-project.ru',
    siteName: 'Scout Scope',
    title: 'Scout Scope — ПО для киберспорта',
    description: 'Разработка программного обеспечения для киберспортивных команд. Автоматизация скаутинга, аналитика, дашборды и CRM.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scout Scope — ПО для киберспорта',
    description: 'Разработка программного обеспечения для киберспортивных команд. Автоматизация скаутинга, аналитика, дашборды и CRM.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://twizz.ru',
  },
  category: 'technology',
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
        <GoogleAnalytics />
      </body>
    </html>
  )
}
