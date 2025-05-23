"use client";

import { useI18n } from "@/hooks/use-i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function ReviewPage() {
  const { t } = useI18n();

  const articlesForReview = [
    { id: "1", title: "The Future of AI in Education", nextReview: "Tomorrow", level: 3, image: "https://placehold.co/600x400.png", dataAiHint: "education technology" },
    { id: "2", title: "Climate Change: A Global Challenge", nextReview: "In 3 days", level: 2, image: "https://placehold.co/600x400.png", dataAiHint: "climate change" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{t('review')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('articlesForReview', 'Articles for Review')}</CardTitle>
          <CardDescription>{t('reviewYourLearnedArticles', 'Review articles you have previously learned to reinforce your memory.')}</CardDescription>
        </CardHeader>
        <CardContent>
          {articlesForReview.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articlesForReview.map(article => (
                <Card key={article.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <Image 
                    src={article.image} 
                    alt={article.title} 
                    width={600} 
                    height={400} 
                    className="w-full h-48 object-cover"
                    data-ai-hint={article.dataAiHint} />
                  <CardHeader>
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <CardDescription>
                      {t('nextReview', 'Next review')}: {article.nextReview} | {t('currentLevel', 'Level')}: {article.level}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">{t('startReview', 'Start Review')}</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{t('noArticlesForReview', 'No articles are currently due for review. Keep learning!')}</p>
          )}
          <p className="mt-4 text-sm text-muted-foreground">{t('featureInProgress')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('reviewHistory', 'Review History')}</CardTitle>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground">{t('featureInProgress')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
