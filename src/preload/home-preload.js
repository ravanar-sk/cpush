const { contextBridge, ipcRenderer } = require('electron')

console.log("Preload script executed");

contextBridge.exposeInMainWorld('native_bridge', {
  sendPush: (...args) => {
    return ipcRenderer.invoke('sendPush', ...args)
  },
  sendPushP12: (...args) => {
    return ipcRenderer.invoke('sendPushP12', ...args)
  }
});