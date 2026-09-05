const STORAGE_KEY = "biblion:recent-searches";
const MAX_ENTRIES = 5;

/**
 * Per-viewer only — real past queries this browser actually ran, never sent
 * anywhere. Wrapped defensively: localStorage can throw or be unavailable
 * (private browsing, disabled storage), and must never break the page.
 */
export function getRecentSearches(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function pushRecentSearch(query: string): void {
  const trimmed = query.trim();
  if (!trimmed) return;

  try {
    const existing = getRecentSearches().filter(
      (q) => q.toLowerCase() !== trimmed.toLowerCase(),
    );
    const next = [trimmed, ...existing].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable — recent searches just won't persist this session.
  }
}
