// TodoIng — Electron ana süreç
// Üretimde dağıtılan web adresini yükler (web/PWA ile aynı Supabase → senkron).
// Geliştirmede yerel Vite sunucusunu yükler.
// electron-updater ile GitHub Releases'ten otomatik güncelleme yapar.
const { app, BrowserWindow, screen, shell, ipcMain, powerMonitor } =
  require("electron");
const path = require("node:path");
const { autoUpdater } = require("electron-updater");

const APP_URL = process.env.TODOING_URL || "https://todooing.netlify.app";
const DEV_URL = process.env.TODOING_DEV_URL || "http://localhost:5173";
const RELEASES_PAGE = "https://github.com/yasinenis/todoing/releases/latest";
const isDev = !app.isPackaged;

// ---- Mini sayaç popup'ı (arka plana atınca sağ altta, hep üstte) ----
const MINI_W = 190;
const MINI_H = 76;
let mainWin = null;
let miniWin = null;
// Sayaç aktif mi + son ham durum (renderer'dan gelir). Popup zamanı kendi sayar.
let miniActive = false;
let miniState = {
  running: false,
  startedAtMs: null,
  accumulatedSeconds: 0,
  blockSeconds: null,
  label: "",
};
// "Gizle" ile ertelendi mi? Uygulamaya odaklanınca / yeni sayaçta sıfırlanır.
let miniSnoozed = false;

function positionMini() {
  if (!miniWin || miniWin.isDestroyed()) return;
  const { workArea } = screen.getPrimaryDisplay();
  const margin = 12;
  const x = workArea.x + workArea.width - MINI_W - margin;
  const y = workArea.y + workArea.height - MINI_H - margin;
  miniWin.setBounds({ x, y, width: MINI_W, height: MINI_H });
}

function ensureMini() {
  if (miniWin && !miniWin.isDestroyed()) return miniWin;
  miniWin = new BrowserWindow({
    width: MINI_W,
    height: MINI_H,
    show: false,
    frame: false,
    resizable: false,
    movable: true,
    minimizable: false,
    maximizable: false,
    skipTaskbar: true,
    fullscreenable: false,
    alwaysOnTop: true,
    transparent: true, // oval kenarların görünmesi için saydam pencere
    backgroundColor: "#00000000",
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, "mini-preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  // Tam ekran/oyun dahil her şeyin önünde ve tüm masaüstlerinde kalsın.
  pinMini();
  // Bazı masaüstleri (GNOME/Ubuntu) "tüm workspace'ler" bayrağını pencere
  // gösterilince düşürür; her gösterimde yeniden uygula.
  miniWin.on("show", pinMini);
  miniWin.loadFile(path.join(__dirname, "mini.html"));
  // Yüklenince mevcut durumu gönder.
  miniWin.webContents.on("did-finish-load", () => {
    if (miniWin && !miniWin.isDestroyed()) {
      miniWin.webContents.send("mini:state", miniState);
    }
  });
  return miniWin;
}

/** Popup'ı en üste + tüm workspace'lere sabitle (yeniden uygulanabilir). */
function pinMini() {
  if (!miniWin || miniWin.isDestroyed()) return;
  miniWin.setAlwaysOnTop(true, "screen-saver");
  miniWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
}

function showMini() {
  if (!miniActive || miniSnoozed) return;
  ensureMini();
  positionMini();
  miniWin.webContents.send("mini:state", miniState);
  miniWin.showInactive(); // odağı çalmadan göster
  pinMini(); // gösterimden sonra yeniden sabitle (Ubuntu için)
}

function hideMini() {
  if (miniWin && !miniWin.isDestroyed() && miniWin.isVisible()) miniWin.hide();
}

/** Popup'a tıklayınca ana pencereyi geri getir ve öne al. */
function restoreMain() {
  if (!mainWin || mainWin.isDestroyed()) return;
  miniSnoozed = false; // uygulamaya dönüldü → erteleme bitti
  if (mainWin.isMinimized()) mainWin.restore();
  mainWin.show();
  mainWin.focus();
  hideMini();
}

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
      // Arka plandayken sayaç tiki/zamanlayıcılar kısılmasın (popup donmasın).
      backgroundThrottling: false,
    },
  });
  mainWin = win;

  win.loadURL(isDev ? DEV_URL : APP_URL);

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Arka plana atılınca (blur/minimize/hide) mini popup; öne gelince gizle.
  // Öne gelmek erteleme bayrağını da sıfırlar (bir sonraki arka planda tekrar çıkar).
  const onForeground = () => {
    miniSnoozed = false;
    hideMini();
  };
  win.on("blur", showMini);
  win.on("minimize", showMini);
  win.on("hide", showMini);
  win.on("focus", onForeground);
  win.on("restore", onForeground);
  win.on("show", onForeground);

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

// IPC: mini sayaç popup'ı
// Ana renderer durumu gönderir; main popup'a iletir. Ham veri varsa popup kendi
// sayar; yoksa (eski renderer) yalnızca `label` taşınır.
ipcMain.handle("mini:update", (_e, s) => {
  const hasRaw = typeof s?.accumulatedSeconds === "number";
  miniState = {
    running: !!s?.running,
    startedAtMs: typeof s?.startedAtMs === "number" ? s.startedAtMs : null,
    accumulatedSeconds: hasRaw ? s.accumulatedSeconds : undefined,
    blockSeconds: typeof s?.blockSeconds === "number" ? s.blockSeconds : null,
    label: typeof s?.label === "string" ? s.label : undefined,
  };
  if (miniWin && !miniWin.isDestroyed() && miniWin.isVisible()) {
    miniWin.webContents.send("mini:state", miniState);
  }
});
// Sayaç var/yok. Pasifse popup'ı gizle; yeni sayaç başlayınca ertelemeyi sıfırla.
ipcMain.handle("mini:setActive", (_e, active) => {
  const next = !!active;
  if (next && !miniActive) miniSnoozed = false; // yeni oturum = temiz başlangıç
  miniActive = next;
  if (!miniActive) hideMini();
  else if (mainWin && !mainWin.isDestroyed() && !mainWin.isFocused()) showMini();
});
// Popup butonları → ana renderer'a komut ilet.
ipcMain.on("mini:command", (_e, action) => {
  if (mainWin && !mainWin.isDestroyed()) {
    mainWin.webContents.send("mini:command", action);
  }
});
// Popup'a tıklayınca uygulamayı öne getir.
ipcMain.on("mini:focusApp", () => restoreMain());
// "Gizle" → popup'ı ertele (uygulamaya dönüp tekrar arka plana atana kadar).
ipcMain.on("mini:hide", () => {
  miniSnoozed = true;
  hideMini();
});

app.whenReady().then(() => {
  createWindow();

  // Ekran kilitlenince (Windows: Win+L, macOS: kilit) çalışan sayacı duraklat.
  // Mevcut komut kanalını kullanır; renderer'daki pause() zaten "çalışmıyorsa
  // yok say" güvenliğine sahip.
  powerMonitor.on("lock-screen", () => {
    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.webContents.send("mini:command", "pause");
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
