import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { requireUserId } from "@/lib/auth-helpers";
import { qk } from "@/lib/query-keys";
import { toDayStr } from "@/lib/date";
import { playSound } from "@/lib/sound";
import { formatDuration } from "@/lib/utils";
import {
  showRunningNotification,
  showPausedNotification,
  clearNotification,
} from "./timer-notification";
import {
  hasDesktopMini,
  updateDesktopMini,
  setDesktopMiniActive,
  onDesktopMiniCommand,
} from "./desktop-popup";
import { useAuth } from "@/app/providers/auth-provider";
import { useI18n } from "@/i18n";
import type { Timer } from "@/lib/database.types";

/** Sayacın bir oturumda biriken canlı süresini (saniye) hesaplar. */
export function liveElapsedSeconds(timer: Timer | null, nowMs: number): number {
  if (!timer) return 0;
  const running =
    timer.running && timer.started_at
      ? (nowMs - Date.parse(timer.started_at)) / 1000
      : 0;
  return timer.accumulated_seconds + Math.max(0, running);
}

interface TimerContextValue {
  activeTimer: Timer | null;
  activeTaskId: string | null;
  isRunning: boolean;
  /** Aktif oturumun canlı geçen süresi (saniye, 1sn'de bir güncellenir). */
  liveElapsed: number;
  isPending: boolean;
  /** Odak bloğu hedefi (saniye) — null ise serbest sayaç. */
  blockSeconds: number | null;
  setBlock: (seconds: number | null) => void;
  start: (taskId: string) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
}

const BLOCK_KEY = "todoing-timer-block";

