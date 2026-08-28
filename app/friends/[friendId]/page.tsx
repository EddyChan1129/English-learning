"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useApp } from "@/components/AppProvider";
import { StageBadge } from "@/components/StageBadge";
import { Button } from "@/components/ui/button";
import { subscribeToFriendWords } from "@/lib/firestore";
import { compareHistoryWords, DEFAULT_HISTORY_WORD_ORDER, type HistoryWordOrder } from "@/lib/history";
import { normalizeVocabularyKey } from "@/lib/vocabulary";
import type { WordDocument } from "@/types";

const PAGE_SIZES = [12, 24, 48] as const;

export default function FriendWordsPage() {
  const { friendId } = useParams<{ friendId: string }>();
  const { friends, friendsLoaded, words: ownWords, copyFromFriend } = useApp();
  const [words, setWords] = useState<WordDocument[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [copiedWord, setCopiedWord] = useState("");
  const [wordOrder, setWordOrder] = useState<HistoryWordOrder>(DEFAULT_HISTORY_WORD_ORDER);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(12);
  const [page, setPage] = useState(1);
  const { t } = useTranslation();
  const friend = friends.find((item) => item.uid === friendId);
  const sortedWords = useMemo(
    () => words.toSorted((a, b) => compareHistoryWords(a, b, wordOrder)),
    [wordOrder, words],
  );
  const ownWordKeys = useMemo(
    () => new Set(ownWords.map((word) => normalizeVocabularyKey(word.word))),
    [ownWords],
  );
  const pageCount = Math.max(1, Math.ceil(sortedWords.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleWords = sortedWords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (!friend) return;
    return subscribeToFriendWords(friend.uid, (nextWords) => {
      setWords(nextWords.filter((word) => word.status !== "inactive"));
      setLoaded(true);
    }, () => {
      setError(t("friends.wordsError"));
      setLoaded(true);
    });
  }, [friend, t]);

  async function copy(word: WordDocument) {
    setError("");
    setCopiedWord("");
    try {
      await copyFromFriend(friendId, word);
      setCopiedWord(word.id);
    } catch {
      setError(t("friends.copyWordError"));
    }
  }

  if (!friendsLoaded) return <p className="py-24 text-center text-sm text-[var(--muted)]">{t("friends.loadingFriends")}</p>;
  if (!friend) return <FriendNotFound />;

  return (
    <div className="animate-rise">
      <Link href="/friends" className="back-link">{t("friends.back")}</Link>
      <header className="friend-library-heading">
        <div><p className="eyebrow">{t("friends.libraryEyebrow")}</p><h1 className="page-title">{friend.displayName}</h1></div>
        <p>{t("friends.libraryDescription")}</p>
      </header>
      {error ? <p className="feedback error mt-5" role="alert">{error}</p> : null}
      {!loaded ? <p className="py-24 text-center text-sm text-[var(--muted)]">{t("friends.loadingWords")}</p> : null}
      {loaded && words.length === 0 ? <div className="empty-state mt-6"><strong>{t("friends.noSharedWords")}</strong><p>{t("friends.noSharedWordsHint")}</p></div> : null}
      {words.length ? <div className="friend-library-toolbar">
        <label>
          <span>{t("friends.sortWords")}</span>
          <select value={wordOrder} onChange={(event) => {
            setWordOrder(event.target.value as HistoryWordOrder);
            setPage(1);
          }}>
            <option value="az">{t("history.aToZ")}</option>
            <option value="za">{t("history.zToA")}</option>
            <option value="part">{t("history.byWordType")}</option>
            <option value="newest">{t("history.newestAdded")}</option>
            <option value="oldest">{t("history.oldestAdded")}</option>
            <option value="testSoonest">{t("history.testSoonest")}</option>
            <option value="testLatest">{t("history.testLatest")}</option>
          </select>
        </label>
        <label>
          <span>{t("friends.wordsPerPage")}</span>
          <select value={pageSize} onChange={(event) => {
            setPageSize(Number(event.target.value) as (typeof PAGE_SIZES)[number]);
            setPage(1);
          }}>
            {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
        <span>{t("friends.sharedWordCount", { count: words.length })}</span>
      </div> : null}
      {visibleWords.length ? <div className="shared-word-grid">{visibleWords.map((word) => {
        const alreadyAdded = ownWordKeys.has(normalizeVocabularyKey(word.word));
        return (
          <article key={word.id} className="shared-word-card">
            <div className="flex items-start justify-between gap-3"><div><h2>{word.word}</h2><p>{word.chineseMeanings.join("；")}</p></div><StageBadge stage={word.stage} status={word.status} /></div>
            {word.partsOfSpeech.length ? <div className="mt-3 flex flex-wrap gap-1.5">{word.partsOfSpeech.map((part) => <span key={part} className="part-chip">{t(`partsOfSpeech.${part}`)}</span>)}</div> : null}
            {word.synonyms.length ? <p className="shared-synonyms">{word.synonyms.join(" · ")}</p> : null}
            {word.commonPhrases[0] ? <p className="shared-pattern">{word.commonPhrases[0]}</p> : null}
            <blockquote>{word.sentences[0]}</blockquote>
            <button className="btn-secondary" disabled={alreadyAdded || copiedWord === word.id} onClick={() => copy(word)}>
              {alreadyAdded || copiedWord === word.id ? t("friends.alreadyAdded") : t("friends.copyWord")}
            </button>
          </article>
        );
      })}</div> : null}
      {words.length > pageSize ? (
        <nav className="history-pagination" aria-label={t("history.paginationLabel")}>
          <Button variant="outline" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>{t("history.previousPage")}</Button>
          <span>{t("history.pageStatus", { page: currentPage, total: pageCount })}</span>
          <Button variant="outline" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>{t("history.nextPage")}</Button>
        </nav>
      ) : null}
    </div>
  );
}

function FriendNotFound() {
  const { t } = useTranslation();
  return <div className="empty-state mx-auto mt-16 max-w-lg"><strong>{t("friends.friendMissing")}</strong><p>{t("friends.friendMissingHint")}</p><Link href="/friends" className="btn-primary mt-5 inline-block">{t("friends.back")}</Link></div>;
}
