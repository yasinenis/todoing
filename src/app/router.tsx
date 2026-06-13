import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "./protected-route";
import { LoginPage } from "@/features/auth/login-page";

// Korumalı sayfalar tembel yüklenir (başlangıç paketi küçük kalsın).
const DashboardPage = lazy(() =>
  import("@/features/dashboard/dashboard-page").then((m) => ({
    default: m.DashboardPage,
  })),
);
const TasksPage = lazy(() =>
  import("@/features/tasks/tasks-page").then((m) => ({ default: m.TasksPage })),
);
const TimerPage = lazy(() =>
  import("@/features/timer/timer-page").then((m) => ({ default: m.TimerPage })),
);
const GoalsPage = lazy(() =>
  import("@/features/goals/goals-page").then((m) => ({ default: m.GoalsPage })),
);
const HabitsPage = lazy(() =>
  import("@/features/habits/habits-page").then((m) => ({
    default: m.HabitsPage,
  })),
);
const CalendarPage = lazy(() =>
  import("@/features/calendar/calendar-page").then((m) => ({
    default: m.CalendarPage,
  })),
);
const CategoriesPage = lazy(() =>
  import("@/features/categories/categories-page").then((m) => ({
    default: m.CategoriesPage,
  })),
);
const SettingsPage = lazy(() =>
  import("@/features/settings/settings-page").then((m) => ({
    default: m.SettingsPage,
  })),
);

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/tasks", element: <TasksPage /> },
          { path: "/timer", element: <TimerPage /> },
          { path: "/goals", element: <GoalsPage /> },
          { path: "/habits", element: <HabitsPage /> },
          { path: "/calendar", element: <CalendarPage /> },
          { path: "/categories", element: <CategoriesPage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
