"use client"

import { useRouter } from "next/navigation"
import { NavigationBar} from "./sections/NavigationBar"
import { HeroSection } from "./sections/HeroSection"
import { FeaturesSection } from "./sections/FeaturesSection"
import { Footer } from "./sections/Footer"


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