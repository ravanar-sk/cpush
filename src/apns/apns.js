const developmentURL = "https://api.sandbox.push.apple.com";
const productionURL = "https://api.push.apple.com";

const port = 443;

const http2 = require('http2');
const jose = require('jose');
const dayjs = require('dayjs');
const forge = require('node-forge');

console.log("Main Utils executed");


/**
 * API used to generate Bearer Token for APNS authentication
 * @param {} privateKeyString 
 * @param {*} keyID 
 * @param {*} teamID 
 * @returns 
 */
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

/**
 * API used to generate Key & Certificate to connect to APNS server
 * @param {*} pfx 
 * @param {*} passphrase 
 * @returns 
 */
function convertPFX(pfx, passphrase) {

    let p12buffer = ''

    if (Buffer.isBuffer(pfx)) {
        p12buffer = pfx.toString('base64');
    } else {
        p12buffer = pfx;
    }

    const asn = forge.asn1.fromDer(forge.util.decode64(p12buffer));
    const p12 = forge.pkcs12.pkcs12FromAsn1(asn, true, passphrase);

    const keyData = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag]
        .concat(p12.getBags({ bagType: forge.pki.oids.keyBag })[forge.pki.oids.keyBag]);
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag];

    console.log(keyData);

    const privateKey = keyData[0].key
    // convert a Forge private key to an ASN.1 RSAPrivateKey
    const rsaPrivateKey = forge.pki.privateKeyToAsn1(privateKey);

    // wrap an RSAPrivateKey ASN.1 object in a PKCS#8 ASN.1 PrivateKeyInfo
    const privateKeyInfo = forge.pki.wrapRsaPrivateKey(rsaPrivateKey);

    // convert a PKCS#8 ASN.1 PrivateKeyInfo to PEM
    const pemKey = forge.pki.privateKeyInfoToPem(privateKeyInfo);

    return {
        certificate: forge.pki.certificateToPem(certBags[0].cert),
        key: pemKey
    };
}

const apnsAPI = async (
    isDevelopment = true,
    t_header,
    body,
    deviceToken,
    {
        isP12 = true,
        privateKey,
        keyID,
        teamID,
        buffer,
        password = ''
    }) => {

    return new Promise(async (resolve, reject) => {
        
        const baseURL = isDevelopment ? developmentURL : productionURL
        const endPath = `/3/device/${deviceToken}`

        let headers = {
            ':method': 'POST',
            ':scheme': 'https',
            ':path': endPath,
            ...t_header
        }

        let client = null

        if (isP12) {
            const { key, certificate } = convertPFX(buffer, password);
            client = http2.connect(baseURL, {
                key: key,
                cert: certificate
            });
        } else {
            client = http2.connect(baseURL)
            const authToken = await generateAuthToken(privateKey, keyID, teamID);
            const bearerToken = `bearer ${authToken}`
            headers.authorization = bearerToken
        }

        client.on('error', (err) => {
            reject(err)
            console.error(err)
        });

        const request = client.request(headers);

        request.on('response', (headers, flags) => {
            for (const name in headers) {
                console.log(`${name}: ${headers[name]}`);
            }
        });

        request.setEncoding('utf8');

        let data = ''
        request.on('data', (chunk) => { data += chunk; });
        request.write(JSON.stringify(body))
        request.on('end', () => {
            console.log(`\n${data}`);
            resolve(data);
            client.close();
        });
        request.end();
    });
}


module.exports = {
    apnsAPI
};
