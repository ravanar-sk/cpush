const { contextBridge, ipcRenderer } = require('electron')

console.log("Preload script executed");

contextBridge.exposeInMainWorld('native_bridge', {
  sendPush: (...args) => {
    return ipcRenderer.invoke('sendPush', ...args)
  }
})