const TimerContext = createContext<TimerContextValue | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { t } = useI18n();
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [isPending, setIsPending] = useState(false);
  const [blockSeconds, setBlockState] = useState<number | null>(() => {
    const v = localStorage.getItem(BLOCK_KEY);
    return v ? Number(v) : null;
  });

  const setBlock = useCallback((seconds: number | null) => {
    if (seconds && seconds > 0) localStorage.setItem(BLOCK_KEY, String(seconds));
    else localStorage.removeItem(BLOCK_KEY);
    setBlockState(seconds && seconds > 0 ? seconds : null);
  }, []);

  const { data: activeTimer = null } = useQuery({
    queryKey: qk.activeTimer,
    // Zaman-hassas: odaklanınca her zaman tazelensin (diğer cihaz senkronu).
    staleTime: 0,
    queryFn: async (): Promise<Timer | null> => {
      const { data, error } = await supabase
        .from("timers")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const isRunning = !!activeTimer?.running;

  // Çalışırken her saniye tik at (duraklatınca durdur → gereksiz render yok).
  const intervalRef = useRef<number | null>(null);
  useEffect(() => {
    if (isRunning) {
      setNowMs(Date.now());
      intervalRef.current = window.setInterval(
        () => setNowMs(Date.now()),
        1000,
      );
      return () => {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
      };
    }
  }, [isRunning]);

  // İleri (normal) modda her tam saatte ufak bir "saat doldu" sesi.
  const lastHourRef = useRef(0);
  useEffect(() => {
    if (!isRunning || blockSeconds != null) return; // sadece ileri sayımda
    const elapsed = liveElapsedSeconds(activeTimer, nowMs);
    const hours = Math.floor(elapsed / 3600);
    if (hours < lastHourRef.current) lastHourRef.current = hours; // oturum sıfırlandı
    if (hours >= 1 && hours > lastHourRef.current) {
      lastHourRef.current = hours;
      playSound("hour");
    }
  }, [nowMs, isRunning, blockSeconds, activeTimer]);

  // Masaüstü mini popup: sayaç durumunu (etiket moda göre) ana sürece gönder.
  useEffect(() => {
    if (!hasDesktopMini()) return;
    const session = liveElapsedSeconds(activeTimer, nowMs);
    const label =
      blockSeconds != null
        ? formatDuration(Math.max(0, blockSeconds - session), true)
        : formatDuration(session, true);
    updateDesktopMini(isRunning, label);
  }, [nowMs, isRunning, blockSeconds, activeTimer]);

  // Sayaç var/yok — popup yalnızca aktif sayaçta arka planda gösterilir.
  useEffect(() => {
    if (!hasDesktopMini()) return;
    setDesktopMiniActive(!!activeTimer?.task_id);
  }, [activeTimer?.task_id]);

  // Gerçek zamanlı senkron: başka cihazda yapılan değişiklikler anında yansısın.
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`timer-sync-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "timers",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const next =
            payload.eventType === "DELETE"
              ? null
              : (payload.new as unknown as Timer);
          qc.setQueryData(qk.activeTimer, next);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: qk.tasks() });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, qc]);

  const invalidate = useCallback(
    (withTotals = false) => {
      qc.invalidateQueries({ queryKey: qk.activeTimer });
      if (withTotals) {
        qc.invalidateQueries({ queryKey: qk.tasks() });
        qc.invalidateQueries({ queryKey: qk.timeEntries() });
      }
    },
    [qc],
  );

  /** activeTimer cache'ini anlık (optimistic) günceller. */
  const setActive = useCallback(
    (next: Timer | null) => qc.setQueryData(qk.activeTimer, next),
    [qc],
  );

  /** Aktif oturumu time_entries'e yazar (task total_seconds trigger ile güncellenir). */
  const commitSession = useCallback(
    async (timer: Timer, at: number, userId: string) => {
      const elapsed = Math.round(liveElapsedSeconds(timer, at));
      if (timer.task_id && elapsed >= 1) {
        const ended = new Date(at);
        const started = new Date(at - elapsed * 1000);
        const { error } = await supabase.from("time_entries").insert({
          user_id: userId,
          task_id: timer.task_id,
          started_at: started.toISOString(),
          ended_at: ended.toISOString(),
          duration_seconds: elapsed,
          day: toDayStr(ended),
        });
        if (error) throw error;
      }
    },
    [],
  );

  /** Geçerli sayaç durumunu cache'ten okur (optimistic güncellemeler dahil). */
  const readActive = useCallback(
    () => qc.getQueryData<Timer | null>(qk.activeTimer) ?? null,
    [qc],
  );

  const start = useCallback(
    async (taskId: string) => {
      const current = readActive();
      const at = Date.now();
      const sameTask = current?.task_id === taskId;
      const iso = new Date(at).toISOString();
      // Anlık (optimistic) güncelleme — arayüz beklemeden tepki versin.
      setActive({
        id: current?.id ?? "optimistic",
        user_id: current?.user_id ?? "",
        task_id: taskId,
        running: true,
        started_at: iso,
        accumulated_seconds: sameTask ? current!.accumulated_seconds : 0,
        updated_at: iso,
      });
      playSound("start");
      {
        const elapsedSec = sameTask ? (current?.accumulated_seconds ?? 0) : 0;
        showRunningNotification(
          blockSeconds != null
            ? at + Math.max(0, blockSeconds - elapsedSec) * 1000
            : at - elapsedSec * 1000,
          blockSeconds != null,
        );
      }
      setIsPending(true);
      try {
        const userId = await requireUserId();
        if (current?.task_id && current.task_id !== taskId) {
          await commitSession(current, at, userId);
        }
        if (sameTask) {
          const { error } = await supabase
            .from("timers")
            .update({ running: true, started_at: iso, updated_at: iso })
            .eq("user_id", userId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("timers").upsert(
            {
              user_id: userId,
              task_id: taskId,
              running: true,
              started_at: iso,
              accumulated_seconds: 0,
              updated_at: iso,
            },
            { onConflict: "user_id" },
          );
          if (error) throw error;
        }
        invalidate(true);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t("timer.errStart"));
        invalidate(); // sunucudan gerçek durumu çek (geri al)
      } finally {
        setIsPending(false);
      }
    },
    [readActive, setActive, commitSession, invalidate, blockSeconds, t],
  );

  const pause = useCallback(async () => {
    const current = readActive();
    if (!current?.running) return;
    const at = Date.now();
    const accumulated = Math.round(liveElapsedSeconds(current, at));
    setActive({
      ...current,
      running: false,
      started_at: null,
      accumulated_seconds: accumulated,
      updated_at: new Date(at).toISOString(),
    });
    playSound("pause");
    showPausedNotification(
      t("timer.pausedNotif", { s: formatDuration(accumulated, true) }),
    );
    setIsPending(true);
    try {
      const userId = await requireUserId();
      const { error } = await supabase
        .from("timers")
        .update({
          running: false,
          started_at: null,
          accumulated_seconds: accumulated,
          updated_at: new Date(at).toISOString(),
        })
        .eq("user_id", userId);
      if (error) throw error;
      invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("timer.errPause"));
      invalidate();
    } finally {
      setIsPending(false);
    }
  }, [readActive, setActive, invalidate, blockSeconds, t]);

  const resume = useCallback(async () => {
    const current = readActive();
    if (!current?.task_id || current.running) return;
    const iso = new Date().toISOString();
    setActive({ ...current, running: true, started_at: iso, updated_at: iso });
    playSound("start");
    {
      const elapsedSec = current.accumulated_seconds ?? 0;
      const at = Date.parse(iso);
      showRunningNotification(
        blockSeconds != null
          ? at + Math.max(0, blockSeconds - elapsedSec) * 1000
          : at - elapsedSec * 1000,
        blockSeconds != null,
      );
    }
    setIsPending(true);
    try {
      const userId = await requireUserId();
      const { error } = await supabase
        .from("timers")
        .update({ running: true, started_at: iso, updated_at: iso })
        .eq("user_id", userId);
      if (error) throw error;
      invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("timer.errResume"));
      invalidate();
    } finally {
      setIsPending(false);
    }
  }, [readActive, setActive, invalidate, blockSeconds, t]);

  const stop = useCallback(async () => {
    const current = readActive();
    if (!current?.task_id) return;
    const at = Date.now();
    // Anlık: sayacı boşalt (widget/sayfa hemen sıfırlansın) + bloğu temizle.
    setActive({
      ...current,
      task_id: null,
      running: false,
      started_at: null,
      accumulated_seconds: 0,
      updated_at: new Date(at).toISOString(),
    });
    setBlock(null);
    playSound("stop");
    clearNotification();
    setIsPending(true);
    try {
      const userId = await requireUserId();
      await commitSession(current, at, userId);
      const { error } = await supabase
        .from("timers")
        .update({
          task_id: null,
          running: false,
          started_at: null,
          accumulated_seconds: 0,
          updated_at: new Date(at).toISOString(),
        })
        .eq("user_id", userId);
      if (error) throw error;
      invalidate(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("timer.errStop"));
      invalidate();
    } finally {
      setIsPending(false);
    }
  }, [readActive, setActive, setBlock, commitSession, invalidate, t]);

  // Mini popup butonları (pause/resume/stop) → ilgili aksiyonu çalıştır.
  // Aksiyonları ref'te tut; dinleyici yalnızca bir kez (mount'ta) bağlanır.
  const actionsRef = useRef({ pause, resume, stop });
  actionsRef.current = { pause, resume, stop };
  useEffect(() => {
    if (!hasDesktopMini()) return;
    onDesktopMiniCommand((a) => {
      const cur = actionsRef.current;
      if (a === "pause") void cur.pause();
      else if (a === "resume") void cur.resume();
      else if (a === "stop") void cur.stop();
    });
  }, []);

  const liveElapsed = liveElapsedSeconds(activeTimer, nowMs);

  return (
    <TimerContext.Provider
      value={{
        activeTimer,
        activeTaskId: activeTimer?.task_id ?? null,
        isRunning,
        liveElapsed,
        isPending,
        blockSeconds,
        setBlock,
        start,
        pause,
        resume,
        stop,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used within TimerProvider");
  return ctx;
}
