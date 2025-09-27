"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, User, Shield, Palette, Bell, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"
import { useState } from "react"

export function SettingsTab() {
  const { signOut, authUser, customUser, refreshUserData } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente.",
      })
      // Redirect to home/landing page
      router.push("/")
    } catch (error) {
      console.error("Error during logout:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al cerrar sesión. Inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleRefreshData = async () => {
    try {
      setIsRefreshing(true)
      await refreshUserData()
      toast({
        title: "Datos actualizados",
        description: "Tu información se ha actualizado correctamente.",
      })
    } catch (error) {
      console.error("Error refreshing user data:", error)
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsRefreshing(false)
    }
  };

  return (
    <main className="p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Configuración</h2>
          <p className="text-muted-foreground">Gestiona tu cuenta y preferencias</p>
        </div>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Profile Information */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <User className="w-5 h-5" />
                  Información del Perfil
                </CardTitle>
                <CardDescription>Información básica de tu cuenta</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshData}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Actualizando...' : 'Actualizar'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-foreground">{authUser?.email || "No disponible"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                <p className="text-foreground">
                  {isRefreshing ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Cargando...
                    </span>
                  ) : (
                    customUser?.name || "No disponible"
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Rol</label>
                <p className="text-foreground">
                  {isRefreshing ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Cargando...
                    </span>
                  ) : (
                    customUser?.role || "No disponible"
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Palette className="w-5 h-5" />
              Preferencias
            </CardTitle>
            <CardDescription>Personaliza tu experiencia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Tema de la aplicación</p>
                <p className="text-sm text-muted-foreground">Cambia entre tema claro y oscuro</p>
              </div>
              <Button
                variant="outline"
                className="hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={toggleTheme}
              >
                Cambiar tema
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Idioma</p>
                <p className="text-sm text-muted-foreground">Selecciona tu idioma preferido</p>
              </div>
              <Button variant="outline" className="hover:bg-accent hover:text-accent-foreground transition-colors">
                Español
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Bell className="w-5 h-5" />
              Notificaciones
            </CardTitle>
            <CardDescription>Gestiona cómo recibes notificaciones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Notificaciones por email</p>
                <p className="text-sm text-muted-foreground">Recibe actualizaciones importantes por correo</p>
              </div>
              <Button variant="outline" className="hover:bg-accent hover:text-accent-foreground transition-colors">
                Activadas
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Notificaciones push</p>
                <p className="text-sm text-muted-foreground">Recibe notificaciones en tiempo real</p>
              </div>
              <Button variant="outline" className="hover:bg-accent hover:text-accent-foreground transition-colors">
                Desactivadas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logout Section */}
        <Card className="bg-card border-border border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </CardTitle>
            <CardDescription>Termina tu sesión actual de forma segura</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Salir de la aplicación</p>
                <p className="text-sm text-muted-foreground">Serás redirigido a la página principal</p>
              </div>
              <Button 
                onClick={handleLogout}
                variant="destructive" 
                className="hover:bg-destructive/90 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}