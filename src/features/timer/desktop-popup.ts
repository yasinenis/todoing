// Masaüstü (Electron) mini sayaç popup'ı köprüsü.
// Android bildirim köprüsünün (timer-notification.ts) masaüstü eşi:
// sayaç durumunu Electron ana sürecine iletir; popup'ı arka plana atınca main gösterir.

export type MiniCommand = "pause" | "resume" | "stop";

interface MiniTimerApi {
  isElectron: boolean;
  update: (state: { running: boolean; label: string }) => void;
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

/** Sayaç durumunu (çalışıyor mu + gösterilecek etiket) popup'a gönderir. */
export function updateDesktopMini(running: boolean, label: string): void {
  api()?.update({ running, label });
}

/** Sayaç var/yok — pasifken popup hiç gösterilmez. */
export function setDesktopMiniActive(active: boolean): void {
  api()?.setActive(active);
}

/** Popup butonlarından gelen komutları dinler (yalnızca bir kez bağlanmalı). */
export function onDesktopMiniCommand(cb: (action: MiniCommand) => void): void {
  api()?.onCommand((a) => cb(a as MiniCommand));
}
