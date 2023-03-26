const { contextBridge, ipcRenderer } = require('electron')

console.log("Preload script executed");

contextBridge.exposeInMainWorld('native_bridge', {
  sendPush: (...args) => {
    return ipcRenderer.invoke('sendPush', ...args)
  },
  getPrivateKeyFromP12: (...args) => {
    return ipcRenderer.invoke('getPrivateKeyFromP12', ...args)
  }
});