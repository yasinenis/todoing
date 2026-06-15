// Hafif, asset gerektirmeyen ses efektleri (Web Audio ile sentezlenir).
// Ayarlar'dan açılıp kapatılabilir (localStorage'da saklanır).

const KEY = "todoing-sound";

let enabled =
  typeof localStorage !== "undefined" ? localStorage.getItem(KEY) !== "off" : true;

export function getSoundEnabled(): boolean {
  return enabled;
}

export function setSoundEnabled(value: boolean) {
  enabled = value;
  try {
    localStorage.setItem(KEY, value ? "on" : "off");
  } catch {
    /* yok say */
  }
  if (value) playSound("tap"); // küçük geri bildirim
}

let ctx: AudioContext | null = null;
function audio(): AudioContext | null {
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  c: AudioContext,
  freq: number,
  offset: number,
  dur: number,
  peak = 0.16,
  type: OscillatorType = "sine",
) {
  const t = c.currentTime + offset;
  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g);
  g.connect(c.destination);
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export type SoundKind =
  | "tap"
  | "toggle"
  | "success"
  | "complete"
  | "start"
  | "pause";

export function playSound(kind: SoundKind) {
  if (!enabled) return;
  const c = audio();
  if (!c) return;
  switch (kind) {
    case "tap":
      tone(c, 1100, 0, 0.05, 0.1, "triangle");
      break;
    case "toggle":
      tone(c, 680, 0, 0.07, 0.13);
      break;
    case "start":
      tone(c, 520, 0, 0.08, 0.16);
      tone(c, 784, 0.07, 0.1, 0.16);
      break;
    case "pause":
      tone(c, 520, 0, 0.1, 0.13);
      break;
    case "success":
      tone(c, 880, 0, 0.12, 0.2);
      tone(c, 1320, 0.12, 0.18, 0.2);
      break;
    case "complete":
      tone(c, 660, 0, 0.12, 0.2);
      tone(c, 990, 0.12, 0.12, 0.2);
      tone(c, 1320, 0.24, 0.22, 0.2);
      break;
  }
}

/** Geriye dönük uyumluluk (odak bloğu tamamlanınca). */
export function playChime() {
  playSound("complete");
}
