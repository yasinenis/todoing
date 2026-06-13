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
  start: (taskId: string) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
}

const TimerContext = createContext<TimerContextValue | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [isPending, setIsPending] = useState(false);

  const { data: activeTimer = null } = useQuery({
    queryKey: qk.activeTimer,
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
        toast.error(
          err instanceof Error ? err.message : "Sayaç başlatılamadı.",
        );
        invalidate(); // sunucudan gerçek durumu çek (geri al)
      } finally {
        setIsPending(false);
      }
    },
    [readActive, setActive, commitSession, invalidate],
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
      toast.error(err instanceof Error ? err.message : "Duraklatılamadı.");
      invalidate();
    } finally {
      setIsPending(false);
    }
  }, [readActive, setActive, invalidate]);

  const resume = useCallback(async () => {
    const current = readActive();
    if (!current?.task_id || current.running) return;
    const iso = new Date().toISOString();
    setActive({ ...current, running: true, started_at: iso, updated_at: iso });
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
      toast.error(err instanceof Error ? err.message : "Devam ettirilemedi.");
      invalidate();
    } finally {
      setIsPending(false);
    }
  }, [readActive, setActive, invalidate]);

  const stop = useCallback(async () => {
    const current = readActive();
    if (!current?.task_id) return;
    const at = Date.now();
    // Anlık: sayacı boşalt (widget/sayfa hemen sıfırlansın).
    setActive({
      ...current,
      task_id: null,
      running: false,
      started_at: null,
      accumulated_seconds: 0,
      updated_at: new Date(at).toISOString(),
    });
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
      toast.error(err instanceof Error ? err.message : "Bitirilemedi.");
      invalidate();
    } finally {
      setIsPending(false);
    }
  }, [readActive, setActive, commitSession, invalidate]);

  const liveElapsed = liveElapsedSeconds(activeTimer, nowMs);

  return (
    <TimerContext.Provider
      value={{
        activeTimer,
        activeTaskId: activeTimer?.task_id ?? null,
        isRunning,
        liveElapsed,
        isPending,
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
