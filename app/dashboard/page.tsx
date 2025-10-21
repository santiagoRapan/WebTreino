"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth"
import { TrainerLayout } from "@/components/layout/TrainerLayout"
import { DashboardTab } from "@/features/dashboard"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { authUser, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated
    // Add a small delay to prevent race conditions
    if (!loading && !isAuthenticated) {
      const timeoutId = setTimeout(() => {
        // Double-check authentication state before redirecting
        if (!isAuthenticated) {
          router.push('/auth?redirect=/dashboard')
        }
      }, 100) // Small delay to prevent race conditions

      return () => clearTimeout(timeoutId)
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Verificando autenticación...</span>
        </div>
      </div>
    )
  }

  return (
    <TrainerLayout>
      <div className="space-y-4">
       
        <DashboardTab />
      </div>
    </TrainerLayout>
  )
}