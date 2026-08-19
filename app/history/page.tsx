"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useApp } from "@/components/AppProvider";
import { StageBadge } from "@/components/StageBadge";
import type { WordDocument } from "@/types";

type Filter = "all" | "learning" | "mastered" | "inactive";

export default function HistoryPage() {
  const { words, wordsLoaded } = useApp();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const { t } = useTranslation();

  const visibleWords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return words.filter((word) => {
      const matchesFilter = filter === "all" || word.status === filter;
      const matchesQuery = !normalizedQuery || `${word.word} ${word.chineseMeaning}`.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query, words]);

  return (
    <div className="animate-rise">
      <header className="border-b border-[var(--line)] pb-5">
        <p className="eyebrow">{t("history.eyebrow")}</p>
        <h1 className="page-title">{t("history.title")}</h1>
        <p className="mt-2 text-[var(--muted)]">{t("history.description")}</p>
      </header>

      <div className="my-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="filter-tabs" aria-label={t("history.filterLabel")}>
          {(["all", "learning", "mastered", "inactive"] as const).map((value) => (
            <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{t(`history.${value}`)}</button>
          ))}
        </div>
        <label className="search-field">
          <span className="sr-only">{t("history.searchLabel")}</span>
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("history.searchPlaceholder")} />
        </label>
      </div>

      {!wordsLoaded ? <p className="py-24 text-center text-sm text-[var(--muted)]">{t("history.loading")}</p> : null}
      {wordsLoaded && visibleWords.length === 0 ? <EmptyHistory hasWords={words.length > 0} /> : null}
      {visibleWords.length > 0 ? <div className="word-grid">{visibleWords.map((word) => <WordCard key={word.id} word={word} />)}</div> : null}
    </div>
  );
}

function WordCard({ word }: { word: WordDocument }) {
  const { t } = useTranslation();
  return (
    <Link href={`/history/${word.id}`} className={`word-card ${word.status === "inactive" ? "inactive" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display truncate text-3xl font-semibold">{word.word}</h2>
          <p className="mt-1 truncate text-sm text-[var(--muted)]">{word.chineseMeaning}</p>
        </div>
        <span className="word-card-arrow" aria-hidden="true">↗</span>
      </div>
      <div className="mt-7 flex items-center justify-between gap-3">
        <StageBadge stage={word.stage} status={word.status} />
        <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--muted)]">
          {word.status === "mastered" ? t("history.reviewComplete") : word.status === "inactive" ? t("history.paused") : t("history.next", { date: word.nextTestDate })}
        </span>
      </div>
    </Link>
  );
}

function EmptyHistory({ hasWords }: { hasWords: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="empty-state">
      <strong>{hasWords ? t("history.noMatch") : t("history.empty")}</strong>
      <p>{hasWords ? t("history.changeSearch") : t("history.addFirst")}</p>
    </div>
  );
}
