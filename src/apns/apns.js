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
 * @param {*} buffer 
 * @param {*} passphrase 
 * @returns 
 */
function convertPFX(buffer, passphrase) {
    try {

        const p12Asn1 = forge.asn1.fromDer(buffer);
        // decrypt p12 using the password 'password'
        let p12 = null;

        if (passphrase.length > 0) {
            p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, passphrase);
        } else {
            p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1);
        }
        
        // get bags by type
        const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
        const pkeyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
        // fetching certBag
        const certBag = certBags[forge.pki.oids.certBag][0];
        // fetching keyBag
        const keybag = pkeyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
        // generate pem from private key
        const privateKeyPem = forge.pki.privateKeyToPem(keybag.key);
        // generate pem from cert
        const certificate = forge.pki.certificateToPem(certBag.cert);

        return {
            certificate: certificate,
            key: privateKeyPem
        };

        // let p12buffer = ''

        // if (Buffer.isBuffer(pfx)) {
        //     p12buffer = pfx.toString('base64');
        // } else {
        //     p12buffer = pfx;
        // }
        // const p12Der = forge.util.decode64(p12buffer)
        // const asn = forge.asn1.fromDer(p12Der,{parseAllBytes: false});
        // const p12 = forge.pkcs12.pkcs12FromAsn1(asn, false, passphrase);

        // const keyData = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag]
        //     .concat(p12.getBags({ bagType: forge.pki.oids.keyBag })[forge.pki.oids.keyBag]);
        // const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag];

        // console.log(keyData);

        // const privateKey = keyData[0].key
        // // convert a Forge private key to an ASN.1 RSAPrivateKey
        // const rsaPrivateKey = forge.pki.privateKeyToAsn1(privateKey);

        // // wrap an RSAPrivateKey ASN.1 object in a PKCS#8 ASN.1 PrivateKeyInfo
        // const privateKeyInfo = forge.pki.wrapRsaPrivateKey(rsaPrivateKey);

        // // convert a PKCS#8 ASN.1 PrivateKeyInfo to PEM
        // const pemKey = forge.pki.privateKeyInfoToPem(privateKeyInfo);

        // return {
        //     certificate: forge.pki.certificateToPem(certBags[0].cert),
        //     key: pemKey
        // };
    }
    catch (e) {
        console.log(e);
    }
}

/**
 * API used to generate Key & Certificate to connect to APNS server
 * @param {*} pfx 
 * @param {*} passphrase 
 * @returns 
 */
function convertPFX_OLD(pfx, passphrase) {
    try {

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
    catch (e) {
        console.log(e);
    }
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

    console.log(`
isDevelopment : ${isDevelopment}
t_header : ${JSON.stringify(t_header)}
body : ${JSON.stringify(body)}
deviceToken : ${deviceToken}
isP12 : ${isP12}
privateKey : ${privateKey}
keyID : ${keyID}
teamID : ${teamID}
buffer : ${buffer}
password : ${password}
`)
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

        console.log(`
        baseURL : ${baseURL}
        endPath : ${endPath}
        headers : ${JSON.stringify(headers)}
        `)

        if (isP12) {
            const { key, certificate } = convertPFX(buffer, password);
            client = http2.connect(baseURL, {
                key: key,
                cert: certificate
            });
        } else {
            client = http2.connect(baseURL)
            const authToken = await generateAuthToken(privateKey, keyID, teamID);
            console.log(`authToken : ${authToken}`);
            const bearerToken = `Bearer ${authToken}`
            headers.Authorization = bearerToken
        }

        client.on('error', (err) => {
            reject(err)
            console.error(err)
        });

        const request = client.request(headers);

        request.setEncoding('utf8');

        request.on('response', (headers, flags) => {

            console.log(`RESPONSE : ${JSON.stringify(headers)}`)
            // for (const name in headers) {
            //     console.log(`${name}: ${headers[name]}`);
            // }
        });

        let data = ''
        request.on('data', (chunk) => { 
            console.log('DATA : ')
            data += chunk; 
        });

        request.on('end', () => {
            console.log(`\n END : ${data}`);
            resolve(data);
            client.close();
        });

        request.write(JSON.stringify(body))
        request.end();
    });
}


module.exports = {
    apnsAPI
};
