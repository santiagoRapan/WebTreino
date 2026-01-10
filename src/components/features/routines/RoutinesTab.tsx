"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { RoutinesTab as FeatureRoutinesTab } from "@/features/routines"

interface RoutinesTabProps {
  action?: string | null
}

/**
 * Legacy wrapper kept for backwards compatibility.
 * The real implementation lives under `src/features/routines`.
 */
export function RoutinesTab({ action }: RoutinesTabProps) {
  const router = useRouter()
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    if (action !== "create") return

    processed.current = true
    router.replace("/rutinas?action=newRoutine", { scroll: false })
  }, [action, router])

  return <FeatureRoutinesTab />
}
