import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { PartnersSection } from "@/components/partners-section"
import { CasesSection } from "@/components/cases-section"
import { VideoDemoSection } from "@/components/video-demo-section"
import { PricingSection } from "@/components/pricing-section"
import { FaqSection } from "@/components/faq-section"
import { ContactSection } from "@/components/contact-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative">
      <Header />
      <HeroSection />
      <PartnersSection />
      <CasesSection />
      <VideoDemoSection />
      <PricingSection />
      <ContactSection />
      <FaqSection />
    </main>
  )
}
