"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function AuthForm() {
  const [isNew, setIsNew] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!auth) return;
    setBusy(true);
    setError("");
    try {
      if (isNew) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message.replace("Firebase: ", "") : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <section className="card w-full max-w-md rounded-[2rem] p-7 sm:p-10 animate-rise">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-[var(--ink)] text-xl text-white">W</div>
          <span className="font-display text-2xl font-semibold">Wordwise</span>
        </div>
        <p className="mb-2 text-sm font-bold uppercase tracking-[.18em] text-[var(--orange)]">Three passes. One new word.</p>
        <h1 className="font-display text-4xl font-semibold leading-tight">Make every word stick.</h1>
        <p className="mt-3 text-sm leading-6 text-black/60">Build a personal vocabulary and review each word exactly when it is due.</p>

        <form className="mt-8 space-y-4" onSubmit={submit}>
          <label className="block text-sm font-bold">Email<input className="field mt-2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
          <label className="block text-sm font-bold">Password<input className="field mt-2" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={isNew ? "new-password" : "current-password"} /></label>
          {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button className="btn-primary w-full" disabled={busy}>{busy ? "Please wait…" : isNew ? "Create my account" : "Sign in"}</button>
        </form>
        <button className="mt-5 w-full text-sm font-bold text-[var(--green)]" onClick={() => { setIsNew(!isNew); setError(""); }}>
          {isNew ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </section>
    </main>
  );
}
