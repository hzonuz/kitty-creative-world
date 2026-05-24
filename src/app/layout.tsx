import type { Metadata } from "next";
import "./globals.css";
import { dirOf } from "@/lib/i18n";
import { getLocale, getTheme } from "@/lib/preferences";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { SessionProvider } from "@/components/auth/SessionProvider";

export const metadata: Metadata = {
  title: "Kitty Creative World",
  description: "A collaborative worldbuilding workspace.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = getLocale();
  const theme = getTheme();
  const dir = dirOf(locale);

  return (
    <html lang={locale} dir={dir} data-theme={theme}>
      <body className="min-h-screen antialiased">
        <SessionProvider>
          <I18nProvider locale={locale}>{children}</I18nProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
