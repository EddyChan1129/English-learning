"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useApp } from "@/components/AppProvider";
import { acceptFriendRequest, searchUserProfiles, sendFriendRequest, subscribeToFriendRequests } from "@/lib/firestore";
import type { FriendRequestDocument, UserProfile } from "@/types";

export default function FriendsPage() {
  const { user, profile, profileLoaded, friends, friendsLoaded } = useApp();
  const [username, setUsername] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [searched, setSearched] = useState(false);
  const [requests, setRequests] = useState<FriendRequestDocument[]>([]);
  const [requestsLoaded, setRequestsLoaded] = useState(false);
  const [sentUids, setSentUids] = useState<Set<string>>(() => new Set());
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const { t } = useTranslation();

  useEffect(() => subscribeToFriendRequests(user.uid, (nextRequests) => {
    setRequests(nextRequests);
    setRequestsLoaded(true);
  }, () => {
    setError(t("friends.requestsError"));
    setRequestsLoaded(true);
  }), [t, user.uid]);

  async function search(event: React.FormEvent) {
    event.preventDefault();
    setBusyId("search");
    setMessage("");
    setError("");
    try {
      setResults(await searchUserProfiles(username, user.uid));
      setSearched(true);
    } catch (caught) {
      const code = caught instanceof Error ? caught.message : "";
      setError(t(code === "invalid-username" ? "friends.invalidUsername" : "friends.searchError"));
    } finally {
      setBusyId("");
    }
  }

  async function sendRequest(recipient: UserProfile) {
    if (!profile) return;
    setBusyId(recipient.uid);
    setMessage("");
    setError("");
    try {
      await sendFriendRequest(profile, recipient);
      setSentUids((current) => new Set(current).add(recipient.uid));
      setMessage(t("friends.requestSent", { name: recipient.displayName }));
    } catch (caught) {
      const code = caught instanceof Error ? caught.message : "";
      setError(t(code === "already-friends" ? "friends.alreadyFriends" : "friends.requestError"));
    } finally {
      setBusyId("");
    }
  }

  async function accept(request: FriendRequestDocument) {
    if (!profile) return;
    setBusyId(request.senderUid);
    setMessage("");
    setError("");
    try {
      await acceptFriendRequest(profile, request);
      setMessage(t("friends.accepted", { name: request.senderDisplayName }));
    } catch {
      setError(t("friends.acceptError"));
    } finally {
      setBusyId("");
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
        <form className="card p-6" onSubmit={search} aria-busy={busyId === "search"}>
          <p className="eyebrow">{t("friends.addEyebrow")}</p>
          <h2 className="font-display mt-1 text-2xl font-semibold">{t("friends.addTitle")}</h2>
          {profile ? <p className="mt-2 text-xs text-[var(--muted)]">{t("friends.yourUsername", { username: profile.displayName })}</p> : null}
          <label className="mt-5 block text-sm font-bold">
            {t("friends.username")}
            <input className="field mt-2" required value={username} onChange={(event) => setUsername(event.target.value)} placeholder={t("friends.usernamePlaceholder")} autoComplete="off" />
          </label>
          <button className="btn-primary mt-4" disabled={busyId === "search"}>{busyId === "search" ? t("friends.searching") : t("friends.searchButton")}</button>
          {searched && !results.length ? <p className="friend-search-empty">{t("friends.noUsersFound")}</p> : null}
          {results.length ? <div className="friend-request-list">{results.map((result) => {
            const alreadyFriend = friends.some((friend) => friend.uid === result.uid);
            const sent = sentUids.has(result.uid);
            return (
              <div key={result.uid} className="friend-request-row">
                <span className="friend-avatar" aria-hidden="true">{result.displayName.slice(0, 1).toUpperCase()}</span>
                <div><strong>{result.displayName}</strong><small>@{result.normalizedUsername}</small></div>
                <button type="button" className="btn-secondary" disabled={!profileLoaded || alreadyFriend || sent || busyId === result.uid} onClick={() => sendRequest(result)}>
                  {alreadyFriend ? t("friends.alreadyFriends") : sent ? t("friends.requestPending") : busyId === result.uid ? t("friends.sendingRequest") : t("friends.sendRequest")}
                </button>
              </div>
            );
          })}</div> : null}
        </form>

        <section className="card p-6">
          <div className="friend-request-heading">
            <div><p className="eyebrow">{t("friends.incomingEyebrow")}</p><h2 className="font-display mt-1 text-2xl font-semibold">{t("friends.incomingTitle")}</h2></div>
            <span>{requests.length}</span>
          </div>
          {!requestsLoaded ? <p className="friend-search-empty">{t("friends.loadingRequests")}</p> : null}
          {requestsLoaded && !requests.length ? <p className="friend-search-empty">{t("friends.noRequests")}</p> : null}
          {requests.length ? <div className="friend-request-list">{requests.map((request) => (
            <div key={request.senderUid} className="friend-request-row">
              <span className="friend-avatar" aria-hidden="true">{request.senderDisplayName.slice(0, 1).toUpperCase()}</span>
              <div><strong>{request.senderDisplayName}</strong><small>{t("friends.wantsToConnect")}</small></div>
              <button type="button" className="btn-primary" disabled={!profileLoaded || busyId === request.senderUid} onClick={() => accept(request)}>{busyId === request.senderUid ? t("friends.accepting") : t("friends.accept")}</button>
            </div>
          ))}</div> : null}
        </section>
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
