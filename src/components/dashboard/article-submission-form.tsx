"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useI18n } from "@/hooks/use-i18n";
import { useToast } from "@/hooks/use-toast";
import type { ProcessArticleOutput } from "@/ai/flows/article-processing";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  articleText: z.string().min(50, { message: "Article text must be at least 50 characters." }),
  maxNewWords: z.coerce.number().int().min(1).max(20).default(10),
  maxPhrases: z.coerce.number().int().min(1).max(10).default(5),
  generateReadingComprehensionQuestions: z.boolean().default(true),
});

type ArticleFormValues = z.infer<typeof formSchema>;

interface ProcessedArticleDisplayProps {
  data: ProcessArticleOutput;
}

function ProcessedArticleDisplay({ data }: ProcessedArticleDisplayProps) {
  const { t } = useI18n();
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{t('processedArticleOutput')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{t('translation')}</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.translation}</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg">{t('newWords')}</h3>
          <ul className="list-disc pl-5 space-y-1">
            {data.newWords.map((item, index) => (
              <li key={index} className="text-sm">
                <strong>{item.word}:</strong> {item.translation}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-lg">{t('phrases')}</h3>
          <ul className="list-disc pl-5 space-y-1">
            {data.phrases.map((item, index) => (
              <li key={index} className="text-sm">
                <strong>{item.phrase}:</strong> {item.translation}
                {item.example && <em className="block text-xs text-muted-foreground">"{item.example}"</em>}
              </li>
            ))}
          </ul>
        </div>
        {data.readingComprehensionQuestions.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg">{t('readingComprehensionQuestions')}</h3>
            <ul className="space-y-2">
              {data.readingComprehensionQuestions.map((item, index) => (
                <li key={index} className="text-sm p-2 border rounded">
                  <p><strong>Q:</strong> {item.question}</p>
                  <p className="text-green-600"><strong>A:</strong> {item.answer}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


export function ArticleSubmissionForm() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessArticleOutput | null>(null);

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      articleText: "",
      maxNewWords: 10,
      maxPhrases: 5,
      generateReadingComprehensionQuestions: true,
    },
  });

  async function onSubmit(values: ArticleFormValues) {
    setIsLoading(true);
    setProcessedData(null);
    try {
      const response = await fetch('/api/articles/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to process article.");
      }
      
      setProcessedData(result as ProcessArticleOutput);
      toast({
        title: t('success'),
        description: t('articleProcessedSuccess', "Article processed successfully!"),
      });

    } catch (error: any) {
      console.error("Failed to process article", error);
      toast({
        title: t('error'),
        description: error.message || t('articleProcessedError', "Could not process article. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="articleText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('pasteArticleText')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('articlePlaceholder', "Enter your English article here...")}
                    className="min-h-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t('articleDescExample', "Paste the full text of the English article you want to study.")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="maxNewWords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('maxNewWords')}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxPhrases"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('maxPhrases')}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="generateReadingComprehensionQuestions"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow h-full justify-center">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t('generateQuestions')}</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? t('processing', 'Processing...') : t('processArticle')}
          </Button>
        </form>
      </Form>

      {processedData && <ProcessedArticleDisplay data={processedData} />}
    </div>
  );
}
