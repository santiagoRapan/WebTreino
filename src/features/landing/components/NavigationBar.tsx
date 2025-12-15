"use client"

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export function NavigationBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const handleLogin = () => {
    router.push("/auth");
  };

  const handleSignIn = () => {
    router.push("/auth?mode=signup");
  };

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 relative">
              <Image 
                src="/images/treinologo.png" 
                alt={t("common.brand")} 
                fill 
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-primary">{t("common.brand")}</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-foreground hover:text-primary transition-colors">{t("nav.features")}</a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">{t("nav.contact")}</a>
          </div>

          <div className="hidden md:flex space-x-4">
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={handleLogin}
            >
              {t("nav.login")}
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={handleSignIn}
            >
              {t("nav.signup")}
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-foreground hover:text-primary transition-colors">{t("nav.features")}</a>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors">{t("nav.contact")}</a>
              <div className="flex flex-col space-y-2 pt-4">
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={handleLogin}
                >
                  {t("nav.login")}
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleSignIn}
                >
                  {t("nav.signup")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}