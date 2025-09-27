"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface ClientsHeaderProps {
  onNewClient: () => void
}

export function ClientsHeader({ onNewClient }: ClientsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Listado de Alumnos</h2>
        <p className="text-muted-foreground">Visualiza y gestiona todos tus alumnos en una sola vista</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onNewClient} className="hover:bg-accent hover:text-accent-foreground transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Alumno
        </Button>
      </div>
    </div>
  )
}