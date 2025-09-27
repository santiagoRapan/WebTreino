"use client"

import { useRouter } from "next/navigation"
import { NavigationBar} from "./NavigationBar"
import { HeroSection } from "./HeroSection"
import { FeaturesSection } from "./FeaturesSection"
import { Footer } from "./Footer"


export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavigationBar />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </div>
  )
}