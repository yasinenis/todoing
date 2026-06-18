import type { CapacitorConfig } from "@capacitor/cli";

// Android (Capacitor) yapılandırması.
// server.url ile canlı site yüklenir → web/masaüstü ile aynı Supabase, otomatik
// senkron ve içerik güncellemeleri Netlify'dan (APK'yı sık yeniden üretme derdi yok).
const config: CapacitorConfig = {
  appId: "app.todooing.mobile",
  appName: "TodoIng",
  webDir: "dist",
  server: {
    url: "https://todooing.netlify.app",
    cleartext: false,
  },
};

export default config;
