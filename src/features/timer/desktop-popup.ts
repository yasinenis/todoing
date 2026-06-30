// Masaüstü (Electron) mini sayaç popup'ı köprüsü.
// Android bildirim köprüsünün (timer-notification.ts) masaüstü eşi:
// sayaç durumunu Electron ana sürecine iletir; popup'ı arka plana atınca main gösterir.

export type MiniCommand = "pause" | "resume" | "stop";

/** Popup'a gönderilen ham durum — popup zamanı kendi içinde hesaplar. */
export interface MiniState {
  running: boolean;
  /** Aktif oturumun başladığı an (epoch ms); duraklatıldıysa null. */
  startedAtMs: number | null;
  /** O ana kadar birikmiş süre (saniye). */
  accumulatedSeconds: number;
  /** Odak bloğu hedefi (saniye) — null ise serbest (ileri) sayaç. */
  blockSeconds: number | null;
  /** Hazır etiket (eski main süreçler için yedek; yeni popup ham veriyi sayar). */
  label?: string;
}

interface MiniTimerApi {
  isElectron: boolean;
  update: (state: MiniState) => void;
  setActive: (active: boolean) => void;
  onCommand: (cb: (action: MiniCommand) => void) => void;
}

declare global {
  interface Window {
    miniTimer?: MiniTimerApi;
  }
}

function api(): MiniTimerApi | undefined {
  return typeof window !== "undefined" ? window.miniTimer : undefined;
}

/** Masaüstünde miyiz (mini popup köprüsü mevcut mu)? */
export function hasDesktopMini(): boolean {
  return !!api();
}

/** Sayaç ham durumunu popup'a gönderir (popup zamanı kendi sayar). */
export function updateDesktopMini(state: MiniState): void {
  api()?.update(state);
}

/** Sayaç var/yok — pasifken popup hiç gösterilmez. */
export function setDesktopMiniActive(active: boolean): void {
  api()?.setActive(active);
}

/** Popup butonlarından gelen komutları dinler (yalnızca bir kez bağlanmalı). */
export function onDesktopMiniCommand(cb: (action: MiniCommand) => void): void {
  api()?.onCommand((a) => cb(a as MiniCommand));
}
