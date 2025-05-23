"use client";

import type { ReactNode } from "react";
import type { Session } from "next-auth";
import { SessionProvider } from "./session-provider";
import { I18nProvider } from "@/contexts/i18n-context";
import { ThemeProvider } from "./theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip"; // Added based on sidebar.tsx
import { Toaster } from "@/components/ui/toaster";


interface AppProvidersProps {
  children: ReactNode;
  session?: Session | null;
  locale?: "en" | "zh";
}

export function AppProviders({ children, session, locale }: AppProvidersProps) {
  return (
    <SessionProvider session={session}>
      <I18nProvider initialLocale={locale}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </I18nProvider>
    </SessionProvider>
  );
}
