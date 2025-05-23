"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookHeart, LogIn, UserPlus } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { SITE_NAME } from "@/lib/constants";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function HomePage() {
  const { data: session, status } = useSession();
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary">
            <BookHeart className="h-7 w-7" />
            <span>{SITE_NAME}</span>
        </Link>
        <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <BookHeart className="mb-6 h-20 w-20 text-primary" />
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-primary md:text-5xl lg:text-6xl">
          {t('welcomeTo')}
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-foreground/80 md:text-xl">
          {t('appDescription', 'Your AI-powered companion for mastering English articles. Translate, learn vocabulary, understand phrases, and test your comprehension.')}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          {status === "loading" ? (
             <Button size="lg" disabled>{t('loading')}</Button>
          ) : session ? (
            <Button size="lg" asChild className="shadow-lg hover:shadow-xl transition-shadow">
              <Link href="/dashboard">{t('dashboard')}</Link>
            </Button>
          ) : (
            <>
              <Button size="lg" asChild className="shadow-lg hover:shadow-xl transition-shadow">
                <Link href="/auth/signin">
                  <LogIn className="mr-2 h-5 w-5" /> {t('signIn')}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="shadow-lg hover:shadow-xl transition-shadow">
                <Link href="/auth/signup">
                  <UserPlus className="mr-2 h-5 w-5" /> {t('signUp')}
                </Link>
              </Button>
            </>
          )}
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {SITE_NAME}. {t('allRightsReserved', 'All rights reserved.')}
      </footer>
    </div>
  );
}
