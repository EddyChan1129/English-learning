"use client";

import { useState } from "react";
import Image from "next/image";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { auth } from "@/lib/firebase";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function AuthForm() {
  const [isNew, setIsNew] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { t } = useTranslation();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!auth) return;
    setBusy(true);
    setError("");
    try {
      if (isNew) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError(t("auth.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <section className="card w-full max-w-md p-7 sm:p-10 animate-rise">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image src="/stage3-3d.png" alt="" width={52} height={52} priority className="auth-brand-mascot" />
            <span><strong className="font-display block text-2xl font-semibold leading-none">Fowl to Phoenix</strong><small className="mt-1 block text-xs text-[var(--muted)]">雞仔變鳳凰</small></span>
          </div>
          <LanguageSwitcher />
        </div>
        <p className="eyebrow mb-2">{t("auth.eyebrow")}</p>
        <h1 className="font-display text-4xl font-semibold leading-tight">{t("auth.title")}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{t("auth.description")}</p>

        <form className="mt-8 space-y-4" onSubmit={submit}>
          <label className="block text-sm font-bold">
            {t("auth.email")}
            <input className="field mt-2" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
          </label>
          <label className="block text-sm font-bold">
            {t("auth.password")}
            <input
              className="field mt-2"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isNew ? "new-password" : "current-password"}
            />
          </label>
          {error ? <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          <button className="btn-primary w-full" disabled={busy}>{busy ? t("auth.wait") : isNew ? t("auth.create") : t("auth.signIn")}</button>
        </form>
        <button className="text-button mt-5 w-full" onClick={() => {
          setIsNew(!isNew);
          setError("");
        }}>
          {isNew ? t("auth.existing") : t("auth.new")}
        </button>
      </section>
    </main>
  );
}
