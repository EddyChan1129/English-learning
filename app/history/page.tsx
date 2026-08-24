"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/components/AppProvider";
import { StageBadge } from "@/components/StageBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatStoredDateTime } from "@/lib/date";
import { compareHistoryWords, DEFAULT_HISTORY_WORD_ORDER, type HistoryWordOrder } from "@/lib/history";
import { PART_OF_SPEECH_ABBREVIATIONS, PARTS_OF_SPEECH, type PartOfSpeech, type WordDocument } from "@/types";

type StatusFilter = "all" | "learning" | "mastered" | "inactive";
type StageFilter = "all" | "0" | "1" | "2" | "3";
const PAGE_SIZE = 12;

export default function HistoryPage() {
  const { words, wordsLoaded, vocabularyCategories } = useApp();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [partFilter, setPartFilter] = useState<"all" | PartOfSpeech>("all");
  const [stageFilter, setStageFilter] = useState<StageFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [wordOrder, setWordOrder] = useState<HistoryWordOrder>(DEFAULT_HISTORY_WORD_ORDER);
  const [page, setPage] = useState(1);
  const { t } = useTranslation();

  const filteredWords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = words.filter((word) => {
      const matchesStatus = statusFilter === "all" || word.status === statusFilter;
      const matchesPart = partFilter === "all" || word.partsOfSpeech.includes(partFilter);
      const matchesStage = stageFilter === "all" || String(word.stage) === stageFilter;
      const matchesCategory = categoryFilter === "all" || word.categories?.includes(categoryFilter);
      const matchesQuery = !normalizedQuery || `${word.word} ${word.chineseMeanings.join(" ")}`.toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesPart && matchesStage && matchesCategory && matchesQuery;
    });
    return filtered.sort((a, b) => compareHistoryWords(a, b, wordOrder));
  }, [categoryFilter, partFilter, query, stageFilter, statusFilter, wordOrder, words]);

  const pageCount = Math.max(1, Math.ceil(filteredWords.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleWords = filteredWords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const activeFilterCount = Number(partFilter !== "all") + Number(stageFilter !== "all") + Number(categoryFilter !== "all");

  function updateFilter(action: () => void) {
    action();
    setPage(1);
  }

  return (
    <div className="animate-rise">
      <header className="border-b border-[var(--line)] pb-5">
        <p className="eyebrow">{t("history.eyebrow")}</p>
        <h1 className="page-title">{t("history.title")}</h1>
        <p className="mt-2 text-[var(--muted)]">{t("history.description")}</p>
      </header>

      <div className="history-search-row">
        <div className="filter-tabs" aria-label={t("history.filterLabel")}>
          {(["all", "learning", "mastered", "inactive"] as const).map((value) => (
            <button key={value} className={statusFilter === value ? "active" : ""} onClick={() => updateFilter(() => setStatusFilter(value))}>{t(`history.${value}`)}</button>
          ))}
        </div>
        <label className="search-field">
          <span className="sr-only">{t("history.searchLabel")}</span>
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => updateFilter(() => setQuery(event.target.value))} placeholder={t("history.searchPlaceholder")} />
        </label>
      </div>

      <CategoryToolbar categories={vocabularyCategories} selected={categoryFilter} onSelected={(category) => updateFilter(() => setCategoryFilter(category))} />

      <details className="history-filter-panel">
        <summary>
          <span>{t("history.filtersAndSort")}</span>
          <small>{activeFilterCount ? t("history.activeFilters", { count: activeFilterCount }) : t("history.chooseFilters")}</small>
        </summary>
        <div className="history-filter-controls">
          <label>
            <span>{t("history.partOfSpeechFilter")}</span>
            <select value={partFilter} onChange={(event) => updateFilter(() => setPartFilter(event.target.value as "all" | PartOfSpeech))}>
              <option value="all">{t("history.allParts")}</option>
              {PARTS_OF_SPEECH.map((part) => <option key={part} value={part}>{t(`partsOfSpeech.${part}`)}</option>)}
            </select>
          </label>
          <label>
            <span>{t("history.stageFilter")}</span>
            <select value={stageFilter} onChange={(event) => updateFilter(() => setStageFilter(event.target.value as StageFilter))}>
              <option value="all">{t("history.allStages")}</option>
              {([0, 1, 2, 3] as const).map((stage) => <option key={stage} value={stage}>{t("common.stageName", { stage, label: t(`stages.${stage}.label`) })}</option>)}
            </select>
          </label>
          <label>
            <span>{t("history.wordOrder")}</span>
            <select value={wordOrder} onChange={(event) => updateFilter(() => setWordOrder(event.target.value as HistoryWordOrder))}>
              <option value="az">{t("history.aToZ")}</option>
              <option value="za">{t("history.zToA")}</option>
              <option value="part">{t("history.byWordType")}</option>
              <option value="newest">{t("history.newestAdded")}</option>
              <option value="oldest">{t("history.oldestAdded")}</option>
              <option value="testSoonest">{t("history.testSoonest")}</option>
              <option value="testLatest">{t("history.testLatest")}</option>
            </select>
          </label>
          <button type="button" className="btn-secondary" onClick={() => updateFilter(() => {
            setPartFilter("all");
            setStageFilter("all");
            setCategoryFilter("all");
            setWordOrder(DEFAULT_HISTORY_WORD_ORDER);
          })}>{t("history.clearFilters")}</button>
        </div>
      </details>

      {!wordsLoaded ? <p className="py-24 text-center text-sm text-[var(--muted)]">{t("history.loading")}</p> : null}
      {wordsLoaded && filteredWords.length === 0 ? <EmptyHistory hasWords={words.length > 0} /> : null}
      {visibleWords.length ? <div className="word-grid">{visibleWords.map((word) => <WordCard key={word.id} word={word} />)}</div> : null}
      {filteredWords.length > PAGE_SIZE ? (
        <nav className="history-pagination" aria-label={t("history.paginationLabel")}>
          <Button variant="outline" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>{t("history.previousPage")}</Button>
          <span>{t("history.pageStatus", { page: currentPage, total: pageCount })}</span>
          <Button variant="outline" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>{t("history.nextPage")}</Button>
        </nav>
      ) : null}
    </div>
  );
}

