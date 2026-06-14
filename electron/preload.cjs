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
