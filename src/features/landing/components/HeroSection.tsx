"use client"

import React from 'react'
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageProvider';

export function HeroSection() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleSignIn = () => {
    router.push("/auth?mode=signup");
  };

  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center space-y-8">

          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            {t("landing.hero.title.part1")}
            <span className="text-primary"> {t("landing.hero.title.highlight")}</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t("landing.hero.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-4"
              onClick={handleSignIn}
            >
              {t("landing.hero.cta")}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
}
