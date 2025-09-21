"use client"

import { useTrainerDashboard } from "@/components/trainer/TrainerDashboardContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, DollarSign, Users, ChevronRight } from "lucide-react"

export function DashboardTab() {
  const {
    data: { stats, recentClients },
    actions: {
      handleViewAllClients,
      handleNewClient,
      handleCreateRoutine,
      handleRegisterPayment,
    },
  } = useTrainerDashboard()

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido de vuelta, entrenador</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
                  <p className="text-sm text-primary">{stat.change}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Alumnos Recientes</CardTitle>
            <CardDescription>Actividad y progreso de tus alumnos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentClients.map((client) => (
              <div key={client.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <Avatar>
                  <AvatarImage src={client.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {client.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-card-foreground">{client.name}</p>
                  <p className="text-sm text-muted-foreground">Última sesión: {client.lastSession}</p>
                </div>
                <div className="text-right">
                  <Badge variant={client.status === "Activo" ? "default" : "secondary"}>{client.status}</Badge>
                  <p className="text-sm text-primary mt-1">{client.progress}% progreso</p>
                </div>
              </div>
            ))}
            <Button
              className="w-full bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors"
              variant="outline"
              onClick={handleViewAllClients}
            >
              Ver Todos los Alumnos
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Acciones Rápidas</CardTitle>
          <CardDescription>Herramientas frecuentemente utilizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              className="h-20 flex-col gap-2 bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors"
              variant="outline"
              onClick={handleNewClient}
            >
              <Users className="w-6 h-6" />
              <span className="text-sm">Nuevo Alumno</span>
            </Button>
            <Button
              className="h-20 flex-col gap-2 bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors"
              variant="outline"
              onClick={handleCreateRoutine}
            >
              <Activity className="w-6 h-6" />
              <span className="text-sm">Crear Rutina</span>
            </Button>
            <Button
              className="h-20 flex-col gap-2 bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors"
              variant="outline"
              onClick={handleRegisterPayment}
            >
              <DollarSign className="w-6 h-6" />
              <span className="text-sm">Registrar Pago</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
