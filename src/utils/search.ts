import type { Model } from "../types/model";

export function filterModels(models: Model[], query: string): Model[] {
  const q = query.trim().toLowerCase();
  if (!q) return models;
  return models.filter((m) => m.name.toLowerCase().includes(q));
}
