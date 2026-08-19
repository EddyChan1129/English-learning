"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

const links = [
  { href: "/", label: "Home" },
  { href: "/test", label: "Test" },
  { href: "/history", label: "History" },
];

export function AppNavigation({ user }: { user: User }) {
  const pathname = usePathname();

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link href="/" className="brand" aria-label="Wordwise home">
          <span className="brand-mark">W.</span>
          <span><strong>Wordwise</strong><small>English field notes</small></span>
        </Link>

        <nav className="index-nav" aria-label="Main navigation">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return <Link key={link.href} href={link.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>{link.label}</Link>;
          })}
        </nav>

        <div className="account-menu">
          <span title={user.email ?? "Account"}>{user.email?.split("@")[0]}</span>
          <button onClick={() => auth && signOut(auth)}>Sign out</button>
        </div>
      </div>
    </header>
  );
}
