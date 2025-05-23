"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/hooks/use-i18n";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/types/db";

const settingsFormSchema = z.object({
  language: z.enum(["en", "zh"]),
  theme: z.enum(["light", "dark", "system"]),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
  const { t, setLocale, locale } = useI18n();
  const { setTheme, theme: currentTheme } = useTheme();
  const { data: session, update: updateSession } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      language: session?.user?.settings_language || locale || "zh",
      theme: session?.user?.settings_theme || currentTheme || "system",
    },
  });

 useEffect(() => {
    if (session?.user) {
      form.reset({
        language: session.user.settings_language || locale,
        theme: session.user.settings_theme || currentTheme || "system",
      });
    }
  }, [session, locale, currentTheme, form]);


  async function onSubmit(data: SettingsFormValues) {
    setIsLoading(true);
    try {
      setLocale(data.language);
      setTheme(data.theme);
      
      // API call to save settings to backend
      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings_language: data.language,
          settings_theme: data.theme,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      // Update NextAuth session
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          settings_language: data.language,
          settings_theme: data.theme,
        }
      });

      toast({
        title: t('success'),
        description: t('settingsSaved', 'Your settings have been saved.'),
      });

    } catch (error) {
      console.error("Failed to save settings", error);
      toast({
        title: t('error'),
        description: t('settingsSaveError', 'Could not save settings. Please try again.'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{t('settings')}</h1>
      <Card>
        <CardHeader>
            <CardTitle>{t('preferences', 'Preferences')}</CardTitle>
            <CardDescription>{t('managePreferences', 'Manage your application language and theme.')}</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-md">
                <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t('language')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder={t('selectLanguage', "Select a language")} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormDescription>
                        {t('languageDescription', "Choose your preferred display language.")}
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>{t('theme')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder={t('selectTheme', "Select a theme")} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="light">{t('light')}</SelectItem>
                        <SelectItem value="dark">{t('dark')}</SelectItem>
                        <SelectItem value="system">{t('system')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormDescription>
                        {t('themeDescription', "Choose your preferred application theme.")}
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? t('loading') : t('save')}
                </Button>
            </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
