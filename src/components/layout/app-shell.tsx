import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { Topbar } from "./topbar";
import { TimerWidget } from "@/features/timer/timer-widget";

export function AppShell() {
  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-4 pb-24 md:px-8 md:py-6 md:pb-8">
          <div className="mx-auto w-full max-w-6xl animate-fade-in">
            <Suspense
              fallback={
                <div className="flex justify-center py-24">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
      <TimerWidget />
      <BottomNav />
    </div>
  );
}
