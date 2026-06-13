import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind sınıflarını koşullu birleştirir ve çakışmaları çözer. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Saniyeyi "1s 23d 45sn" / "23:45" gibi okunur biçime çevirir. */
export function formatDuration(totalSeconds: number, compact = false): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  if (compact) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return hours > 0
      ? `${hours}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;
  }

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}s`);
  if (minutes > 0) parts.push(`${minutes}d`);
  if (hours === 0) parts.push(`${seconds}sn`);
  return parts.join(" ") || "0sn";
}

/** Saniyeyi saate çevirir (grafikler için), 2 ondalık. */
export function secondsToHours(seconds: number): number {
  return Math.round((seconds / 3600) * 100) / 100;
}
