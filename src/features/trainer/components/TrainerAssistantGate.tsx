"use client"

import { useAuth } from "@/features/auth/services/auth-context"
import { usePathname } from "next/navigation"
import { TrainerAssistant } from "./TrainerAssistant"

export function TrainerAssistantGate() {
  const { loading, isAuthenticated } = useAuth()
  const pathname = usePathname()

  // Never show assistant UI on the public landing page.
  if (pathname === "/") return null

  if (loading || !isAuthenticated) return null

  return <TrainerAssistant />
}
