const BLACKLIST_KEY = "blacklist";
const SKIP_CONFIRM_KEY = "blacklist_skip_confirm";
const FAVORITES_KEY = "favorites";

// ---- Blacklist ----
export function getBlacklist(): string[] {
  try {
    return JSON.parse(localStorage.getItem(BLACKLIST_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToBlacklist(name: string): string[] {
  const list = getBlacklist();
  if (!list.includes(name)) {
    list.push(name);
    localStorage.setItem(BLACKLIST_KEY, JSON.stringify(list));
  }
  return list;
}

export function isSkipConfirm(): boolean {
  return localStorage.getItem(SKIP_CONFIRM_KEY) === "1";
}

export function setSkipConfirm(value: boolean): void {
  localStorage.setItem(SKIP_CONFIRM_KEY, value ? "1" : "0");
}

// ---- Favorites ----
export function getFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
  } catch {
    return [];
  }
}

export function toggleFavorite(name: string): string[] {
  const list = getFavorites();
  const idx = list.indexOf(name);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(name);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
  return list;
}
