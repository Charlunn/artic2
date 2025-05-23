"use client";

import { useI18n } from "@/hooks/use-i18n";
import { ArticleSubmissionForm } from "@/components/dashboard/article-submission-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ArticlesPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{t('articleLibrary')}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('processNewArticle', 'Process New Article')}</CardTitle>
          <CardDescription>{t('articleProcessingIntro')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ArticleSubmissionForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('myArticles', 'My Articles')}</CardTitle>
          <CardDescription>{t('viewSavedArticles', 'View and manage your saved and processed articles.')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('featureInProgress')}</p>
          {/* Placeholder for displaying list of articles */}
        </CardContent>
      </Card>
    </div>
  );
}
