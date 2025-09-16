"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Calendar,
  Activity,
  Smartphone,
  BarChart3,
  MessageSquare,
  Dumbbell,
  Target,
  TrendingUp,
  Star,
  ArrowRight,
  Play,
  Menu,
  X,
  Globe,
  Shield,
  Zap,
  Heart,
  Clock,
  Award,
  ChevronRight,
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





export default function LandingPage() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleGetStarted = () => {
    router.push('/auth?mode=signup')
  }

  const handleLogin = () => {
    router.push('/auth')
  }

  const handleSignIn = () => {
    router.push('/auth?mode=signup')
  }

  const features = [
    {
      icon: Users,
      title: "Gestión de Clientes",
      description: "Administra todos tus clientes en un solo lugar con perfiles detallados y seguimiento de progreso."
    },
    {
      icon: Calendar,
      title: "Agenda Inteligente",
      description: "Programa sesiones, recibe recordatorios automáticos y nunca pierdas una cita importante."
    },
    {
      icon: Activity,
      title: "Rutinas Personalizadas",
      description: "Crea rutinas específicas para cada cliente con nuestra biblioteca de ejercicios."
    },
    {
      icon: BarChart3,
      title: "Análisis y Reportes",
      description: "Visualiza el progreso de tus clientes con gráficos detallados y métricas de rendimiento."
    },
    {
      icon: MessageSquare,
      title: "Chat Integrado",
      description: "Comunícate directamente con tus clientes, comparte rutinas y resuelve dudas al instante."
    },
    {
      icon: Smartphone,
      title: "Acceso Móvil",
      description: "Gestiona tu negocio desde cualquier lugar con nuestra aplicación móvil optimizada."
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Dumbbell className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-primary">Treino</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-foreground hover:text-primary transition-colors">Características</a>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors">Contacto</a>
            </div>

            <div className="hidden md:flex space-x-4">
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={handleLogin}
              >
                Iniciar Sesión
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={handleSignIn}
              >
                Registrarse
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-foreground"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-foreground hover:text-primary transition-colors">Características</a>
                <a href="#contact" className="text-foreground hover:text-primary transition-colors">Contacto</a>
                <div className="flex flex-col space-y-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={handleLogin}
                  >
                    Iniciar Sesión
                  </Button>
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                    onClick={handleSignIn}
                  >
                    Registrarse
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center space-y-8">

            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Transforma tu
              <span className="text-primary"> Negocio Fitness</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              La plataforma todo-en-uno que necesitas para gestionar clientes, crear rutinas personalizadas 
              y hacer crecer tu negocio como entrenador personal.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-4"
                onClick={handleSignIn}
              >
                <Play className="w-5 h-5 mr-2" />
                Ver Demo Gratis
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-lg px-8 py-4"
                onClick={handleSignIn}
              >
                Comenzar Prueba
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
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

      {/* Benefits Section */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                <Target className="w-4 h-4 mr-2" />
                Resultados Comprobados
              </Badge>
              
              <h2 className="text-3xl md:text-5xl font-bold">
                Aumenta tus ingresos hasta un <span className="text-primary">300%</span>
              </h2>
              
              <p className="text-xl text-muted-foreground">
                Los entrenadores que usan Treino reportan un crecimiento significativo en su clientela 
                y ingresos gracias a la profesionalización de sus servicios.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Ahorra 15+ horas semanales</h3>
                    <p className="text-muted-foreground">Automatiza tareas repetitivas y enfócate en lo que realmente importa: entrenar.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Mejora la retención de clientes</h3>
                    <p className="text-muted-foreground">El 94% de nuestros usuarios reporta mayor satisfacción y retención de clientes.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Imagen profesional</h3>
                    <p className="text-muted-foreground">Impresiona a tus clientes con una plataforma moderna y profesional.</p>
                  </div>
                </div>
              </div>

              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90"
                onClick={handleSignIn}
              >
                Comenzar Ahora
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="relative">
              <div className="bg-card/50 rounded-lg p-8 border border-border">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Ingresos Mensuales</span>
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary">$15,750</div>
                  <div className="text-sm text-muted-foreground">+285% vs año anterior</div>
                  
                  <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg flex items-end p-4">
                    <div className="w-full flex items-end space-x-2">
                      <div className="bg-primary/60 w-4 h-8 rounded-sm"></div>
                      <div className="bg-primary/70 w-4 h-12 rounded-sm"></div>
                      <div className="bg-primary/80 w-4 h-16 rounded-sm"></div>
                      <div className="bg-primary w-4 h-24 rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute -top-4 -right-4 bg-card/80 border border-border rounded-lg p-4 backdrop-blur">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">+12 nuevos clientes</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-card/80 border border-border rounded-lg p-4 backdrop-blur">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">4.9/5 satisfacción</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold">
              ¿Listo para transformar tu negocio?
            </h2>
            <p className="text-xl text-muted-foreground">
              Únete a miles de entrenadores que ya han revolucionado su forma de trabajar con Treino.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-4"
                onClick={handleSignIn}
              >
                <Play className="w-5 h-5 mr-2" />
                Comenzar Prueba Gratis
              </Button>
              <p className="text-sm text-muted-foreground">
                14 días gratis • Sin tarjeta de crédito • Cancelación inmediata
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Dumbbell className="w-8 h-8 text-primary" />
                <span className="text-2xl font-bold text-primary">Treino</span>
              </div>
              <p className="text-muted-foreground">
                La plataforma todo-en-uno para entrenadores personales que quieren profesionalizar su negocio.
              </p>
              <div className="flex space-x-4">
                <Globe className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer" />
                <Shield className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer" />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <div className="space-y-2 text-muted-foreground">
                <div className="hover:text-primary cursor-pointer">Características</div>
                <div className="hover:text-primary cursor-pointer">Precios</div>
                <div className="hover:text-primary cursor-pointer">API</div>
                <div className="hover:text-primary cursor-pointer">Integraciones</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Recursos</h4>
              <div className="space-y-2 text-muted-foreground">
                <div className="hover:text-primary cursor-pointer">Blog</div>
                <div className="hover:text-primary cursor-pointer">Guías</div>
                <div className="hover:text-primary cursor-pointer">Centro de Ayuda</div>
                <div className="hover:text-primary cursor-pointer">Webinars</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <div className="space-y-2 text-muted-foreground">
                <div className="hover:text-primary cursor-pointer">Sobre Nosotros</div>
                <div className="hover:text-primary cursor-pointer">Carreras</div>
                <div className="hover:text-primary cursor-pointer">Contacto</div>
                <div className="hover:text-primary cursor-pointer">Privacidad</div>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Treino. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}