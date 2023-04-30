const {
    app,
    BrowserWindow,
    ipcMain } = require('electron')

const path = require('path')

const apns = require('./src/apns/apns.js');


const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 630,
        minWidth: 800,
        minHeight: 630,
        webPreferences: {
            preload: path.join(__dirname, '/src/preload/home-preload.js'),
        }
    })

    // ipcMain.handle("sendPush", async (event, ...args) => {
    //     const result = await apns.sendPush(args[0], args[1], args[2], args[3], args[4], args[5], args[6])
    //     return result
    // })
    // ipcMain.handle("sendPushP12", async (event, ...args) => {
    //     const result = await apns.sendPushP12(args[0], args[1], args[2], args[3], args[4], args[5])
    //     return result
    // })

    ipcMain.removeHandler("apnsAPI");
    ipcMain.handle("apnsAPI", async (event, ...args) => {
        return apns.apnsAPI(args[0], args[1], args[2], args[3], args[4])
        // const result = await apns.apnsAPI(args[0], args[1], args[2], args[3], args[4])
        // return result
    })

    win.loadFile('./src/ui/home.html')
}

if (require('electron-squirrel-startup')) app.quit();

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})