import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/query-client";
import { isSupabaseConfigured } from "@/lib/supabase";
import { ThemeProvider } from "@/app/providers/theme-provider";
import { AuthProvider } from "@/app/providers/auth-provider";
import { TimerProvider } from "@/features/timer/timer-provider";
import { router } from "@/app/router";
import { SetupRequired } from "@/features/auth/setup-required";
import "./index.css";

function Root() {
  if (!isSupabaseConfigured) {
    return (
      <ThemeProvider>
        <SetupRequired />
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TimerProvider>
            <RouterProvider router={router} />
          </TimerProvider>
        </AuthProvider>
        <Toaster position="top-center" richColors />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
