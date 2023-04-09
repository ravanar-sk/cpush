const developmentURL = "https://api.sandbox.push.apple.com";
const productionURL = "https://api.push.apple.com";

const port = 443;

const http2 = require('http2');
const jose = require('jose');
const dayjs = require('dayjs');
// const p12 = require('p12-pem');
const forge = require('node-forge');

const tls = require('tls')
const fs = require('fs')

const https = require('node:https')

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


const sendPushP12_OLD = async (headers, body, deviceToken, isDevelopment, p12base64, password = '') => {

    const baseURL = isDevelopment ? developmentURL : productionURL
    const endPath = `/3/device/${deviceToken}`



    const { pemKey, pemCertificate, commonName } = await getPrivateKeyFromP12(p12base64, password)

    console.log(`
pemKey : ${pemKey}
pemCertificate : ${pemCertificate}
commonName : ${commonName}
`)

    const session = http2.connect(baseURL, {
        key: pemKey,
        cert: pemCertificate,
        ca: pemCertificate
    });



    const req = session.request({
        ':path': endPath,
        ':method': 'POST',
        ':scheme': 'https',
        ...headers
    })



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

    req.write(JSON.stringify(body), 'utf8')

    req.end()

}

const sendPushP12 = async (headers, body, deviceToken, isDevelopment, p12base64, password = '') => {

    const baseURL = isDevelopment ? developmentURL : productionURL
    const endPath = `/3/device/${deviceToken}`

    const { pemKey, pemCertificate, commonName } = await getPrivateKeyFromP12(p12base64, password)

    console.log(`
pemKey : ${pemKey}
pemCertificate : ${pemCertificate}
commonName : ${commonName}
`)

    // let options = {
    //     port: port,
    //     host: developmentURL,
    //     method: 'CONNECT',
    //     path: `${developmentURL}:${port}`,
    // };
    // const keepAliveAgent = new http.Agent({
    //     keepAlive: true,
    //     pfx: p12base64,
    //     passphrase: password
    // });
    // options.agent = keepAliveAgent;

    // const req = http.request(options)


    const aKey = `-----BEGIN PRIVATE KEY-----MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCt8ITMscfXi5I9qWcNpJlzcoWAXe3ovg/uY/9GXZIluXgnEmMK16zrf1gNXBCE0xTGUfsqLPPJza5PfYF6cJVCpFzI7AsOQxKD73zJGBEwY+NsT61Jql8T8BiTBGTozprJoKlz0mMWU28Jg81hooZM3LepoKISr8ut2E1owDT2v7fxessotCwIiOPhQ5M6uCGvb1TDYBuxTU7YbgDLI6/Rp00gNUhFAdh5LaUTGrcOMVDGVuBgsVrUpQEZYs+hLcFoh5NVCJ7kEncubBnCQLy9AfE2cdOIfT9zT8JvDzT9uDdkfsDXiR4a4BELBbj1oNd12dpW0brNfS9olHh+YlEjAgMBAAECggEAe1ZMZHU/lojCdvTTPSpVITa4kXCJTXrQAyNnFPcutY9RMqtoDX0ngYm33ylEEVs3pPTm214qtBMjofwFvtNsE2hG3rX5lPBcha9g1Zs6PQzna5sH7m9fodyjIESCZU5zFbvVzGoHlwIsfxu1m6DKCGCN3zsnEYcULz5sjXWVWM0nfsiFJE7zDYeAt7brF0fYrQ9H3/yR8wPukfx0dkrYqfJK88uEaAN45w3lu+68y2EO0y8YiEYoQlxyGM6PeP4rRoxv0G1N6EDdgpPyTn/A9Jj3Cb7XcJJSdNo/oV4pC1NkU4MihVrqC2hiFOJ9mkZwOQqChUVygObkPC5VB89kUQKBgQDgxb1vJ+XpUqfIfZb+Ciz3zFCpv3qGaL0bunqKuAvt86Vryp5h7HdWQ0m39egv76p2whJiAscHKek4NKpSJVMHO1L6OIGUVCBuU4xdUjybOYQz4IZGRgY/wIZZJLSh9lJD+QecbhGJ7PVqFNd6WpsQRN0VZRNn9uzJrMMRzqbNewKBgQDGGtrnT5kFfQfkpxDBjna0Qg8UFVRqT73uPDoxIK/Vc8JWLP4P7GdbfHWV/NScDVWmu9rKxw1/ZgYUXket3sL3XVDEpfjCAK3Uz4/WP9jEv7KJvd8/5ajBFvuPlCxMTHASjPTY/l+XXJclnP7ONH4JyOTznb1gl3sAG1DL9xX2eQKBgHEfM6p4ov4dSjHd+xrZVi5UFpiHtItmtR36aOfdnqtf/vXT4IgZ8Slp7fT2fqd5cAoavBO1oCMb1bMi1kFHZZTzJ1ylCZn0COpdg/wHglcAyGcvbYR6g3ScWUEN9xa4GEj7UPhKcOtAZXbBDH0YkofKkJXO68hb/mm1V+tjXJF3AoGBAKCB47ikUlwTCJEnFzlr3xt/pk3kVkfoof9jRtbFIBH2v48o1xQ5uyhxt6e1eOGTIEF+VPAUxQfitqxMExF5ukfHkIgz3U/6Ut1o6qZxhoUquFJHx5kyzz7bCykyqY2MJQWytTMXLoYpm8D66axS9YeiAHat6GFZemwEtbr8UAwpAoGALwdt6OJDhOzscq0GpzslXqtARh3SCCyIG5+oFjCX2Bjo2qCC4/2Ni0u1Wr+wQPk1PnsZAqTJRqCQBFz24gmKOpkW5LFb6mJzD1YNoWKfIAFLpmc+Y6506/h7RFBcqpkoQ7nlJa4t9f2NwjwUsJTduk5cNeUSWk/EHl9+AEmCNPg=-----END PRIVATE KEY-----`

    const aCert = `-----BEGIN CERTIFICATE-----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-----END CERTIFICATE-----`



    const postData = JSON.stringify(body);

    const options = {
        hostname: baseURL,
        port: port,
        path: endPath,
        method: 'POST',
        headers: {
            ...headers
            // 'Content-Type': 'application/json',
            // 'Content-Length': Buffer.byteLength(postData)
        },
        agent: new https.Agent({
            keepAlive: true,
            key:aKey,
            cert:aCert,
            // ca:pemCertificate,
            // pfx: p12base64,
            // passphrase: password
        })
    };

    // console.log("ASDD :: " + JSON.stringify(options));

    const req = https.request(`${baseURL}${endPath}`, options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
            console.log('No more data in response.');
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    // Write data to request body
    req.write(postData);
    req.end();

}




module.exports = {
    sendPush,
    sendPushP12
};
