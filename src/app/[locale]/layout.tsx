import { NextIntlClientProvider } from "next-intl";
import Layout from "@/components/Layout";
import { Provider } from "@/components/ui/provider";
import { notFound } from "next/navigation";
import "../globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return {
    title: locale === "fr" ? "Vidéo Club" : "Video Club",
    description:
      locale === "fr" ? "Bienvenue au Vidéo Club" : "Welcome to the Video Club",
  };
}

export function generateStaticParams() {
  return [{ locale: "fr" }, { locale: "en" }];
}

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  let messages;
  const { locale } = await params;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch {
    notFound();
  }
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <Provider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <Layout>{children}</Layout>
          </NextIntlClientProvider>
        </Provider>
      </body>
    </html>
  );
}
