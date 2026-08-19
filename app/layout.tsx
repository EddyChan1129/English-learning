import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import { AppProvider } from "@/components/AppProvider";
import "./globals.css";

const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const display = Newsreader({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Wordwise — Vocabulary that sticks",
  description: "A focused three-pass vocabulary learning companion.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable}`}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
