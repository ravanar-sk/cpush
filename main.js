const {
    app,
    BrowserWindow,
    ipcMain } = require('electron/main')

const path = require('path')

const apns = require('./src/apns/apns.js');
const fcm = require('./src/fcm/fcm.js');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 800,
        minWidth: 800,
        minHeight: 630,
        webPreferences: {
            preload: path.join(__dirname, '/src/preload/home-preload.js'),
            // devTools: false
        }
    })

    

    win.loadFile('./src/ui/home.html')
}

if (require('electron-squirrel-startup')) app.quit();

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    // ipcMain.removeHandler("apnsAPI");
    ipcMain.handle("apnsAPI", async (event, ...args) => {
        return apns.apnsAPI(args[0], args[1], args[2], args[3], args[4])
    })

    // ipcMain.removeHandler("fcmAPI");
    ipcMain.handle("fcmAPI", async (event, ...args) => {
        return fcm.fcmAPI(args[0], false, args[1], args[2])
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})