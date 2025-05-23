"use client";

import { useI18n } from "@/hooks/use-i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BookOpen, Clock, Zap } from "lucide-react";

export default function StatsPage() {
  const { t } = useI18n();

  // Mock data, replace with actual data fetching
  const stats = {
    totalStudyDays: 15,
    totalLearningTime: 72000, // seconds
    totalReviewTime: 18000, // seconds
    articlesLearned: 25,
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{t('statistics')}</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalStudyDays', 'Total Study Days')}</CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudyDays}</div>
            <p className="text-xs text-muted-foreground">{t('daysActive', 'days you were active')}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalLearningTime', 'Total Learning Time')}</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.totalLearningTime)}</div>
            <p className="text-xs text-muted-foreground">{t('focusedLearning', 'spent in focused learning')}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalReviewTime', 'Total Review Time')}</CardTitle>
            <Zap className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.totalReviewTime)}</div>
            <p className="text-xs text-muted-foreground">{t('reinforcingKnowledge', 'spent reinforcing knowledge')}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('articlesLearned', 'Articles Learned')}</CardTitle>
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.articlesLearned}</div>
            <p className="text-xs text-muted-foreground">{t('completedArticles', 'articles completed')}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('detailedProgress', 'Detailed Progress Chart')}</CardTitle>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground">{t('featureInProgress')}</p>
           {/* Placeholder for charts */}
           <div className="h-64 w-full bg-muted rounded-md flex items-center justify-center text-muted-foreground">
             {t('chartPlaceholder', 'Chart will be displayed here')}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
