"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Menu, Moon, Sun } from "lucide-react"
import { useTrainerDashboard } from "@/lib/context/TrainerDashboardContext"
import { useAuth } from "@/features/auth/services/auth-context"
import { useTranslation } from "@/lib/i18n/LanguageProvider"
import { useIsMobile } from "@/hooks/use-mobile"

export function TrainerHeader() {
  const {
    state: { activeTab, theme, sidebarMobileOpen },
    actions: { setTheme, setSidebarMobileOpen },
  } = useTrainerDashboard()
  
  const { customUser } = useAuth()
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  const getTabTitle = (tab: string) => {
    const tabMap: Record<string, string> = {
      dashboard: "navigation.dashboard",
      clients: "navigation.clients",
      routines: "navigation.routines", 
      settings: "navigation.settings",
    }
    return tabMap[tab] ? t(tabMap[tab]) : t("navigation.dashboard")
  }

  const title = getTabTitle(activeTab)

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 w-full flex-shrink-0">
      <div className="flex items-center gap-2 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarMobileOpen(!sidebarMobileOpen)}
          className="md:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-lg md:text-2xl font-bold text-foreground truncate">{title}</h1>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="bg-background border-border"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">
              {customUser?.name || t("navigation.defaultUser")}
            </p>
            <p className="text-xs text-muted-foreground">
              {customUser?.role || t("dashboard.userProfile.role")}
            </p>
          </div>
          <Avatar className="h-8 w-8 md:h-10 md:w-10">
            <AvatarImage src={customUser?.avatar_url || "/images/trainer-profile.png"} />
            <AvatarFallback>
              {customUser?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
