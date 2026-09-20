"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useApp } from "@/components/AppProvider";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function LearningPlansCatalogue() {
  const { learningPlans } = useApp();
  const { t, i18n } = useTranslation();
  const chinese = i18n.resolvedLanguage?.startsWith("zh");

  return (
    <div className="plan-catalogue animate-rise">
      <header className="plan-catalogue-hero">
        <p className="eyebrow">{t("plans.eyebrow")}</p>
        <h1 className="page-title">{t("plans.title")}</h1>
        <p>{t("plans.description")}</p>
      </header>
      <div className="plan-index" role="list">
        {learningPlans.map((plan, index) => (
          <Card className="plan-index-card" key={plan.id} role="listitem">
            <Link href={`/vocab/${plan.slug}`}>
              <span className="plan-index-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="plan-index-copy">
                <strong>{chinese ? plan.title.zh : plan.title.en}</strong>
                <small>{chinese ? plan.title.en : plan.title.zh}</small>
                <span>{chinese ? plan.description.zh : plan.description.en}</span>
              </span>
              <span className="plan-index-meta">
                <Badge>{chinese ? plan.level.zh : plan.level.en}</Badge>
                <small>{t("plans.entries", { count: plan.entryCount })}</small>
              </span>
              <span className="plan-index-arrow" aria-hidden="true">→</span>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
