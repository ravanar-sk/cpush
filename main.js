const {
    app,
    BrowserWindow,
    ipcMain } = require('electron')

const path = require('path')

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, '/src/preload/home-preload.js'),
        }
    })

    ipcMain.handle("getBearerToken", async (event, ...args) => {
        console.log("Code_45")
        const result = await bearerToken(args[0], args[1], args[2]);
        // return Promise.resolve("ABCDEFGH")
        return result
    })

    // win.loadFile('index.html')
    win.loadFile('./src/ui/home.html')
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// console.log("Main.js executed");


const jose = require("jose");
const dayjs = require('dayjs');

console.log("Main Utils executed");

const bearerToken = async (privateKeyString, keyID, teamID) => {
    // const header
    console.log("bearerToken_begin")
    // const keyID = $("idKeyID").val()
    // const teamID = $("idTeamID").val()

    const privateKey = await jose.importPKCS8(privateKeyString, "ES256")

    const headers = {
        "alg": "ES256",
        "kid": keyID
    }

    const currentTime = dayjs()
    const currentTimePlus1Hour = currentTime.add(1, 'hour').unix()

    const claims = {
        "iss": teamID,
        "iat": currentTimePlus1Hour
    }

    // const privateKey = await getPrivateKey()

    const jwt = await new jose.SignJWT(claims).setProtectedHeader(headers).sign(privateKey);

    console.log(jwt)
    // alert(jwt);
    return Promise.resolve(jwt)


    // console.log()

}