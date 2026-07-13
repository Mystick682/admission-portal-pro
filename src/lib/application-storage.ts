const KEY = "mis:application_id";

export function getDraftId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY);
}

export function setDraftId(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, id);
}

export function clearDraftId() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
