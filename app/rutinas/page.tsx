"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/services/auth-context"
import { TrainerLayout } from "@/components/layout/TrainerLayout"
import { RoutinesTab } from "@/features/routines"
import { Loader2 } from "lucide-react"

const DRAFT_STORAGE_KEY = "rutina-nueva-draft"

export default function RutinasPage() {
  const { loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isDraftChecking, setIsDraftChecking] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth?redirect=/rutinas')
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (loading || !isAuthenticated) return
    try {
      const draft = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (draft) {
        router.push('/rutinas/nueva')
        return
      }
    } catch {
      // ignore storage errors
    }
    setIsDraftChecking(false)
  }, [loading, isAuthenticated, router])

  if (loading || isDraftChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Cargando...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return (
    <TrainerLayout>
      <div className="space-y-4">

        <RoutinesTab />
      </div>
    </TrainerLayout>
  )
}
