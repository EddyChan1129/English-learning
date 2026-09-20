import type { Metadata, Viewport } from "next";
import { Manrope, Newsreader } from "next/font/google";
import Script from "next/script";
import { AppProvider } from "@/components/AppProvider";
import { I18nProvider } from "@/components/I18nProvider";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const display = Newsreader({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Fowl to Phoenix",
  title: {
    default: "Fowl to Phoenix | 雞仔變鳳凰",
    template: "%s | Fowl to Phoenix",
  },
  description: "Learn and retain English vocabulary with three-pass spaced repetition, natural US English audio and focused sentence gap-fill tests. 透過間隔重溫掌握英語詞彙。",
  keywords: [
    "English vocabulary learning",
    "spaced repetition",
    "English pronunciation",
    "learn English words",
    "英語詞彙學習",
    "英文生字",
    "間隔重溫",
  ],
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/stage3-3d.png", type: "image/png", sizes: "1254x1254" }],
    apple: "/stage3-3d.png",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Fowl to Phoenix",
    title: "Fowl to Phoenix — 雞仔變鳳凰",
    description: "A focused three-pass English vocabulary learning companion.",
    locale: "en_HK",
    alternateLocale: "zh_HK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fowl to Phoenix — 雞仔變鳳凰",
    description: "Learn and retain English vocabulary with three-pass spaced repetition.",
  },
  category: "education",
  formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#B94732",
  colorScheme: "light dark",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Fowl to Phoenix",
  url: siteUrl,
  description: "Fowl to Phoenix is an English vocabulary learning application using three-pass spaced repetition, US English audio and sentence gap-fill tests.",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Any",
  inLanguage: ["en", "zh-HK"],
  featureList: [
    "Three-pass spaced repetition",
    "US English word and sentence audio",
    "Sentence gap-fill tests",
    "Vocabulary learning progress tracking",
  ],
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable}`}>
        <Script id="restore-theme" strategy="beforeInteractive">
          {`try{document.documentElement.dataset.theme=localStorage.getItem("fowl-to-phoenix.theme.v1")==="dark"?"dark":"light"}catch{document.documentElement.dataset.theme="light"}`}
        </Script>
        <I18nProvider>
          <AppProvider>{children}</AppProvider>
        </I18nProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
