const { contextBridge, ipcRenderer } = require('electron')

console.log("Preload script executed");

contextBridge.exposeInMainWorld('native_bridge', {
  apnsAPI: (...args) => {
    return ipcRenderer.invoke('apnsAPI', ...args)
  },
  fcmAPI: (...args) => {
    return ipcRenderer.invoke('fcmAPI', ...args)
  }
});