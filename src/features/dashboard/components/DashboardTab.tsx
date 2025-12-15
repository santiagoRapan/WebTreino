"use client"

import { useTrainerDashboard } from "@/lib/context/TrainerDashboardContext"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslation } from "@/lib/i18n/LanguageProvider"
import { StudentWorkoutsFeed } from "./StudentWorkoutsFeed"

export function DashboardTab() {
  const {
    data: { stats },
  } = useTrainerDashboard()
  
  const { t } = useTranslation()

  return (
    <main className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between mb-4 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('dashboard.title')}</h1>
          <p className="text-sm md:text-base text-muted-foreground">{t('dashboard.welcome')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-card border-border">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">{stat.titleKey}</p>
                  <p className="text-xl md:text-2xl font-bold text-card-foreground">{stat.value}</p>
                  <p className="text-xs md:text-sm text-primary">{stat.change}</p>
                </div>
                <stat.icon className={`w-6 h-6 md:w-8 md:h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="max-w-5xl mx-auto w-full">
        <StudentWorkoutsFeed />
      </div>
    </main>
  )
}

