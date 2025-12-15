"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
<<<<<<< HEAD
import { Bell, Moon, Sun } from "lucide-react"
import { useTrainerDashboard } from "@/lib/context/TrainerDashboardContext"
import { useAuth } from "@/services/auth"
import { useTheme } from "next-themes"
=======
import { Menu, Moon, Sun } from "lucide-react"
import { useTrainerDashboard } from "@/lib/context/TrainerDashboardContext"
import { useAuth } from "@/features/auth/services/auth-context"
>>>>>>> agent2.0
import { useTranslation } from "@/lib/i18n/LanguageProvider"
import { useIsMobile } from "@/hooks/use-mobile"

export function TrainerHeader() {
  const {
<<<<<<< HEAD
    state: { activeTab },
  } = useTrainerDashboard()
  
  const { customUser } = useAuth()
  const { theme, setTheme } = useTheme()
=======
    state: { activeTab, theme, sidebarMobileOpen },
    actions: { setTheme, setSidebarMobileOpen },
  } = useTrainerDashboard()
  
  const { customUser } = useAuth()
>>>>>>> agent2.0
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
<<<<<<< HEAD
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 w-full flex-shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
{/*         <Button
=======
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
>>>>>>> agent2.0
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="bg-background border-border"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button> */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">
              {customUser?.name || t("navigation.defaultUser")}
            </p>
            <p className="text-xs text-muted-foreground">
              {customUser?.role || t("dashboard.userProfile.role")}
            </p>
          </div>
<<<<<<< HEAD
          <Avatar>
            {customUser?.avatar_url ? (
              <AvatarImage 
                src={customUser.avatar_url}
                alt={`${customUser?.name || "User"} profile picture`}
              />
            ) : null}
=======
          <Avatar className="h-8 w-8 md:h-10 md:w-10">
            <AvatarImage src={customUser?.avatar_url || "/images/trainer-profile.png"} />
>>>>>>> agent2.0
            <AvatarFallback>
              {customUser?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
