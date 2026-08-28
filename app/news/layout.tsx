import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily News",
  description: "Read the daily news and turn useful words and phrases into vocabulary cards.",
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
