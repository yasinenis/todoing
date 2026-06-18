import { Capacitor, registerPlugin } from "@capacitor/core";

interface TimerNotificationPlugin {
  /** Çalışan sayaç bildirimi (kronometre). base = epoch ms. */
  start(opts: { title: string; base: number; countDown: boolean }): Promise<void>;
  /** Duraklatılmış sayaç bildirimi (sabit metin). */
  pause(opts: { title: string; text: string }): Promise<void>;
  /** Bildirimi kaldır. */
  stop(): Promise<void>;
}

const TimerNotification = registerPlugin<TimerNotificationPlugin>(
  "TimerNotification",
);

const isNative = () => Capacitor.isNativePlatform();
const TITLE = "TodoIng — Sayaç";

/** Çalışan sayaç için kalıcı bildirim (yalnızca Android/native'de). */
export function showRunningNotification(base: number, countDown: boolean) {
  if (!isNative()) return;
  TimerNotification.start({ title: TITLE, base, countDown }).catch(() => {});
}

/** Duraklatıldı bildirimi. */
export function showPausedNotification(text: string) {
  if (!isNative()) return;
  TimerNotification.pause({ title: TITLE, text }).catch(() => {});
}

/** Bildirimi kaldır. */
export function clearNotification() {
  if (!isNative()) return;
  TimerNotification.stop().catch(() => {});
}
