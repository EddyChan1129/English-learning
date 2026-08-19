"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, type User } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { auth } from "@/lib/firebase";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const links = [
  { href: "/", labelKey: "nav.home" },
  { href: "/test", labelKey: "nav.test" },
  { href: "/history", labelKey: "nav.history" },
  { href: "/friends", labelKey: "nav.friends" },
];

export function AppNavigation({ user }: { user: User }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link href="/" className="brand" aria-label={t("nav.wordwiseHome")}>
          <Image src="/wordwise-mark.svg" alt="" width={42} height={42} priority />
          <span><strong>Wordwise</strong><small>{t("nav.fieldNotes")}</small></span>
        </Link>

        <nav className="index-nav" aria-label={t("nav.mainNavigation")}>
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return <Link key={link.href} href={link.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>{t(link.labelKey)}</Link>;
          })}
        </nav>

        <div className="account-menu">
          <LanguageSwitcher />
          <span title={user.email ?? "Account"}>{user.email?.split("@")[0]}</span>
          <button onClick={() => auth && signOut(auth)}>{t("nav.signOut")}</button>
        </div>
      </div>
      <div className="mobile-tools">
        <LanguageSwitcher />
        <button onClick={() => auth && signOut(auth)}>{t("nav.signOut")}</button>
      </div>
    </header>
  );
}
