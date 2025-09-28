"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Client, ClientStatus } from "@/lib/types/trainer"
import { useTranslation } from "@/lib/i18n/LanguageProvider"

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
  const { t } = useTranslation()

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder={t("clients.search.placeholder")}
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
          {t("clients.filters.all")} ({allClients.length})
        </Button>
        <Button
          variant={clientFilter === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setClientFilter("active")}
          className="hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {t("clients.filters.active")} ({allClients.filter((c) => c.status === "active").length})
        </Button>
        <Button
          variant={clientFilter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setClientFilter("pending")}
          className="hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {t("clients.filters.pending")} ({allClients.filter((c) => c.status === "pending").length})
        </Button>
      </div>
    </div>
  )
}