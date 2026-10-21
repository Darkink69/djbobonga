import type { Model } from "../types/model";

const ENDPOINT =
  "https://huggingface.co/datasets/2chch/bo_m3u8/raw/main/models_db.json";

export async function fetchModels(): Promise<Model[]> {
  const res = await fetch(ENDPOINT);
  if (!res.ok) throw new Error(`Failed to load models: ${res.status}`);
  return res.json();
}
