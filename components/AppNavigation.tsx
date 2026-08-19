"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (!menuOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  function signUserOut() {
    setMenuOpen(false);
    if (auth) void signOut(auth);
  }

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
          <button onClick={signUserOut}>{t("nav.signOut")}</button>
        </div>
      </div>

      <div className="mobile-header-bar">
        <Link href="/" className="mobile-brand" aria-label={t("nav.wordwiseHome")} onClick={() => setMenuOpen(false)}>
          <Image src="/wordwise-mark.svg" alt="" width={36} height={36} priority />
          <strong>Wordwise</strong>
        </Link>
        <button
          type="button"
          className={`menu-toggle ${menuOpen ? "open" : ""}`}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span /><span /><span />
        </button>
      </div>

      {menuOpen ? (
        <div className="mobile-menu-layer">
          <button className="mobile-menu-backdrop" type="button" aria-label={t("nav.closeMenu")} onClick={() => setMenuOpen(false)} />
          <div id="mobile-navigation" className="mobile-menu-panel">
            <nav aria-label={t("nav.mainNavigation")}>{links.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return <Link key={link.href} href={link.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined} onClick={() => setMenuOpen(false)}><span>{t(link.labelKey)}</span><span aria-hidden="true">→</span></Link>;
            })}</nav>
            <div className="mobile-account-row">
              <div><small>{t("nav.account")}</small><strong>{user.email?.split("@")[0]}</strong></div>
              <LanguageSwitcher />
            </div>
            <button className="mobile-sign-out" onClick={signUserOut}>{t("nav.signOut")}</button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
