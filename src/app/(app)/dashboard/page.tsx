"use client";

import { useSession } from "next-auth/react";
import { useI18n } from "@/hooks/use-i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        {t('dashboard')}
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('welcomeTo', `Welcome to ${t('appName')}`)}, {session?.user?.name || "User"}!</CardTitle>
          <CardDescription>
            {t('dashboardOverview', 'Here is an overview of your learning journey. Start by exploring articles or setting up your learning plan.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>{t('articleLibrary')}</CardTitle>
              <CardDescription>{t('exploreArticlesDesc', 'Discover new articles or process your own for learning.')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard/articles">{t('goToArticles', 'Go to Articles')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>{t('learningPlan')}</CardTitle>
              <CardDescription>{t('setupPlanDesc', 'Personalize your study schedule and goals.')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard/plan">{t('setupPlan', 'Set up Plan')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
       {/* Placeholder for other dashboard widgets */}
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>{t('review')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('featureInProgress')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('statistics')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('featureInProgress')}</p>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
