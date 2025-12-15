"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, Activity, MoreVertical, Edit, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useInfiniteScroll } from "../hooks/useInfiniteScroll"
import type { Exercise } from "@/features/exercises/types"

interface ExerciseSearchHook {
  searchTerm: string
  setSearchTerm: (term: string) => void
  category?: string
  setCategory: (category: string | undefined) => void
  equipment?: string
  setEquipment: (equipment: string | undefined) => void
  exercises: Exercise[]
  loading: boolean
  hasMore: boolean
  loadMore: () => void
  uniqueCategories: string[]
  uniqueEquipments: string[]
}

interface ExerciseCatalogProps {
  showCatalog: boolean
  onToggleCatalog: () => void
  onCreateExercise: () => void
  exerciseSearch: ExerciseSearchHook
  translations: {
    catalogTitle: string
    catalogDescription: string
    newExercise: string
    hideCatalog: string
    showCatalog: string
    searchPlaceholder: string
    allCategories: string
    category: string
    allEquipments: string
    equipment: string
    edit: string
    delete: string
    editFeatureSoon: string
    deleteFeatureSoon: string
    loadingMore: string
    noResults: string
    scrollForMore: string
  }
}

export function ExerciseCatalog({
  showCatalog,
  onToggleCatalog,
  onCreateExercise,
  exerciseSearch,
  translations,
}: ExerciseCatalogProps) {
  const { containerRef, handleScroll } = useInfiniteScroll({
    hasMore: exerciseSearch.hasMore,
    loading: exerciseSearch.loading,
    onLoadMore: exerciseSearch.loadMore,
  })

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-card-foreground">{translations.catalogTitle}</CardTitle>
            <CardDescription>{translations.catalogDescription}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={onCreateExercise}
              className="hover:bg-orange-500 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              {translations.newExercise}
            </Button>
            <Button variant="outline" onClick={onToggleCatalog}>
              {showCatalog ? translations.hideCatalog : translations.showCatalog}
            </Button>
          </div>
        </div>
      </CardHeader>

      {showCatalog && (
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={translations.searchPlaceholder}
                value={exerciseSearch.searchTerm}
                onChange={(e) => exerciseSearch.setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <Select
                value={exerciseSearch.category ?? "all"}
                onValueChange={(v) => exerciseSearch.setCategory(v === "all" ? undefined : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={translations.category} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{translations.allCategories}</SelectItem>
                  {exerciseSearch.uniqueCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1">
              <Select
                value={exerciseSearch.equipment ?? "all"}
                onValueChange={(v) => exerciseSearch.setEquipment(v === "all" ? undefined : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={translations.equipment} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{translations.allEquipments}</SelectItem>
                  {exerciseSearch.uniqueEquipments.map((eq) => (
                    <SelectItem key={eq} value={eq}>
                      {eq}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Exercise List with Infinite Scroll */}
          <div
            ref={containerRef}
            className="space-y-2 max-h-[500px] overflow-y-auto"
            onScroll={handleScroll}
          >
            {exerciseSearch.exercises.map((ex) => (
              <div
                key={ex.id}
                className="p-3 rounded bg-muted/50 flex items-center justify-between hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                    {ex.gif_URL ? (
                      <img
                        src={ex.gif_URL}
                        alt={ex.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <Activity className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-card-foreground">{ex.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ex.target_muscles.slice(0, 2).join(", ")} •{" "}
                      {ex.equipments.slice(0, 2).join(", ")}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => toast({ title: translations.editFeatureSoon })}>
                      <Edit className="w-4 h-4 mr-2" />
                      {translations.edit}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => toast({ title: translations.deleteFeatureSoon })}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {translations.delete}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

            {/* Loading indicator */}
            {exerciseSearch.loading && (
              <div className="text-center py-4 text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                  {translations.loadingMore}
                </div>
              </div>
            )}

            {/* No results */}
            {!exerciseSearch.loading && exerciseSearch.exercises.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{translations.noResults}</p>
              </div>
            )}

            {/* Load more hint */}
            {!exerciseSearch.loading &&
              exerciseSearch.hasMore &&
              exerciseSearch.exercises.length > 0 && (
                <div className="text-center py-2 text-xs text-muted-foreground">
                  {translations.scrollForMore}
                </div>
              )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

