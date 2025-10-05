"use client"

import { useAuth } from "@/services/auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, User, Shield, Palette, Bell, Globe } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"
import { useTranslation } from "@/lib/i18n/LanguageProvider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function SettingsTab() {
  const { signOut, authUser, customUser } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { t, locale, setLocale } = useTranslation()

  const handleLogout = async () => {
    try {
      await signOut()
      toast({
        title: t("settings.toasts.logout.title"),
        description: t("settings.toasts.logout.description"),
      })
      // Redirect to home/landing page
      router.push("/")
    } catch (error) {
      console.error("Error during logout:", error)
      toast({
        title: t("settings.toasts.error.title"),
        description: t("settings.toasts.logoutError"),
        variant: "destructive"
      })
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <main className="p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t("settings.title")}</h2>
          <p className="text-muted-foreground">{t("settings.subtitle")}</p>
        </div>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Profile Information */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <User className="w-5 h-5" />
              {t("settings.profile.title")}
            </CardTitle>
            <CardDescription>{t("settings.profile.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t("settings.profile.email")}</label>
                <p className="text-foreground">{authUser?.email || t("settings.profile.notAvailable")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t("settings.profile.name")}</label>
                <p className="text-foreground">
                  {customUser?.name || t("settings.profile.notAvailable")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t("settings.profile.role")}</label>
                <p className="text-foreground">
                  {customUser?.role || t("settings.profile.notAvailable")}
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
              {t("settings.preferences.title")}
            </CardTitle>
            <CardDescription>{t("settings.preferences.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{t("settings.preferences.theme.title")}</p>
                <p className="text-sm text-muted-foreground">{t("settings.preferences.theme.description")}</p>
              </div>
              <Button
                variant="outline"
                className="hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={toggleTheme}
              >
                {t("settings.preferences.theme.change")}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{t("settings.preferences.language.title")}</p>
                <p className="text-sm text-muted-foreground">{t("settings.preferences.language.description")}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {t(`language.${locale}`)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLocale("es")} className={locale === "es" ? "bg-accent" : ""}>
                    {t("language.es")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocale("en")} className={locale === "en" ? "bg-accent" : ""}>
                    {t("language.en")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocale("pt")} className={locale === "pt" ? "bg-accent" : ""}>
                    {t("language.pt")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Bell className="w-5 h-5" />
              {t("settings.notifications.title")}
            </CardTitle>
            <CardDescription>{t("settings.notifications.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{t("settings.notifications.email.title")}</p>
                <p className="text-sm text-muted-foreground">{t("settings.notifications.email.description")}</p>
              </div>
              <Button variant="outline" className="hover:bg-accent hover:text-accent-foreground transition-colors">
                {t("settings.notifications.email.enabled")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logout Section */}
        <Card className="bg-card border-border border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <LogOut className="w-5 h-5" />
              {t("settings.logout.title")}
            </CardTitle>
            <CardDescription>{t("settings.logout.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{t("settings.logout.action.title")}</p>
                <p className="text-sm text-muted-foreground">{t("settings.logout.action.description")}</p>
              </div>
              <Button 
                onClick={handleLogout}
                variant="destructive" 
                className="hover:bg-destructive/90 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t("settings.logout.button")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}