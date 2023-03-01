const developmentURL = "https://api.sandbox.push.apple.com";
const productionURL = "https://api.push.apple.com";

// const port: number = 443;

const http2 = require('http2')
const axios = require('axios');
const jose = require('jose');
const dayjs = require('dayjs');

console.log("Main Utils executed");

const generateAuthToken = async (privateKeyString, keyID, teamID) => {
    const privateKey = await jose.importPKCS8(privateKeyString, "ES256")
    const headers = {
        "alg": "ES256",
        "kid": keyID
    }
    const currentTime = dayjs()
    // const currentTimePlus1Hour = currentTime.add(1, 'hour').unix()
    const currentTimePlus1Hour = currentTime.unix()
    console.log(`currentTimePlus1Hour :: ${currentTimePlus1Hour}`)
    const claims = {
        "iss": teamID,
        "iat": currentTimePlus1Hour
    }
    const jwt = await new jose.SignJWT(claims).setProtectedHeader(headers).sign(privateKey);
    return Promise.resolve(jwt)
}

const sendPush = async (headers, body, deviceToken, isDevelopment, privateKey, keyID, teamID) => {

    const baseURL = isDevelopment ? developmentURL : productionURL
    const endPath = `/3/device/${deviceToken}`

    const session = http2.connect(baseURL)

    const authToken = await generateAuthToken(privateKey, keyID, teamID);
    const bearerToken = `bearer ${authToken}`

    const req = session.request({
        ':path': endPath,
        ':method': 'POST',
        ':scheme': 'https',
        'authorization': bearerToken,
        ...headers
    })

    req.write(JSON.stringify(body), 'utf8')

    req.end()

    req.on('response', (headers) => {
        // we can log each response header here
        for (const name in headers) {
            console.log(`${name}: ${headers[name]}`)
        }
    })

    req.setEncoding('utf8')
    let data = ''


    req.on('data', (chunk) => { data += chunk })

    req.on('end', () => {
        console.log(`\ndata : ${data}`)
        // In this case, we don't want to make any more
        // requests, so we can close the session
        session.close()
    })

    // If there is any error in connecting, log it to the console
    session.on('error', (err) => console.error(err))
}

module.exports = {
    sendPush
};
