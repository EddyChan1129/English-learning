import Link from "next/link";
import { useTranslation } from "react-i18next";

export function AccountRequired({ feature = "friends" }: { feature?: "friends" | "ai" }) {
  const { t } = useTranslation();
  return <section className="card mx-auto max-w-xl p-8 text-center">
    <h1 className="page-title">{t(`guest.${feature}Title`)}</h1>
    <p className="my-5 text-[var(--muted)]">{t(`guest.${feature}Hint`)}</p>
    <Link className="btn-primary inline-block" href="/login">{t("guest.signIn")}</Link>
  </section>;
}
