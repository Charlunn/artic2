import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { AppProviders } from '@/providers/app-providers';
import { SITE_NAME } from '@/lib/constants';
import { headers } from 'next/headers'; // To get locale for initial render

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'LingoLeap - Your AI-powered English learning companion.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3E5F5" }, // --background light
    { media: "(prefers-color-scheme: dark)", color: "#2C243B" }, // --background dark (approx)
  ],
}

export default async function RootLayout({ // Made this function async
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers(); // Await headers() call
  const acceptLanguage = headersList.get('accept-language');
  let initialLocale: "en" | "zh" = "zh"; // Default to Chinese
  if (acceptLanguage) {
    const preferredLocales = acceptLanguage.split(',').map(lang => lang.split(';')[0].toLowerCase());
    if (preferredLocales.some(lang => lang.startsWith('en'))) {
      initialLocale = 'en';
    }
  }

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <AppProviders locale={initialLocale}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
