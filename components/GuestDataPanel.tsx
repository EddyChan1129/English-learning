"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/components/AppProvider";
import { emptyGuestData, mergeGuestData, parseGuestBackup, type GuestData } from "@/lib/guest-data";
import { readGuestData, updateGuestData } from "@/lib/guest-storage";
import { transferGuestData } from "@/lib/firestore";

export function GuestDataPanel() {
  const { user, guestData, refreshAccount } = useApp();
  const { t } = useTranslation();
  const [local, setLocal] = useState<GuestData | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [pendingImport, setPendingImport] = useState<GuestData | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const clearDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!user) return;
    let active = true;
    readGuestData().then((data) => { if (active) setLocal(data); }).catch(() => {});
    return () => { active = false; };
  }, [user]);
  useEffect(() => {
    if (!confirmClear) return;
    const dialog = clearDialog.current;
    dialog?.showModal();
    cancelButton.current?.focus();
    return () => { dialog?.close(); };
  }, [confirmClear]);
  const data = user ? local : guestData;

  async function run(action: () => Promise<void>) {
    setBusy(true); setError(""); setMessage("");
    try { await action(); } catch { setError(t("guest.dataError")); } finally { setBusy(false); }
  }

  async function exportBackup() {
    await run(async () => {
      const latest = await readGuestData();
      const url = URL.createObjectURL(new Blob([JSON.stringify(latest, null, 2)], { type: "application/json" }));
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = `fowl-to-phoenix-backup-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  async function readBackup(file?: File) {
    if (!file) return;
    await run(async () => {
      if (file.size > 20 * 1024 * 1024) throw new Error("backup-too-large");
      setPendingImport(parseGuestBackup(JSON.parse(await file.text())));
    });
    if (fileInput.current) fileInput.current.value = "";
  }

  if (!data) return null;
  if (user && !data.words.length && !data.target && !data.categories.length && !data.attempts.length) return null;
  return <section className="card my-6 p-6" aria-busy={busy}>
    <h2 className="font-display text-2xl font-semibold">{t(user ? "guest.transferTitle" : "guest.localData")}</h2>
    <p className="mt-2 text-sm text-[var(--muted)]">{t(user ? "guest.transferHint" : "guest.dataHint")}</p>
    <p className="my-4 text-sm">{t("guest.wordCount", { count: data.words.length })}</p>
    <div className="flex flex-wrap gap-3">
      <button type="button" className="btn-secondary" disabled={busy} onClick={() => void exportBackup()}>{t("guest.export")}</button>
      {user ? <button type="button" className="btn-primary" disabled={busy} onClick={() => void run(async () => {
        const result = await transferGuestData(user.uid, await readGuestData());
        await refreshAccount();
        setMessage(t("guest.transferred", result));
      })}>{t("guest.transfer")}</button> : <>
        <button type="button" className="btn-secondary" disabled={busy} onClick={() => fileInput.current?.click()}>{t("guest.import")}</button>
        <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" aria-label={t("guest.import")} onChange={(event) => void readBackup(event.target.files?.[0])} />
        <button type="button" className="btn-secondary" disabled={busy} onClick={() => { setConfirmClear(true); setPendingImport(null); }}>{t("guest.clear")}</button>
      </>}
    </div>
    {pendingImport ? <div className="mt-5 rounded-xl border border-[var(--line)] p-4">
      <p>{t("guest.importHint", { count: pendingImport.words.length })}</p>
      <div className="mt-3 flex gap-3">
        <button className="btn-secondary" disabled={busy} onClick={() => setPendingImport(null)}>{t("common.cancel")}</button>
        <button className="btn-primary" disabled={busy} onClick={() => void run(async () => {
          await updateGuestData((current) => mergeGuestData(current, pendingImport));
          setPendingImport(null); setMessage(t("guest.imported"));
        })}>{t("guest.confirmImport")}</button>
      </div>
    </div> : null}
    {confirmClear ? <dialog ref={clearDialog} className="m-auto max-w-lg rounded-xl border border-red-300 bg-[var(--paper)] p-6 text-[var(--ink)] backdrop:bg-black/40" aria-labelledby="clear-guest-title" onCancel={(event) => { event.preventDefault(); if (!busy) setConfirmClear(false); }}>
      <h3 id="clear-guest-title" className="font-bold">{t("guest.clearTitle")}</h3>
      <p className="mt-2 text-sm">{t("guest.clearHint")}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button ref={cancelButton} className="btn-secondary" disabled={busy} onClick={() => setConfirmClear(false)}>{t("common.cancel")}</button>
        <button className="btn-secondary" disabled={busy} onClick={() => void exportBackup()}>{t("guest.export")}</button>
        <button className="btn-primary" disabled={busy} onClick={() => void run(async () => {
          await updateGuestData(() => emptyGuestData());
          setConfirmClear(false); setMessage(t("guest.cleared"));
        })}>{t("guest.confirmClear")}</button>
      </div>
    </dialog> : null}
    {error ? <p role="alert" className="feedback error mt-4">{error}</p> : null}
    {message ? <p role="status" className="feedback success mt-4">{message}</p> : null}
  </section>;
}
