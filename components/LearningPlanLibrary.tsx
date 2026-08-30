"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/components/AppProvider";
import { SpeechButton } from "@/components/SpeechButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { loadLearningPlanEntries } from "@/lib/firestore";
import { ESSENTIAL_PLAN_ID, filterLearningPlanEntries, getFallbackPlan } from "@/lib/learning-plans";
import { isDuplicateVocabularyError, normalizeVocabularyKey } from "@/lib/vocabulary";
import { PARTS_OF_SPEECH, type LearningPlanEntry, type PartOfSpeech } from "@/types";

type Notice = { type: "success" | "error"; message: string } | null;
type SavedFilter = "all" | "saved" | "unsaved";
type DueFilter = "all" | "due";
type EntryOrder = "az" | "za";
type PageSize = 100 | 200 | 500;

export function LearningPlanLibrary({ slug }: { slug: string }) {
  const { createWord, dueWords, learningPlans, learningPlansLoaded, words } = useApp();
  const { t, i18n } = useTranslation();
  const plan = learningPlans.find((item) => item.slug === slug) ?? getFallbackPlan(slug);
  const chinese = i18n.resolvedLanguage?.startsWith("zh");
  const [entries, setEntries] = useState<LearningPlanEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [entryOrder, setEntryOrder] = useState<EntryOrder>("az");
  const [partFilter, setPartFilter] = useState<"all" | PartOfSpeech>("all");
  const [savedFilter, setSavedFilter] = useState<SavedFilter>("all");
  const [dueFilter, setDueFilter] = useState<DueFilter>("all");
  const [pageSize, setPageSize] = useState<PageSize>(100);
  const [page, setPage] = useState(1);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [locallyAdded, setLocallyAdded] = useState<string[]>([]);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    if (!plan) return;
    const planId = plan.id;
    let cancelled = false;
    async function loadEntries() {
      if (planId === ESSENTIAL_PLAN_ID) {
        const [{ ESSENTIAL_PHRASAL_VERBS }, { essentialEntryToLearningPlanEntry }] = await Promise.all([
          import("@/lib/essential-phrasal-verbs"),
          import("@/lib/essential-learning-plan"),
        ]);
        if (!cancelled) setEntries(ESSENTIAL_PHRASAL_VERBS.map(essentialEntryToLearningPlanEntry));
        return;
      }
      try {
        const remoteEntries = await loadLearningPlanEntries(planId);
        if (remoteEntries.length) {
          if (!cancelled) setEntries(remoteEntries);
          return;
        }
      } catch {
        // The bundled first course stays usable until catalogue rules/data are deployed.
      }
    }
    void loadEntries().finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [plan]);

  const savedKeys = useMemo(() => new Set(words.map((word) => normalizeVocabularyKey(word.word))), [words]);
  const dueKeys = useMemo(() => new Set(dueWords.map((word) => normalizeVocabularyKey(word.word))), [dueWords]);
  const locallyAddedIds = useMemo(() => new Set(locallyAdded), [locallyAdded]);
  const filtered = useMemo(() => {
    return filterLearningPlanEntries(entries, {
      query: deferredQuery,
      order: entryOrder,
      part: partFilter,
      saved: savedFilter,
      dueOnly: dueFilter === "due",
      savedKeys,
      dueKeys,
    });
  }, [deferredQuery, dueFilter, dueKeys, entries, entryOrder, partFilter, savedFilter, savedKeys]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleEntries = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const rangeStart = filtered.length ? (currentPage - 1) * pageSize + 1 : 0;
  const rangeEnd = Math.min(currentPage * pageSize, filtered.length);

  function updateFilter(action: () => void) {
    action();
    setPage(1);
  }

  async function addEntry(entry: LearningPlanEntry) {
    if (!plan) return;
    setAddingId(entry.id);
    setNotice(null);
    try {
      await createWord({
        word: entry.term,
        chineseMeaning: entry.chineseMeanings.join("、"),
        chineseMeanings: entry.chineseMeanings,
        synonyms: entry.synonyms,
        sentences: entry.examples.map((example) => example.english),
        sentenceExplanations: entry.examples.map((example) => example.chinese),
        partsOfSpeech: entry.partsOfSpeech,
        commonPhrases: [],
        categories: [],
        sourcePlan: { planId: plan.id, entryId: entry.id },
      });
      setLocallyAdded((current) => [...current, entry.id]);
      setNotice({ type: "success", message: t("mustLearn.addedToast", { phrase: entry.term }) });
    } catch (error) {
      setNotice({
        type: isDuplicateVocabularyError(error) ? "success" : "error",
        message: isDuplicateVocabularyError(error)
          ? t("mustLearn.duplicateToast", { phrase: entry.term })
          : t("mustLearn.saveError"),
      });
    } finally {
      setAddingId(null);
    }
  }

  if (!plan) return <div className="empty-state"><strong>{t(learningPlansLoaded ? "plans.notFound" : "plans.loading")}</strong></div>;

  return (
    <div className="essential-library animate-rise">
      <header className="essential-hero">
        <div>
          <p className="eyebrow">{chinese ? plan.level.zh : plan.level.en}</p>
          <h1 className="page-title">{chinese ? plan.title.zh : plan.title.en}</h1>
          <p>{chinese ? plan.description.zh : plan.description.en}</p>
        </div>
        <Badge className="essential-count">{plan.entryCount}</Badge>
      </header>

      <div className="essential-toolbar">
        <label className="search-field essential-search">
          <span className="sr-only">{t("plans.searchLabel")}</span>
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => updateFilter(() => setQuery(event.target.value))} placeholder={t("mustLearn.searchPlaceholder")} />
        </label>
        <span>{loading ? t("plans.loading") : t("plans.resultCount", { count: filtered.length, total: entries.length })}</span>
      </div>

      <section className="essential-filter-panel" aria-label={t("plans.filtersLabel")}>
        <label>
          <span>{t("plans.sortOrder")}</span>
          <select value={entryOrder} onChange={(event) => updateFilter(() => setEntryOrder(event.target.value as EntryOrder))}>
            <option value="az">{t("history.aToZ")}</option>
            <option value="za">{t("history.zToA")}</option>
          </select>
        </label>
        <label>
          <span>{t("history.partOfSpeechFilter")}</span>
          <select value={partFilter} onChange={(event) => updateFilter(() => setPartFilter(event.target.value as "all" | PartOfSpeech))}>
            <option value="all">{t("history.allParts")}</option>
            {PARTS_OF_SPEECH.map((part) => <option key={part} value={part}>{t(`partsOfSpeech.${part}`)}</option>)}
          </select>
        </label>
        <label>
          <span>{t("plans.savedFilter")}</span>
          <select value={savedFilter} onChange={(event) => updateFilter(() => setSavedFilter(event.target.value as SavedFilter))}>
            <option value="all">{t("plans.allSaved")}</option>
            <option value="saved">{t("plans.savedOnly")}</option>
            <option value="unsaved">{t("plans.unsavedOnly")}</option>
          </select>
        </label>
        <label>
          <span>{t("plans.testFilter")}</span>
          <select value={dueFilter} onChange={(event) => updateFilter(() => setDueFilter(event.target.value as DueFilter))}>
            <option value="all">{t("plans.allTestStates")}</option>
            <option value="due">{t("plans.dueOnly")}</option>
          </select>
        </label>
        <label>
          <span>{t("plans.pageSize")}</span>
          <select value={pageSize} onChange={(event) => updateFilter(() => setPageSize(Number(event.target.value) as PageSize))}>
            {([100, 200, 500] as const).map((size) => <option key={size} value={size}>{t("plans.perPage", { count: size })}</option>)}
          </select>
        </label>
        <button type="button" className="btn-secondary" onClick={() => updateFilter(() => {
          setQuery("");
          setEntryOrder("az");
          setPartFilter("all");
          setSavedFilter("all");
          setDueFilter("all");
          setPageSize(100);
        })}>{t("history.clearFilters")}</button>
      </section>

      {!loading && filtered.length ? <p className="essential-range">{t("plans.resultRange", { start: rangeStart, end: rangeEnd, total: filtered.length })}</p> : null}

      {loading ? <p className="py-20 text-center text-sm text-[var(--muted)]">{t("plans.loading")}</p> : filtered.length ? (
        <div className="essential-list">
          {visibleEntries.map((entry) => {
            const added = locallyAddedIds.has(entry.id) || savedKeys.has(normalizeVocabularyKey(entry.term));
            return (
              <Card key={entry.id} className="essential-card">
                <details>
                  <summary aria-label={`${t("mustLearn.openDetails")}: ${entry.term}`}>
                    <span className="essential-number">{String(entry.order).padStart(3, "0")}</span>
                    <span><strong>{entry.term}</strong><small>{entry.chineseMeanings.join("、")}</small></span>
                    <Badge className={added ? "essential-status added" : "essential-status"}>{added ? t("mustLearn.added") : t(`partsOfSpeech.${entry.partsOfSpeech[0]}`)}</Badge>
                    <span className="essential-chevron" aria-hidden="true">⌄</span>
                  </summary>
                  <div className="essential-details">
                    <dl>
                      <div><dt>{t("mustLearn.englishDefinition")}</dt><dd>{entry.englishDefinition}</dd></div>
                      <div><dt>{t("mustLearn.chineseMeaning")}</dt><dd>{entry.chineseMeanings.join("、")}</dd></div>
                      <div><dt>{t("mustLearn.synonyms")}</dt><dd className="essential-synonyms">{entry.synonyms.map((synonym) => <Badge key={synonym}>{synonym}</Badge>)}</dd></div>
                      <div><dt>{t("mustLearn.examples")}</dt><dd className="learning-examples">{entry.examples.map((example, index) => <div key={`${entry.id}-${index}`}><span><strong>{index + 1}.</strong> {example.english}</span><small>{example.chinese}</small><SpeechButton text={example.english} language="en-US" label={t("mustLearn.listenExample", { number: index + 1 })} /></div>)}</dd></div>
                    </dl>
                    <div className="essential-actions">
                      <SpeechButton text={entry.term} language="en-US" />
                      <Button disabled={added || addingId === entry.id} onClick={() => void addEntry(entry)}>
                        {addingId === entry.id ? t("mustLearn.adding") : added ? t("mustLearn.added") : `＋ ${t("mustLearn.add")}`}
                      </Button>
                    </div>
                  </div>
                </details>
              </Card>
            );
          })}
        </div>
      ) : <div className="empty-state"><strong>{t("plans.empty")}</strong></div>}

      {filtered.length > pageSize ? (
        <nav className="history-pagination" aria-label={t("history.paginationLabel")}>
          <Button variant="outline" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>{t("history.previousPage")}</Button>
          <span>{t("history.pageStatus", { page: currentPage, total: pageCount })}</span>
          <Button variant="outline" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>{t("history.nextPage")}</Button>
        </nav>
      ) : null}

      {notice ? <div className={`essential-toast ${notice.type}`} role="status"><span>{notice.message}</span><Button variant="ghost" size="icon-sm" onClick={() => setNotice(null)} aria-label={t("common.dismiss")}>×</Button></div> : null}
    </div>
  );
}
