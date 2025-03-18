const fcmSCOPE = "https://www.googleapis.com/auth/firebase.messaging"
const googleFCMURL = (projectID) => `https://fcm.googleapis.com/v1/projects/${projectID}/messages:send`

const google = require("google-auth-library");



async function getFCMAccessToken(sericeKEY) {
    return new Promise(function (resolve, reject) {
        const jwtClient = new google.JWT(
            sericeKEY.client_email,
            null,
            sericeKEY.private_key,
            [fcmSCOPE],
            null,
        );
        jwtClient.authorize(function (err, tokens) {
            if (err) {
                reject(err);
                return;
            }
            console.log(JSON.stringify(tokens));
            resolve(tokens.access_token);
        });
    });
}




const fcmAPI = async (serviceKEY, isDev /* false */, tokenOrTopic, payload) => {

    return new Promise(async (resolve, reject) => {

        console.log(`
        serviceKEY : ${serviceKEY}
        isDev : ${isDev}
        tokenOrTopic : ${tokenOrTopic}
        payload : ${payload}
        `);

        let fcmBody = {...payload, ...tokenOrTopic}

        const payloadKeys = Object.keys(payload);
        for (const key in payloadKeys) {
            fcmBody[`${key}`] = payload[`${key}`]
        }

        const topicOrDeviceKeys = Object.keys(tokenOrTopic);
        for (const key in topicOrDeviceKeys) {
            fcmBody[`${key}`] = tokenOrTopic[`${key}`]
        }

        const accessToken = await getFCMAccessToken(serviceKEY)

        console.log(`
        accessToken : ${accessToken}
        `);


        let request = require('request');

        request.post(`https://fcm.googleapis.com/v1/projects/${serviceKEY.project_id}/messages:send`, {
            body: JSON.stringify({
                "validate_only": isDev,
                "message": fcmBody
            }),
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            }
        }, (error, response, body) => {
            console.log(`****************************************`);
            console.log(`****************************************`);
            console.log(`****************************************`);
            console.log(`
            error : ${error}
            response : ${JSON.stringify(response)}
            body : ${body}
            `)

            const bodyObject = JSON.parse(body)

            let responseObject = {
                status: false,
                message: "",
                fcm_error: "",
                error_code: -1
            }

            if (bodyObject !== null && bodyObject !== undefined) {

                if (bodyObject.error !== null && bodyObject.error !== undefined) { // Error Block
                    const errorCode = bodyObject.error.code
                    const errorMessage = bodyObject.error.message
                    const errorStatus = bodyObject.error.status

                    responseObject.status = false
                    responseObject.message = errorMessage
                    responseObject.fcm_error = errorStatus
                    responseObject.error_code = errorCode
                } else { // Success Block
                    responseObject.status = true
                    responseObject.message = "Push sent successfully"
                    responseObject.fcm_error = ""
                    responseObject.error_code = ""
                }
            }
            resolve(responseObject)
        })
    });
}

module.exports = {
    fcmAPI
};


