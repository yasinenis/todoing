// Mini sayaç popup'ı köprüsü (popup penceresi ↔ main).
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("mini", {
  // Ana renderer'dan gelen güncel durum: { running, label }.
  onState: (cb) => ipcRenderer.on("mini:state", (_e, s) => cb(s)),
  // Popup butonları → main → ana renderer.
  command: (action) => ipcRenderer.send("mini:command", action),
  // Popup'a tıklayınca uygulamayı öne getir.
  focusApp: () => ipcRenderer.send("mini:focusApp"),
  // "Gizle" → popup'ı ertele.
  hide: () => ipcRenderer.send("mini:hide"),
});