function CategoryToolbar({ categories, selected, onSelected }: { categories: string[]; selected: string; onSelected: (category: string) => void }) {
  const { t } = useTranslation();
  if (!categories.length) return null;
  return (
    <section className="category-toolbar" aria-label={t("categories.label")}>
      <div className="category-filter-list">
        <button type="button" className={selected === "all" ? "active" : ""} onClick={() => onSelected("all")}>{t("categories.all")}</button>
        {categories.map((category) => <button type="button" key={category} className={selected === category ? "active" : ""} onClick={() => onSelected(category)}>{category}</button>)}
      </div>
    </section>
  );
}

function WordCard({ word }: { word: WordDocument }) {
  const { i18n, t } = useTranslation();
  return (
    <Link href={`/history/${word.id}`} className={`word-card ${word.status === "inactive" ? "inactive" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display truncate text-3xl font-semibold">{word.word}</h2>
          <p className="mt-1 truncate text-sm text-[var(--muted)]">{word.chineseMeanings.join("；")}</p>
          <div className="word-card-tags">
            {word.partsOfSpeech.map((part) => <Badge key={part} className="word-type-badge" title={t(`partsOfSpeech.${part}`)}>{PART_OF_SPEECH_ABBREVIATIONS[part]}</Badge>)}
            {word.categories?.map((category) => <Badge key={category} className="word-category-badge">{category}</Badge>)}
          </div>
        </div>
        <span className="word-card-arrow" aria-hidden="true">↗</span>
      </div>
      <div className="word-card-meta">
        <StageBadge stage={word.stage} status={word.status} />
        <span className="word-card-next">{word.status === "mastered" ? t("history.reviewComplete") : word.status === "inactive" ? t("history.paused") : t("history.next", { date: formatStoredDateTime(word.nextTestDate, i18n.resolvedLanguage) })}</span>
      </div>
    </Link>
  );
}

function EmptyHistory({ hasWords }: { hasWords: boolean }) {
  const { t } = useTranslation();
  return <div className="empty-state"><strong>{hasWords ? t("history.noMatch") : t("history.empty")}</strong><p>{hasWords ? t("history.changeSearch") : t("history.addFirst")}</p></div>;
}
