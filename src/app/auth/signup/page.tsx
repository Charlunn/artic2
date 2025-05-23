"use client";

import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { useI18n } from "@/hooks/use-i18n";
import { CardTitle, CardDescription, CardHeader } from "@/components/ui/card";


export default function SignupPage() {
  const { t } = useI18n();
  return (
    <>
      <CardHeader className="text-center p-0 mb-6">
          <CardTitle className="text-2xl font-bold tracking-tight">{t('signUp')}</CardTitle>
          <CardDescription>{t('createYourAccount')}</CardDescription>
      </CardHeader>
      <SignupForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('alreadyHaveAccount')}{" "}
        <Link href="/auth/signin" className="font-medium text-primary hover:underline">
          {t('signIn')}
        </Link>
      </p>
    </>
  );
}
