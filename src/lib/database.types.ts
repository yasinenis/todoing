/**
 * Supabase veritabanı tipleri. supabase/migrations içindeki şema ile eşleşir.
 * Şema değişirse burası da güncellenmeli (veya `supabase gen types` ile üretilebilir).
 */

export type TaskStatus = "todo" | "in_progress" | "done";
export type Priority = "low" | "medium" | "high";
export type GoalTimeframe =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly";
export type GoalStatus = "active" | "completed" | "archived";
export type PlanPeriod = "1d" | "3d" | "1w" | "1m" | "1y";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          theme: string;
          week_starts_on: number;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          theme?: string;
          week_starts_on?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          notes: string | null;
          category_id: string | null;
          goal_id: string | null;
          status: TaskStatus;
          priority: Priority;
          due_date: string | null;
          planned_date: string | null;
          total_seconds: number;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          notes?: string | null;
          category_id?: string | null;
          goal_id?: string | null;
          status?: TaskStatus;
          priority?: Priority;
          due_date?: string | null;
          planned_date?: string | null;
          total_seconds?: number;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
        Relationships: [];
      };
      time_entries: {
        Row: {
          id: string;
          user_id: string;
          task_id: string | null;
          started_at: string;
          ended_at: string;
          duration_seconds: number;
          day: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id?: string | null;
          started_at: string;
          ended_at: string;
          duration_seconds: number;
          day: string;
        };
        Update: Partial<Database["public"]["Tables"]["time_entries"]["Insert"]>;
        Relationships: [];
      };
      timers: {
        Row: {
          id: string;
          user_id: string;
          task_id: string | null;
          running: boolean;
          started_at: string | null;
          accumulated_seconds: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id?: string | null;
          running?: boolean;
          started_at?: string | null;
          accumulated_seconds?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["timers"]["Insert"]>;
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category_id: string | null;
          parent_goal_id: string | null;
          timeframe: GoalTimeframe;
          start_date: string;
          target_date: string;
          progress: number;
          auto_progress: boolean;
          status: GoalStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category_id?: string | null;
          parent_goal_id?: string | null;
          timeframe: GoalTimeframe;
          start_date: string;
          target_date: string;
          progress?: number;
          auto_progress?: boolean;
          status?: GoalStatus;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["goals"]["Insert"]>;
        Relationships: [];
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          target_per_day: number;
          archived: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          target_per_day?: number;
          archived?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["habits"]["Insert"]>;
        Relationships: [];
      };
      habit_logs: {
        Row: {
          id: string;
          user_id: string;
          habit_id: string;
          day: string;
          count: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          habit_id: string;
          day: string;
          count?: number;
        };
        Update: Partial<Database["public"]["Tables"]["habit_logs"]["Insert"]>;
        Relationships: [];
      };
      plans: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          notes: string | null;
          category_id: string | null;
          period: PlanPeriod;
          start_date: string;
          end_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          notes?: string | null;
          category_id?: string | null;
          period: PlanPeriod;
          start_date: string;
          end_date: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["plans"]["Insert"]>;
        Relationships: [];
      };
      day_entries: {
        Row: {
          id: string;
          user_id: string;
          day: string;
          rating: number | null;
          mood: string | null;
          reflection: string | null;
          photo_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          day: string;
          rating?: number | null;
          mood?: string | null;
          reflection?: string | null;
          photo_path?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["day_entries"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

/** Kısa yol satır tipleri. */
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TimeEntry = Database["public"]["Tables"]["time_entries"]["Row"];
export type Timer = Database["public"]["Tables"]["timers"]["Row"];
export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type Habit = Database["public"]["Tables"]["habits"]["Row"];
export type HabitLog = Database["public"]["Tables"]["habit_logs"]["Row"];
export type Plan = Database["public"]["Tables"]["plans"]["Row"];
export type DayEntry = Database["public"]["Tables"]["day_entries"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
