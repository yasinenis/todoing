import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      // Başka cihazda yapılan değişiklikler, sekmeye/uygulamaya dönünce
      // (odaklanınca) otomatik tazelensin — manuel yenileme gerekmesin.
      refetchOnWindowFocus: true,
    },
  },
});
