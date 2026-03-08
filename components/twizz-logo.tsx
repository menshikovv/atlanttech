import { cn } from "@/lib/utils"
import Image from "next/image"

interface AtlantLogoProps {
  className?: string
  variant?: "full" | "icon"
}

export function AtlantLogo({ className, variant = "full" }: AtlantLogoProps) {
  return (
    <Image
      src={variant === "full" ? "/atlant-logo.png" : "/atlant-icon.png"}
      alt="Atlant Technology Logo"
      width={variant === "full" ? 211 : 100}
      height={variant === "full" ? 211 : 100}
      className={cn(className)}
      priority
    />
  )
}

// Backward compatibility
export const TwizzLogo = AtlantLogo
