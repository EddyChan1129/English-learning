"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { SpeechButton } from "@/components/SpeechButton";
import { StageBadge } from "@/components/StageBadge";
import { useApp } from "@/components/AppProvider";

export default function WordDetailPage() {
  const { wordId } = useParams<{ wordId: string }>();
  const { words, wordsLoaded } = useApp();
  const word = words.find((item) => item.id === wordId);

  if (!wordsLoaded) return <p className="py-24 text-center text-sm text-[var(--muted)]">Opening word details…</p>;
  if (!word) return <WordNotFound />;

  return (
    <article className="mx-auto max-w-4xl animate-rise">
      <Link href="/history" className="back-link">← Back to history</Link>

      <header className="detail-heading">
        <div>
          <p className="eyebrow">Word detail</p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <h1 className="font-display text-5xl font-semibold sm:text-7xl">{word.word}</h1>
            <SpeechButton text={word.word} label="Listen" />
          </div>
          <p className="mt-3 text-xl text-[var(--muted)]">{word.chineseMeaning}</p>
        </div>
        <StageBadge stage={word.stage} status={word.status} large />
      </header>

      <section className="stage-track" aria-label={`Learning progress: stage ${word.stage} of 3`}>
        {[1, 2, 3].map((pass) => (
          <div key={pass} className={pass <= word.stage ? "complete" : ""}>
            <span>{pass <= word.stage ? "✓" : pass}</span>
            <strong>Pass {pass}</strong>
            <small>{pass <= word.stage ? "Complete" : pass === word.stage + 1 ? "Next" : "Waiting"}</small>
          </div>
        ))}
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-[.65fr_1.35fr]">
        <section className="detail-panel">
          <h2>Learning record</h2>
          <dl>
            <DefinitionRow label="Current stage" value={`${word.stage} of 3`} />
            <DefinitionRow label="Status" value={word.status === "mastered" ? "Mastered" : "Learning"} />
            <DefinitionRow label="Added" value={formatDate(word.createdAt)} />
            <DefinitionRow
              label="Last tested"
              value={word.lastTestedAt ? formatDate(word.lastTestedAt) : "Not tested yet"}
            />
            <DefinitionRow
              label="Next test"
              value={word.status === "mastered" ? "Complete" : formatDate(word.nextTestDate)}
            />
          </dl>
        </section>

        <div className="space-y-6">
          <section className="detail-panel">
            <h2>Synonyms</h2>
            {word.synonyms.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {word.synonyms.map((synonym) => <span key={synonym} className="synonym-chip">{synonym}</span>)}
              </div>
            ) : (
              <p className="mt-4 text-sm text-[var(--muted)]">No synonyms saved.</p>
            )}
          </section>
          <section className="detail-panel">
            <h2>Example sentences</h2>
            <ol className="sentence-list">
              {word.sentences.map((sentence, index) => (
                <li key={`${sentence}-${index}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{sentence}</p>
                  <SpeechButton text={sentence} label="" />
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </article>
  );
}

function DefinitionRow({ label, value }: { label: string; value: string }) {
  return <div className="definition-row"><dt>{label}</dt><dd>{value}</dd></div>;
}

function formatDate(value: string) {
  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

function WordNotFound() {
  return (
    <div className="empty-state mx-auto mt-16 max-w-lg">
      <strong>Word not found.</strong>
      <p>It may have been removed from your collection.</p>
      <Link href="/history" className="btn-primary mt-5 inline-block">Back to history</Link>
    </div>
  );
}
