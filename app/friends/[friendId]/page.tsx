"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useApp } from "@/components/AppProvider";
import { StageBadge } from "@/components/StageBadge";
import { subscribeToFriendWords } from "@/lib/firestore";
import type { WordDocument } from "@/types";

export default function FriendWordsPage() {
  const { friendId } = useParams<{ friendId: string }>();
  const { friends, friendsLoaded, words: ownWords, copyFromFriend } = useApp();
  const [words, setWords] = useState<WordDocument[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [copiedWord, setCopiedWord] = useState("");
  const { t } = useTranslation();
  const friend = friends.find((item) => item.uid === friendId);

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
      {words.length ? <div className="shared-word-grid">{words.map((word) => {
        const alreadyAdded = ownWords.some((item) => item.word.trim().toLowerCase() === word.word.trim().toLowerCase());
        return (
          <article key={word.id} className="shared-word-card">
            <div className="flex items-start justify-between gap-3"><div><h2>{word.word}</h2><p>{word.chineseMeaning}</p></div><StageBadge stage={word.stage} status={word.status} /></div>
            {word.synonyms.length ? <p className="shared-synonyms">{word.synonyms.join(" · ")}</p> : null}
            <blockquote>{word.sentences[0]}</blockquote>
            <button className="btn-secondary" disabled={alreadyAdded || copiedWord === word.id} onClick={() => copy(word)}>
              {alreadyAdded || copiedWord === word.id ? t("friends.alreadyAdded") : t("friends.copyWord")}
            </button>
          </article>
        );
      })}</div> : null}
    </div>
  );
}

function FriendNotFound() {
  const { t } = useTranslation();
  return <div className="empty-state mx-auto mt-16 max-w-lg"><strong>{t("friends.friendMissing")}</strong><p>{t("friends.friendMissingHint")}</p><Link href="/friends" className="btn-primary mt-5 inline-block">{t("friends.back")}</Link></div>;
}
