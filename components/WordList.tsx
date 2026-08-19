import type { WordDocument } from "@/types";
import { SpeechButton } from "./SpeechButton";

export function WordList({ words }: { words: WordDocument[] }) {
  return (
    <section className="card rounded-[2rem] p-6 sm:p-8">
      <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--orange)]">Your collection</p><h2 className="font-display mt-1 text-3xl font-semibold">Vocabulary</h2></div><span className="text-sm text-black/45">{words.length} total</span></div>
      {words.length === 0 ? <p className="mt-6 rounded-2xl border border-dashed border-black/15 p-6 text-center text-sm text-black/50">Your saved words will appear here.</p> : <div className="mt-5 divide-y divide-black/8">
        {words.slice(0, 12).map((item) => <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="min-w-0"><div className="flex items-center gap-2"><h3 className="font-display text-xl font-semibold">{item.word}</h3><SpeechButton text={item.word} label="" /></div><p className="mt-1 truncate text-sm text-black/55">{item.chineseMeaning}{item.synonyms.length ? ` · ${item.synonyms.join(", ")}` : ""}</p></div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1" aria-label={`Stage ${item.stage} of 3`}>{[1, 2, 3].map((stage) => <span key={stage} className={`size-2.5 rounded-full ${stage <= item.stage ? "bg-[var(--green)]" : "bg-black/12"}`} />)}</div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${item.status === "mastered" ? "bg-[var(--sage)] text-[var(--green)]" : "bg-[#fff1e9] text-[#a94723]"}`}>{item.status === "mastered" ? "Mastered" : `Stage ${item.stage}`}</span>
          </div>
        </article>)}
      </div>}
    </section>
  );
}
