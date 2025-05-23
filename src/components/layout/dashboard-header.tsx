"use client";

import Link from "next/link";
import { BookHeart, PanelLeft } from "lucide-react";
import { UserNav } from "@/components/layout/user-nav";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";
import { useI18n } from "@/hooks/use-i18n";


export function DashboardHeader() {
  const { toggleSidebar, isMobile } = useSidebar();
   const { t } = useI18n();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="md:hidden"
          aria-label={t("toggleSidebar", "Toggle sidebar")}
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
      )}
      <Link href="/dashboard" className="hidden items-center gap-2 text-lg font-semibold text-primary md:flex">
        <BookHeart className="h-6 w-6" />
        <span>{SITE_NAME}</span>
      </Link>
      
      <div className="flex w-full items-center justify-end gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
