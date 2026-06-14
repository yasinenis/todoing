// Masaüstü (Electron) indirme bağlantıları.
// Dosyalar GitHub Releases'e versiyonsuz sabit adlarla yüklendiği için
// "latest/download/<dosya>" her zaman en güncel sürüme gider.

const REPO = "yasinenis/todoing";
const BASE = `https://github.com/${REPO}/releases/latest/download`;

export const RELEASES_PAGE = `https://github.com/${REPO}/releases/latest`;

export type DesktopOS = "windows" | "linux" | "mac";

export interface DownloadEntry {
  id: string;
  os: DesktopOS;
  label: string;
  emoji: string;
  file: string;
  note: string;
}

export const DOWNLOADS: DownloadEntry[] = [
  {
    id: "windows",
    os: "windows",
    label: "Windows",
    emoji: "🪟",
    file: "TodoIng-windows.exe",
    note: ".exe kurulum",
  },
  {
    id: "linux-deb",
    os: "linux",
    label: "Linux · .deb",
    emoji: "🐧",
    file: "TodoIng-linux.deb",
    note: "Menüye kurar (Ubuntu/Debian) — önerilen",
  },
  {
    id: "linux-appimage",
    os: "linux",
    label: "Linux · .AppImage",
    emoji: "🐧",
    file: "TodoIng-linux.AppImage",
    note: "Taşınabilir, kurulum gerektirmez",
  },
  {
    id: "mac",
    os: "mac",
    label: "macOS",
    emoji: "🍎",
    file: "TodoIng-mac.dmg",
    note: ".dmg (Apple Silicon)",
  },
];

export function downloadUrl(file: string): string {
  return `${BASE}/${file}`;
}

/** Tarayıcının işletim sistemini sezer. */
export function detectOS(): DesktopOS | "other" {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("mac")) return "mac";
  if (ua.includes("linux") || ua.includes("x11")) return "linux";
  return "other";
}

/** Uygulama Electron (masaüstü) içinde mi çalışıyor? */
export function isElectron(): boolean {
  return (
    typeof navigator !== "undefined" &&
    navigator.userAgent.toLowerCase().includes("electron")
  );
}
