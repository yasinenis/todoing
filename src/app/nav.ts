import {
  LayoutDashboard,
  ListTodo,
  Timer,
  Target,
  Flame,
  CalendarDays,
  Tags,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Mobil alt navigasyonda görünsün mü? */
  primary: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Panel", icon: LayoutDashboard, primary: true },
  { to: "/tasks", label: "Görevler", icon: ListTodo, primary: true },
  { to: "/timer", label: "Sayaç", icon: Timer, primary: false },
  { to: "/goals", label: "Hedefler", icon: Target, primary: true },
  { to: "/habits", label: "Alışkanlıklar", icon: Flame, primary: true },
  { to: "/calendar", label: "Takvim", icon: CalendarDays, primary: true },
  { to: "/categories", label: "Kategoriler", icon: Tags, primary: false },
  { to: "/settings", label: "Ayarlar", icon: Settings, primary: false },
];

export const PRIMARY_NAV = NAV_ITEMS.filter((i) => i.primary);
