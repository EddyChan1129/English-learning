"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { TestSession } from "@/components/TestSession";
import { useApp } from "@/components/AppProvider";

export default function TestPage() {
  const { dueWords, wordsLoaded, saveTestResult } = useApp();
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-4xl animate-rise">
      <header className="mb-7 border-b border-[var(--line)] pb-5">
        <p className="eyebrow">{t("testPage.eyebrow")}</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="page-title">{t("testPage.title")}</h1>
            <p className="mt-2 text-[var(--muted)]">{t("testPage.description")}</p>
          </div>
          <span className="count-label">{t("testPage.due", { count: dueWords.length })}</span>
        </div>
      </header>

      {!wordsLoaded
        ? <p className="py-24 text-center text-sm text-[var(--muted)]">{t("testPage.preparing")}</p>
        : <TestSession key={dueWords[0]?.id ?? "empty"} words={dueWords} onResult={saveTestResult} />}

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        {t("testPage.prompt")} <Link href="/history" className="text-button">{t("testPage.openHistory")}</Link>
      </p>
    </div>
  );
}
