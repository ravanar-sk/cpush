const { contextBridge, ipcRenderer } = require('electron')

console.log("Preload script executed");

contextBridge.exposeInMainWorld('native_bridge', {

  getBearerToken: (...args) => {
    return ipcRenderer.invoke('getBearerToken', ...args)
  }
  // we can also expose variables, not just functions
})