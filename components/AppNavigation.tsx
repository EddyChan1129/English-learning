"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut, type User } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { auth } from "@/lib/firebase";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { LearningPlan } from "@/types";

const links = [
  { href: "/", labelKey: "nav.home" },
  { href: "/test", labelKey: "nav.test" },
  { href: "/upcoming-tests", labelKey: "nav.upcomingTests" },
  { href: "/history", labelKey: "nav.history" },
  { href: "/friends", labelKey: "nav.friends" },
];

export function AppNavigation({ user, learningPlans }: { user: User; learningPlans: LearningPlan[] }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();
  const vocabActive = pathname.startsWith("/vocab") || pathname.startsWith("/must-learn") || pathname.startsWith("/news");
  const featuredPlans = learningPlans.filter((plan) => plan.featured).slice(0, 6);
  const [primaryPlan, ...remainingFeaturedPlans] = featuredPlans;

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
        <Link href="/" className="brand" aria-label={t("nav.brandHome")}>
          <Image src="/stage3.png" alt="" width={48} height={48} priority />
          <span><strong>Fowl to Phoenix</strong><small>山雞變鳳凰</small></span>
        </Link>

        <nav className="index-nav" aria-label={t("nav.mainNavigation")}>
          {links.slice(0, 3).map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return <Link key={link.href} href={link.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>{t(link.labelKey)}</Link>;
          })}
          <DropdownMenu>
            <DropdownMenuTrigger className={`nav-dropdown-trigger ${vocabActive ? "active" : ""}`} aria-current={vocabActive ? "page" : undefined}>
              {t("nav.vocab")} <span aria-hidden="true">⌄</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="plan-dropdown">
              <div className="plan-dropdown-heading"><strong>{t("nav.learningPlans")}</strong><small>{t("nav.learningPlansHint")}</small></div>
              {primaryPlan && (
                <DropdownMenuItem asChild>
                  <Link href={`/vocab/${primaryPlan.slug}`} className="plan-dropdown-item">
                    <span><strong>{primaryPlan.title.en}</strong><small>{primaryPlan.title.zh}</small></span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/news" className="plan-dropdown-item" aria-current={pathname.startsWith("/news") ? "page" : undefined}>
                  <span><strong>{t("nav.news")}</strong><small>{t("nav.newsHint")}</small></span>
                  <span aria-hidden="true">→</span>
                </Link>
              </DropdownMenuItem>
              {remainingFeaturedPlans.map((plan) => (
                <DropdownMenuItem key={plan.id} asChild>
                  <Link href={`/vocab/${plan.slug}`} className="plan-dropdown-item">
                    <span><strong>{plan.title.en}</strong><small>{plan.title.zh}</small></span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/vocab" className="plan-dropdown-all">{t("nav.allPlans")} <span aria-hidden="true">→</span></Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {links.slice(3).map((link) => {
            const active = pathname.startsWith(link.href);
            return <Link key={link.href} href={link.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>{t(link.labelKey)}</Link>;
          })}
        </nav>

        <div className="account-menu">
          <Link href="/settings" className={`settings-link ${pathname.startsWith("/settings") ? "active" : ""}`} aria-current={pathname.startsWith("/settings") ? "page" : undefined}>
            <span aria-hidden="true">⚙</span>{t("nav.settings")}
          </Link>
          <span title={user.email ?? "Account"}>{user.email?.split("@")[0]}</span>
          <button onClick={signUserOut}>{t("nav.signOut")}</button>
        </div>
      </div>

      <div className="mobile-header-bar">
        <Link href="/" className="mobile-brand" aria-label={t("nav.brandHome")} onClick={() => setMenuOpen(false)}>
          <Image src="/stage3.png" alt="" width={40} height={40} priority />
          <span><strong>Fowl to Phoenix</strong><small>山雞變鳳凰</small></span>
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
            <nav aria-label={t("nav.mainNavigation")}>{links.slice(0, 3).map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return <Link key={link.href} href={link.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined} onClick={() => setMenuOpen(false)}><span>{t(link.labelKey)}</span><span aria-hidden="true">→</span></Link>;
            })}
              <details className="mobile-plan-menu" open={vocabActive}>
                <summary className={vocabActive ? "active" : ""}><span>{t("nav.vocab")}</span><span aria-hidden="true">⌄</span></summary>
                <div>
                  {primaryPlan && <Link href={`/vocab/${primaryPlan.slug}`} onClick={() => setMenuOpen(false)}><span><strong>{primaryPlan.title.en}</strong><small>{primaryPlan.title.zh}</small></span><span aria-hidden="true">→</span></Link>}
                  <Link href="/news" aria-current={pathname.startsWith("/news") ? "page" : undefined} onClick={() => setMenuOpen(false)}><span><strong>{t("nav.news")}</strong><small>{t("nav.newsHint")}</small></span><span aria-hidden="true">→</span></Link>
                  {remainingFeaturedPlans.map((plan) => <Link key={plan.id} href={`/vocab/${plan.slug}`} onClick={() => setMenuOpen(false)}><span><strong>{plan.title.en}</strong><small>{plan.title.zh}</small></span><span aria-hidden="true">→</span></Link>)}
                  <Link href="/vocab" onClick={() => setMenuOpen(false)}><span>{t("nav.allPlans")}</span><span aria-hidden="true">→</span></Link>
                </div>
              </details>
              {links.slice(3).map((link) => {
                const active = pathname.startsWith(link.href);
                return <Link key={link.href} href={link.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined} onClick={() => setMenuOpen(false)}><span>{t(link.labelKey)}</span><span aria-hidden="true">→</span></Link>;
              })}
            </nav>
            <div className="mobile-account-row">
              <div><small>{t("nav.account")}</small><strong>{user.email?.split("@")[0]}</strong></div>
              <Link href="/settings" className={`settings-link ${pathname.startsWith("/settings") ? "active" : ""}`} aria-current={pathname.startsWith("/settings") ? "page" : undefined} onClick={() => setMenuOpen(false)}>
                <span aria-hidden="true">⚙</span>{t("nav.settings")}
              </Link>
            </div>
            <button className="mobile-sign-out" onClick={signUserOut}>{t("nav.signOut")}</button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
