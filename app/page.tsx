import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CasesSection } from "@/components/cases-section"
import { VideoDemoSection } from "@/components/video-demo-section"
import { PricingSection } from "@/components/pricing-section"
import { FaqSection } from "@/components/faq-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative">
      <Header />
      <HeroSection />
      <CasesSection />
      <VideoDemoSection />
      <PricingSection />
      <ContactSection />
      <FaqSection />
      <Footer />
    </main>
  )
}
