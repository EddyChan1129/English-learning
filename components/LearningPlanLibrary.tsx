"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/components/AppProvider";
import { SpeechButton } from "@/components/SpeechButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { loadLearningPlanEntries } from "@/lib/firestore";
import { ESSENTIAL_PLAN_ID, getFallbackPlan } from "@/lib/learning-plans";
import { isDuplicateVocabularyError, normalizeVocabularyKey } from "@/lib/vocabulary";
import type { LearningPlanEntry } from "@/types";

type Notice = { type: "success" | "error"; message: string } | null;

export function LearningPlanLibrary({ slug }: { slug: string }) {
  const { createWord, learningPlans, learningPlansLoaded, words } = useApp();
  const { t, i18n } = useTranslation();
  const plan = learningPlans.find((item) => item.slug === slug) ?? getFallbackPlan(slug);
  const chinese = i18n.resolvedLanguage?.startsWith("zh");
  const [entries, setEntries] = useState<LearningPlanEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
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
  const filtered = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    if (!search) return entries;
    return entries.filter((entry) =>
      [entry.term, entry.englishDefinition, ...entry.chineseMeanings, ...entry.synonyms]
        .join(" ").toLocaleLowerCase().includes(search),
    );
  }, [entries, query]);

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
          <span className="sr-only">{t("mustLearn.searchLabel")}</span>
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("mustLearn.searchPlaceholder")} />
        </label>
        <span>{loading ? t("plans.loading") : t("plans.resultCount", { count: filtered.length, total: entries.length })}</span>
      </div>

      {loading ? <p className="py-20 text-center text-sm text-[var(--muted)]">{t("plans.loading")}</p> : filtered.length ? (
        <div className="essential-list">
          {filtered.map((entry) => {
            const added = locallyAdded.includes(entry.id) || savedKeys.has(normalizeVocabularyKey(entry.term));
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
      ) : <div className="empty-state"><strong>{t("mustLearn.empty")}</strong></div>}

      {notice ? <div className={`essential-toast ${notice.type}`} role="status"><span>{notice.message}</span><Button variant="ghost" size="icon-sm" onClick={() => setNotice(null)} aria-label={t("common.dismiss")}>×</Button></div> : null}
    </div>
  );
}
