"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { loadPublishedNews } from "@/lib/firestore";
import type { NewsDocument } from "@/types";

export default function NewsArchivePage() {
  const [articles, setArticles] = useState<NewsDocument[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const { i18n, t } = useTranslation();

  useEffect(() => {
    let active = true;
    loadPublishedNews()
      .then((items) => { if (active) setArticles(items); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, []);

  return (
    <div className="news-archive animate-rise">
      <header className="news-archive-hero">
        <p className="eyebrow">{t("news.archiveEyebrow")}</p>
        <h1 className="page-title">{t("news.archiveTitle")}</h1>
        <p>{t("news.archiveDescription")}</p>
      </header>

      {!loaded ? <p className="news-state">{t("news.loadingArchive")}</p> : null}
      {error ? <p className="news-state error" role="alert">{t("news.loadError")}</p> : null}
      {loaded && !error && !articles.length ? <p className="news-state">{t("news.emptyArchive")}</p> : null}

      <ol className="news-archive-list">
        {articles.map((article, index) => (
          <li key={article.id}>
            <Link href={`/news/${article.id}`}>
              <span className="news-archive-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="news-archive-copy">
                <time dateTime={article.date}>{formatNewsDate(article.date, i18n.resolvedLanguage)}</time>
                <strong>{article.articles[0].title}</strong>
                <small>{article.articles[0].summary}</small>
              </span>
              <span className="news-archive-source">{t("news.storyCount", { count: article.articles.length })}</span>
              <span className="news-archive-arrow" aria-hidden="true">↗</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

function formatNewsDate(date: string, language?: string) {
  return new Intl.DateTimeFormat(language?.startsWith("zh") ? "zh-HK" : "en-HK", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
