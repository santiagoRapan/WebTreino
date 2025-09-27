"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Client } from "@/src/lib/types/trainer"

interface ClientFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  clientFilter: "all" | "active" | "pending"
  setClientFilter: (filter: "all" | "active" | "pending") => void
  allClients: Client[]
}

export function ClientFilters({
  searchTerm,
  setSearchTerm,
  clientFilter,
  setClientFilter,
  allClients,
}: ClientFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar alumnos por nombre, email o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant={clientFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setClientFilter("all")}
          className="hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Todos ({allClients.length})
        </Button>
        <Button
          variant={clientFilter === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setClientFilter("active")}
          className="hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Activos ({allClients.filter((c) => c.status === "Activo").length})
        </Button>
        <Button
          variant={clientFilter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setClientFilter("pending")}
          className="hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Pendientes ({allClients.filter((c) => c.status === "Pendiente").length})
        </Button>
      </div>
    </div>
  )
}