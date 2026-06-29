// Güvenli köprü (contextIsolation). Web uygulamasına güncelleme API'si sunar.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronUpdater", {
  isElectron: true,
  onAvailable: (cb) =>
    ipcRenderer.on("update:available", (_e, d) => cb(d)),
  onProgress: (cb) =>
    ipcRenderer.on("update:progress", (_e, d) => cb(d)),
  onDownloaded: (cb) =>
    ipcRenderer.on("update:downloaded", (_e, d) => cb(d)),
  onError: (cb) => ipcRenderer.on("update:error", (_e, d) => cb(d)),
  check: () => ipcRenderer.invoke("update:check"),
  install: () => ipcRenderer.invoke("update:install"),
  openReleases: () => ipcRenderer.invoke("update:openReleases"),
});

// Mini sayaç popup'ı köprüsü (ana renderer → main).
contextBridge.exposeInMainWorld("miniTimer", {
  isElectron: true,
  // Sayaç durumunu (çalışıyor mu + gösterilecek etiket) gönder.
  update: (state) => ipcRenderer.invoke("mini:update", state),
  // Sayaç var/yok (yoksa popup hiç çıkmaz).
  setActive: (active) => ipcRenderer.invoke("mini:setActive", active),
  // Popup'tan gelen komutlar (pause/resume/stop).
  onCommand: (cb) => ipcRenderer.on("mini:command", (_e, a) => cb(a)),
});
