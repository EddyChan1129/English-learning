"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useApp } from "@/components/AppProvider";

export default function FriendsPage() {
  const { profile, profileLoaded, friends, friendsLoaded, addFriendByCode } = useApp();
  const [friendCode, setFriendCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { t } = useTranslation();

  async function copyCode() {
    if (!profile) return;
    try {
      await navigator.clipboard.writeText(profile.friendCode);
      setMessage(t("friends.codeCopied"));
    } catch {
      setError(t("friends.copyCodeError"));
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const friend = await addFriendByCode(friendCode);
      setFriendCode("");
      setMessage(t("friends.added", { name: friend.displayName }));
    } catch (caught) {
      const code = caught instanceof Error ? caught.message : "";
      setError(t(code === "friend-not-found" ? "friends.notFound" : code === "invalid-friend-code" ? "friends.invalidCode" : "friends.addError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="animate-rise">
      <header className="border-b border-[var(--line)] pb-5">
        <p className="eyebrow">{t("friends.eyebrow")}</p>
        <h1 className="page-title">{t("friends.title")}</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">{t("friends.description")}</p>
      </header>

      <div className="friend-tools">
        <section className="friend-code-card">
          <p className="eyebrow">{t("friends.yourCode")}</p>
          <strong>{profileLoaded ? profile?.friendCode : t("friends.loading")}</strong>
          <p>{t("friends.shareCode")}</p>
          <button className="btn-secondary" type="button" disabled={!profile} onClick={copyCode}>{t("friends.copyCode")}</button>
        </section>

        <form className="card p-6" onSubmit={submit} aria-busy={busy}>
          <p className="eyebrow">{t("friends.addEyebrow")}</p>
          <h2 className="font-display mt-1 text-2xl font-semibold">{t("friends.addTitle")}</h2>
          <label className="mt-5 block text-sm font-bold">
            {t("friends.friendCode")}
            <input className="field mt-2 font-mono" required value={friendCode} onChange={(event) => setFriendCode(event.target.value)} placeholder={t("friends.codePlaceholder")} />
          </label>
          <button className="btn-primary mt-4" disabled={busy}>{busy ? t("friends.adding") : t("friends.addButton")}</button>
        </form>
      </div>

      {message ? <p className="feedback success" role="status">{message}</p> : null}
      {error ? <p className="feedback error" role="alert">{error}</p> : null}

      <section className="mt-10">
        <div className="section-rule"><p className="eyebrow">{t("friends.listEyebrow")}</p><span>{friends.length}</span></div>
        {!friendsLoaded ? <p className="py-16 text-center text-sm text-[var(--muted)]">{t("friends.loadingFriends")}</p> : null}
        {friendsLoaded && friends.length === 0 ? <div className="empty-state"><strong>{t("friends.noFriends")}</strong><p>{t("friends.noFriendsHint")}</p></div> : null}
        {friends.length ? <div className="friend-grid">{friends.map((friend) => (
          <Link key={friend.uid} href={`/friends/${friend.uid}`} className="friend-card">
            <span className="friend-avatar" aria-hidden="true">{friend.displayName.slice(0, 1).toUpperCase()}</span>
            <div><h2>{friend.displayName}</h2><p>{t("friends.viewWords")}</p></div>
            <span aria-hidden="true">→</span>
          </Link>
        ))}</div> : null}
      </section>
    </div>
  );
}
