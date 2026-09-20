import { emptyGuestData, type GuestData } from "./guest-data.ts";

const DATABASE = "fowl-to-phoenix-guest-v1";
const STORE = "learning";
const KEY = "guest";
const EVENT = "guest-data-changed";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("storage-blocked"));
    request.onsuccess = () => resolve(request.result);
  });
}

// ponytail: one snapshot keeps small text libraries atomic; split into record stores if profiling large libraries requires it.
async function transact(update?: (data: GuestData) => GuestData): Promise<GuestData> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, update ? "readwrite" : "readonly");
    const store = transaction.objectStore(STORE);
    const request = store.get(KEY);
    let result: GuestData;
    let failure: unknown;
    request.onsuccess = () => {
      try {
        const current = request.result ?? emptyGuestData();
        if (current.version !== 1) throw new Error("unsupported-backup-version");
        result = update ? update(current) : current;
        if (update) store.put(result, KEY);
      } catch (error) {
        failure = error;
        transaction.abort();
      }
    };
    transaction.oncomplete = () => { db.close(); resolve(result); };
    transaction.onabort = transaction.onerror = () => { db.close(); reject(failure ?? transaction.error ?? new Error("storage-failed")); };
  });
}

export function readGuestData() { return transact(); }

export async function updateGuestData(update: (data: GuestData) => GuestData) {
  const result = await transact(update);
  window.dispatchEvent(new Event(EVENT));
  try {
    const channel = new BroadcastChannel(DATABASE);
    channel.postMessage("changed");
    channel.close();
  } catch { /* The committed write remains valid when cross-tab messaging is unavailable. */ }
  return result;
}

export function subscribeGuestData(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("focus", onChange);
  let channel: BroadcastChannel | null = null;
  try { channel = new BroadcastChannel(DATABASE); channel.onmessage = onChange; } catch { /* Focus still refreshes data. */ }
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("focus", onChange);
    channel?.close();
  };
}
