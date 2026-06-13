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

  const start = useCallback(
    async (taskId: string) => {
      setIsPending(true);
      try {
        const userId = await requireUserId();
        const current = activeTimer;
        const at = Date.now();
        // Başka bir görev aktifse onun oturumunu kaydet (tek aktif sayaç).
        if (current?.task_id && current.task_id !== taskId) {
          await commitSession(current, at, userId);
        }
        if (current?.task_id === taskId) {
          // Aynı görev → kaldığı yerden devam et.
          const { error } = await supabase
            .from("timers")
            .update({
              running: true,
              started_at: new Date(at).toISOString(),
              updated_at: new Date(at).toISOString(),
            })
            .eq("user_id", userId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("timers").upsert(
            {
              user_id: userId,
              task_id: taskId,
              running: true,
              started_at: new Date(at).toISOString(),
              accumulated_seconds: 0,
              updated_at: new Date(at).toISOString(),
            },
            { onConflict: "user_id" },
          );
          if (error) throw error;
        }
        invalidate(true);
      } finally {
        setIsPending(false);
      }
    },
    [activeTimer, commitSession, invalidate],
  );

  const pause = useCallback(async () => {
    if (!activeTimer?.running) return;
    setIsPending(true);
    try {
      const userId = await requireUserId();
      const at = Date.now();
      const accumulated = Math.round(liveElapsedSeconds(activeTimer, at));
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
    } finally {
      setIsPending(false);
    }
  }, [activeTimer, invalidate]);

  const resume = useCallback(async () => {
    if (!activeTimer?.task_id || activeTimer.running) return;
    setIsPending(true);
    try {
      const userId = await requireUserId();
      const at = Date.now();
      const { error } = await supabase
        .from("timers")
        .update({
          running: true,
          started_at: new Date(at).toISOString(),
          updated_at: new Date(at).toISOString(),
        })
        .eq("user_id", userId);
      if (error) throw error;
      invalidate();
    } finally {
      setIsPending(false);
    }
  }, [activeTimer, invalidate]);

  const stop = useCallback(async () => {
    if (!activeTimer?.task_id) return;
    setIsPending(true);
    try {
      const userId = await requireUserId();
      const at = Date.now();
      await commitSession(activeTimer, at, userId);
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
    } finally {
      setIsPending(false);
    }
  }, [activeTimer, commitSession, invalidate]);

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
