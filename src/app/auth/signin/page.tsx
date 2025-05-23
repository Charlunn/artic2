"use client";

import Link from "next/link";
import { SigninForm } from "@/components/auth/signin-form";
import { useI18n } from "@/hooks/use-i18n";
import { CardTitle, CardDescription, CardHeader } from "@/components/ui/card";

export default function SigninPage() {
  const { t } = useI18n();

  return (
    <>
      <CardHeader className="text-center p-0 mb-6">
        <CardTitle className="text-2xl font-bold tracking-tight">{t('signIn')}</CardTitle>
        <CardDescription>{t('signInToContinue')}</CardDescription>
      </CardHeader>
      <SigninForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('dontHaveAccount')}{" "}
        <Link href="/auth/signup" className="font-medium text-primary hover:underline">
          {t('signUp')}
        </Link>
      </p>
    </>
  );
}
