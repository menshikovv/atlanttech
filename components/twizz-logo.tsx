import { cn } from "@/lib/utils"
import Image from "next/image"

interface TwizzLogoProps {
  className?: string
}

export function TwizzLogo({ className }: TwizzLogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt="Scout Scope Logo"
      width={211}
      height={55}
      className={cn("text-primary", className)}
      priority
    />
  )
}
