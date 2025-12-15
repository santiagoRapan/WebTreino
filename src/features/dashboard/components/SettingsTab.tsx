"use client"

import React from 'react';
import { useAuth } from "@/features/auth/services/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, User, Shield, Palette, Bell, RefreshCw, Globe } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"
import { useState } from "react"
import { useTranslation } from "@/lib/i18n/LanguageProvider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useEffect } from "react"

export function SettingsTab() {
  const { signOut, authUser, customUser, updateUserProfile } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { t, locale, setLocale } = useTranslation()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")

  useEffect(() => {
    if (customUser) {
      setName(customUser.name || "")
      setAvatarUrl(customUser.avatar_url || "")
    }
  }, [customUser])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const result = await updateUserProfile({
        name,
      })

      if (result.ok) {
        toast({
          title: t("settings.toasts.profileSuccess.title"),
          description: t("settings.toasts.profileSuccess.description"),
        })
      } else {
        toast({
          title: t("settings.toasts.error.title"),
          description: result.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: t("settings.toasts.error.title"),
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAvatar = async () => {
    try {
      const result = await updateUserProfile({
        avatar_url: avatarUrl
      })

      if (result.ok) {
        toast({
          title: t("settings.toasts.avatarSuccess.title"),
          description: t("settings.toasts.avatarSuccess.description"),
        })
      } else {
        toast({
          title: t("settings.toasts.error.title"),
          description: result.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error saving avatar:", error)
      toast({
        title: t("settings.toasts.error.title"),
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }

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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <User className="w-5 h-5" />
                  {t("settings.profile.title")}
                </CardTitle>
                <CardDescription>{t("settings.profile.description")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Column: Form Fields */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t("settings.profile.email")}</label>
                    <p className="text-foreground">{authUser?.email || t("settings.profile.notAvailable")}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">{t("settings.profile.name")}</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("settings.profile.namePlaceholder")}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t("settings.profile.role")}</label>
                    <p className="text-foreground">
                      {isRefreshing ? (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          {t("settings.profile.loading")}
                        </span>
                      ) : (
                        customUser?.role || t("settings.profile.notAvailable")
                      )}
                    </p>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                      {t("settings.profile.save")}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column: Avatar */}
              <div className="flex flex-col items-center gap-3">
                <Avatar className="w-24 h-24 border-2 border-border">
                  <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
                  <AvatarFallback className="text-lg bg-muted">{name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>

                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-sm text-primary hover:text-primary/80 underline underline-offset-4 cursor-pointer font-medium">
                      {t("settings.profile.editPicture")}
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("settings.profile.editAvatarTitle")}</DialogTitle>
                      <DialogDescription>
                        {t("settings.profile.editAvatarDescription")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                          {t("settings.profile.avatarUrl")}
                        </label>
                        <div className="flex gap-2">
                          <Input
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            placeholder="https://example.com/avatar.jpg"
                          />
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <Avatar className="w-20 h-20 border border-border">
                          <AvatarImage src={avatarUrl} />
                          <AvatarFallback>Preview</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSaveAvatar}>
                        {t("settings.profile.save")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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