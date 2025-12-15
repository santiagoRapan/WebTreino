"use client"

import { useEffect } from "react"
<<<<<<< HEAD
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/services/auth"
=======
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/services/auth-context"
>>>>>>> agent2.0
import { TrainerLayout } from "@/components/layout/TrainerLayout"
import { RoutinesTab } from "@/features/routines"
import { Loader2 } from "lucide-react"

export default function RutinasPage() {
  const { authUser, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth?redirect=/rutinas')
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
<<<<<<< HEAD
      <RoutinesTab action={searchParams.get('action')} />
=======
      <div className="space-y-4">
       
        <RoutinesTab />
      </div>
>>>>>>> agent2.0
    </TrainerLayout>
  )
}
