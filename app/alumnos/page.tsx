"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/services/auth"
import { TrainerLayout } from "@/components/features/trainer/TrainerLayout"
import { ClientsTab } from "@/components/features/trainer/ClientsTab"
import { Loader2 } from "lucide-react"

export default function AlumnosPage() {
  const { authUser, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth?redirect=/alumnos')
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
      <ClientsTab />
    </TrainerLayout>
  )
}
