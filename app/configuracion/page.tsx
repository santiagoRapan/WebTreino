"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/services/auth-context"
import { TrainerLayout } from "@/components/layout/TrainerLayout"
import { SettingsTab } from "@/features/dashboard"
import { Loader2 } from "lucide-react"

export default function ConfiguracionPage() {
  const { authUser, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth?redirect=/configuracion')
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
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
        
        <SettingsTab />
      </div>
    </TrainerLayout>
  )
}
