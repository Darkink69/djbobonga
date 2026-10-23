import type { Profile } from "../api/profiles";

function extractThumbSuffix(video: string): string {
  return video.replace(/^live-edge/, "");
}

export function buildThumbUrl(profile: Profile, tsSeconds: number): string {
  const suffix = extractThumbSuffix(profile.video);
  return `https://vthumb${suffix}.bcvcdn.com/stream_${profile.name}.mp4?t=${tsSeconds}`;
}
