import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/features/auth"
import { LanguageProvider } from "@/lib/i18n/LanguageProvider"
<<<<<<< HEAD
import { ThemeProvider } from "@/components/common/theme-provider"
=======
import { TrainerAssistant } from "@/features/trainer/components"
>>>>>>> agent2.0

export const metadata: Metadata = {
  title: "Treino",
  description: "Plataforma profesional para personal trainers",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/treinologo.png" type="image/png" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
<<<<<<< HEAD
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </LanguageProvider>
          <Toaster />
        </ThemeProvider>
=======
        <LanguageProvider>
          <AuthProvider>
            {children}
            <TrainerAssistant />
          </AuthProvider>
        </LanguageProvider>
        <Toaster />
>>>>>>> agent2.0
      </body>
    </html>
  )
}
