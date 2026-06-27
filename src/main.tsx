import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/query-client";
import { isSupabaseConfigured } from "@/lib/supabase";
import { ThemeProvider } from "@/app/providers/theme-provider";
import { I18nProvider } from "@/i18n";
import { AuthProvider } from "@/app/providers/auth-provider";
import { TimerProvider } from "@/features/timer/timer-provider";
import { ElectronUpdateProvider } from "@/features/desktop/electron-update";
import { router } from "@/app/router";
import { SetupRequired } from "@/features/auth/setup-required";
import "./index.css";

function Root() {
  if (!isSupabaseConfigured) {
    return (
      <ThemeProvider>
        <I18nProvider>
          <SetupRequired />
          <Toaster position="top-center" richColors />
        </I18nProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <I18nProvider>
        <QueryClientProvider client={queryClient}>
        <ElectronUpdateProvider>
          <AuthProvider>
            <TimerProvider>
              <RouterProvider router={router} />
            </TimerProvider>
          </AuthProvider>
        </ElectronUpdateProvider>
        <Toaster position="top-center" richColors />
      </QueryClientProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
