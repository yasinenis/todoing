// TodoIng — Electron ana süreç
// Üretimde dağıtılan web adresini yükler (web/PWA ile aynı Supabase → senkron).
// Geliştirmede yerel Vite sunucusunu yükler.
// electron-updater ile GitHub Releases'ten otomatik güncelleme yapar.
const { app, BrowserWindow, shell, ipcMain } = require("electron");
const path = require("node:path");
const { autoUpdater } = require("electron-updater");

const APP_URL = process.env.TODOING_URL || "https://todooing.netlify.app";
const DEV_URL = process.env.TODOING_DEV_URL || "http://localhost:5173";
const RELEASES_PAGE = "https://github.com/yasinenis/todoing/releases/latest";
const isDev = !app.isPackaged;

function setupUpdater(win) {
  if (isDev) return; // dev'de güncelleme denetimi yapma
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  const send = (channel, data) => {
    if (win && !win.isDestroyed()) win.webContents.send(channel, data);
  };

  autoUpdater.on("update-available", (info) =>
    send("update:available", { version: info.version }),
  );
  autoUpdater.on("download-progress", (p) =>
    send("update:progress", { percent: Math.round(p.percent) }),
  );
  autoUpdater.on("update-downloaded", (info) =>
    send("update:downloaded", { version: info.version }),
  );
  autoUpdater.on("error", (err) =>
    send("update:error", { message: String((err && err.message) || err) }),
  );

  // İlk kontrol (kısa gecikme) + saatlik periyodik kontrol.
  setTimeout(() => autoUpdater.checkForUpdates().catch(() => {}), 4000);
  setInterval(
    () => autoUpdater.checkForUpdates().catch(() => {}),
    60 * 60 * 1000,
  );
}

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

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) win.webContents.openDevTools({ mode: "detach" });

  setupUpdater(win);
}

// IPC: renderer (web uygulaması) ↔ güncelleyici
ipcMain.handle("update:check", async () => {
  if (isDev) return { ok: false, error: "dev" };
  try {
    const r = await autoUpdater.checkForUpdates();
    return { ok: true, version: r && r.updateInfo ? r.updateInfo.version : null };
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) };
  }
});
ipcMain.handle("update:install", () => {
  try {
    autoUpdater.quitAndInstall();
  } catch {
    shell.openExternal(RELEASES_PAGE);
  }
});
ipcMain.handle("update:openReleases", () => shell.openExternal(RELEASES_PAGE));

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
