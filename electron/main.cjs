// TodoIng — Electron ana süreç
// Üretimde dağıtılan web adresini yükler (web/PWA ile aynı Supabase → senkron).
// Geliştirmede yerel Vite sunucusunu yükler.
const { app, BrowserWindow, shell } = require("electron");
const path = require("node:path");

// İstersen kendi adresinle değiştir (ör. TODOING_URL ortam değişkeni ile).
const APP_URL = process.env.TODOING_URL || "https://todooing.netlify.app";
const DEV_URL = process.env.TODOING_DEV_URL || "http://localhost:5173";
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 360,
    minHeight: 560,
    backgroundColor: "#0e1018",
    title: "TodoIng",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadURL(isDev ? DEV_URL : APP_URL);

  // Dış bağlantıları sistem tarayıcısında aç (uygulama içinde değil).
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) win.webContents.openDevTools({ mode: "detach" });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
