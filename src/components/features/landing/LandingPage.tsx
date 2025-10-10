"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/services/auth"
import { NavigationBar} from "./NavigationBar"
import { HeroSection } from "./HeroSection"
import { FeaturesSection } from "./FeaturesSection"
import { Footer } from "./Footer"


export default function LandingPage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      console.log('User is authenticated, redirecting to dashboard...')
      router.push('/dashboard')
    }
  }, [isAuthenticated, loading, router])

  // Show nothing while checking auth to avoid flash of landing page
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground">Cargando...</span>
        </div>
      </div>
    )
  }

  // Only show landing page if not authenticated
  if (isAuthenticated) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavigationBar />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </div>
  )
}