import {
  LayoutDashboard,
  ListTodo,
  Timer,
  Target,
  Flame,
  CalendarDays,
  Trophy,
  Tags,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  /** i18n anahtarı (ör. "nav.dashboard"); render'da t() ile çözülür. */
  label: string;
  icon: LucideIcon;
  /** Mobil alt navigasyonda görünsün mü? */
  primary: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "nav.dashboard", icon: LayoutDashboard, primary: true },
  { to: "/tasks", label: "nav.tasks", icon: ListTodo, primary: true },
  { to: "/timer", label: "nav.timer", icon: Timer, primary: false },
  { to: "/goals", label: "nav.goals", icon: Target, primary: true },
  { to: "/habits", label: "nav.habits", icon: Flame, primary: true },
  { to: "/calendar", label: "nav.calendar", icon: CalendarDays, primary: true },
  {
    to: "/leaderboard",
    label: "nav.leaderboard",
    icon: Trophy,
    primary: false,
  },
  { to: "/categories", label: "nav.categories", icon: Tags, primary: false },
  { to: "/settings", label: "nav.settings", icon: Settings, primary: false },
];

export const PRIMARY_NAV = NAV_ITEMS.filter((i) => i.primary);
