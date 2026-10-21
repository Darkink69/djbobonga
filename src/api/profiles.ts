export interface Profile {
  name: string;
  video: string;
  img: string;
  vq: string;
  viewers: number;
  img_live: string;
  stream_full: string;
}

const ENDPOINT =
  "https://huggingface.co/datasets/2chch/bo_m3u8/raw/main/profiles.json";

export async function fetchProfiles(): Promise<Profile[]> {
  const res = await fetch(ENDPOINT);
  if (!res.ok) throw new Error(`Failed to load profiles: ${res.status}`);
  return res.json();
}
