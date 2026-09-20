"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { NewsReader } from "@/components/NewsReader";
import { loadPublishedNewsDay } from "@/lib/firestore";
import type { NewsDocument } from "@/types";

export default function NewsDayPage() {
  const { dayId } = useParams<{ dayId: string }>();
  const [article, setArticle] = useState<NewsDocument | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const { t } = useTranslation();
  const validDayId = /^days-20\d{2}-\d{2}-\d{2}(?:-\d{2})?$/.test(dayId);

  useEffect(() => {
    if (!validDayId) return;
    let active = true;
    loadPublishedNewsDay(dayId)
      .then((item) => { if (active) setArticle(item); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, [dayId, validDayId]);

  if (!validDayId) return <NewsMessage message={t("news.notFound")} />;
  if (!loaded) return <p className="news-state">{t("news.loadingArticle")}</p>;
  if (error) return <NewsMessage message={t("news.loadError")} />;
  if (!article) return <NewsMessage message={t("news.notFound")} />;
  return <NewsReader article={article} />;
}

function NewsMessage({ message }: { message: string }) {
  const { t } = useTranslation();
  return (
    <section className="news-message">
      <p>{message}</p>
      <Link href="/news">{t("news.backToArchive")}</Link>
    </section>
  );
}
