"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NavigationBar, Footer } from "@/features/landing"
import { Users, Code, Heart, Target } from "lucide-react"

interface TeamMember {
  id: number
  name: string
  role: string
  image: string
  description: string
}

export default function AboutPage() {
  // Placeholders para los 7 desarrolladores
  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: "Rodrigo Hernández",
      role: "Product Manager & Mobile Developer",
      image: "/placeholder-user.jpg",
      description: "Desarrollador especializado en aplicaciones móviles."
    },
    {
      id: 2,
      name: "Joaquín Nolasco de Carlés", 
      role: "Backend Developer",
      image: "/placeholder-user.jpg",
      description: "Desarrollador especializado en Backend y APIs."
    },
    {
      id: 3,
      name: "Santiago Rapan",
      role: "Backend Developer", 
      image: "/placeholder-user.jpg",
      description: "Desarrollador especializado en Backend y APIs."
    },
    {
      id: 4,
      name: "Nicanor Novotny",
      role: "Backend Developer",
      image: "/placeholder-user.jpg", 
      description: "Desarrollador especializado en Backend y APIs."
    },
    {
      id: 5,
      name: "Agustin Korman",
      role: "Mobile Developer",
      image: "/placeholder-user.jpg",
      description: "Desarrollador especializado en aplicaciones móviles."
    },
    {
      id: 6,
      name: "Franco M. Pampuri",
      role: "Frontend Developer",
      image: "/placeholder-user.jpg",
      description: "Desarrollador especializado en Frontend y UI/UX"
    },
    {
      id: 7,
      name: "Jonas Glaubart",
      role: "Frontend Developer",
      image: "/placeholder-user.jpg",
      description: "Desarrollador especializado en Frontend y UI/UX"
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-md font-bold shadow-lg">
        ✅ MIGRATED - About (Landing Feature)
      </div>
      <NavigationBar />
      
      <main className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center space-y-6 mb-20">
            <Badge className="bg-primary/20 text-primary border-primary/30">
              Sobre Nosotros
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Conoce al equipo detrás de
              <span className="text-primary"> Treino</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Somos un equipo apasionado de desarrolladores y diseñadores comprometidos con revolucionar 
              la industria del fitness a través de la tecnología.
            </p>
          </div>

          {/* Our Story */}
          <div className="mb-20">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-5xl font-bold">Nuestra Historia</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Cómo nació la idea de transformar la industria del fitness
              </p>
            </div>
            
            <Card className="bg-card/50 border-border">
              <CardContent className="p-8 md:p-12">
                <div className="prose prose-lg max-w-none text-foreground">
                  <p className="text-lg leading-relaxed mb-6">
                    Todo comenzó cuando nos dimos cuenta de que los entrenadores personales enfrentaban 
                    desafíos diarios para gestionar sus clientes, crear rutinas personalizadas y hacer 
                    crecer su negocio. La mayoría dependía de métodos tradicionales como hojas de cálculo, 
                    aplicaciones básicas o incluso papel y bolígrafo.
                  </p>
                  
                  <p className="text-lg leading-relaxed mb-6">
                    Como equipo de desarrolladores apasionados por el fitness y la tecnología, vimos 
                    una oportunidad única de crear algo diferente. Queríamos construir una plataforma 
                    que no solo resolviera estos problemas, sino que también elevara el nivel de 
                    profesionalismo en la industria.
                  </p>
                  
                  <p className="text-lg leading-relaxed mb-6">
                    Después de meses de investigación, entrevistas con entrenadores y iteraciones de 
                    diseño, nació <span className="text-primary font-semibold">Treino</span>. Una 
                    plataforma todo-en-uno que combina gestión de clientes, creación de rutinas, 
                    seguimiento de progreso y herramientas de comunicación en una experiencia 
                    intuitiva y poderosa.
                  </p>
                  
                  <p className="text-lg leading-relaxed">
                    Hoy, seguimos comprometidos con nuestra misión: empoderar a los entrenadores 
                    personales con las mejores herramientas tecnológicas para que puedan enfocarse 
                    en lo que realmente importa, transformar vidas a través del fitness.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Section */}
          <div className="mb-20">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-5xl font-bold">Nuestro Equipo</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Los talentosos profesionales que hacen posible Treino
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {teamMembers.map((member) => (
                <Card key={member.id} className="bg-card/50 border-border hover:bg-card/80 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {member.name}
                    </h3>
                    <p className="text-primary font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {member.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}