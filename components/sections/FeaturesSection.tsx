import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import React from "react"

import {
  Users,
  Calendar,
  Activity,
  BarChart3,
  MessageSquare,
  Smartphone,
} from "lucide-react"

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}


const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <Card className="bg-card/50 border-border hover:bg-card/80 transition-all duration-300 hover:scale-105">
    <CardHeader className="text-center">
      <div className="mx-auto w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-center">{description}</CardDescription>
    </CardContent>
  </Card>
)

export function FeaturesSection() {
      const features = [
    {
      icon: Users,
      title: "Gestión de Clientes",
      description: "Administra todos tus clientes en un solo lugar con perfiles detallados y seguimiento de progreso."
    },
    {
      icon: Activity,
      title: "Rutinas Personalizadas",
      description: "Crea rutinas específicas para cada cliente con nuestra biblioteca de ejercicios."
    },
    {
      icon: Calendar,
      title: "Agenda Inteligente (WIP)",
      description: "Programa sesiones, recibe recordatorios automáticos y nunca pierdas una cita importante."
    },
    {
      icon: BarChart3,
      title: "Análisis y Reportes (WIP)",
      description: "Visualiza el progreso de tus clientes con gráficos detallados y métricas de rendimiento."
    },
    {
      icon: MessageSquare,
      title: "Agente de Inteligencia Artificial (WIP)",
      description: "Agente de IA integrado para ayudarte a crear rutinas y responder preguntas comunes."
    },
    {
      icon: Smartphone,
      title: "Acceso Móvil (WIP)",
      description: "Gestiona tu negocio desde cualquier lugar con nuestra aplicación móvil optimizada."
    }
  ]
  return (
    <section id="features" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-primary/20 text-primary border-primary/30">
              Características
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold">
              Todo lo que necesitas en una plataforma
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Herramientas profesionales diseñadas específicamente para entrenadores personales y gimnasios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>
    );
}