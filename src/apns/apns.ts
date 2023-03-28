const developmentURL = "https://api.sandbox.push.apple.com";
const productionURL = "https://api.push.apple.com";

// const port: number = 443;

const http2 = require('http2');
const jose = require('jose');
const dayjs = require('dayjs');
// const p12 = require('p12-pem');
const forge = require('node-forge');

console.log("Main Utils executed");

const getPrivateKeyFromP12 = async (p12base64, password) => {
    return new Promise((resolve, reject) => {

        try {

            const p12Asn1 = forge.asn1.fromDer(p12base64);
            const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);
            const pemKey = getKeyFromP12(p12, password);
            const { pemCertificate, commonName } = getCertificateFromP12(p12);

            if (pemKey !== null &&
                pemKey !== undefined &&
                pemKey.length > 0) {
                resolve({ pemKey, pemCertificate, commonName })
            } else {
                reject("private key not found")
            }
        } catch (e) {
            reject(e)
        }
    });
}

function getKeyFromP12(p12, password = '') {
        const keyData = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag }, password);
        let pkcs8Key = keyData[forge.pki.oids.pkcs8ShroudedKeyBag][0];

        if (typeof pkcs8Key === 'undefined') {
            pkcs8Key = keyData[forge.pki.oids.keyBag][0];
        }

        if (typeof pkcs8Key === 'undefined') {
            throw new Error('Unable to get private key.');
        }

        let pemKey = forge.pki.privateKeyToPem(pkcs8Key.key);
        pemKey = pemKey.replace(/\r\n/g, '');

        return pemKey;
}

function getCertificateFromP12(p12) {
    const certData = p12.getBags({ bagType: forge.pki.oids.certBag });
    const certificate = certData[forge.pki.oids.certBag][0];
  
    let pemCertificate = forge.pki.certificateToPem(certificate.cert);
    pemCertificate = pemCertificate.replace(/\r\n/g, '');
    const commonName = certificate.cert.subject.attributes[0].value;
    return { pemCertificate, commonName };
  }

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

const sendPushP12 = async (headers, body, deviceToken, isDevelopment, p12base64, password = '') => {

    const baseURL = isDevelopment ? developmentURL : productionURL
    const endPath = `/3/device/${deviceToken}`

    

    const { pemKey, pemCertificate, commonName } = await getPrivateKeyFromP12(p12base64, password)

    const session = http2.connect(baseURL, {
        ca: pemCertificate
    });



    const req = session.request({
        ':path': endPath,
        ':method': 'POST',
        ':scheme': 'https',
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
    sendPush,
    sendPushP12
};
