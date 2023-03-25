// import jose from 'jose';
// const jose = require("jose");
// import DateTime from "luxon"
// const { DateTime } = require("luxon");
// import dayjs from 'dayjs';
// const dayjs = require('dayjs');

// const developmentURL = "https://api.sandbox.push.apple.com/";
// const productionURL = "https://api.push.apple.com/";

// const port = 443;


/**
 * 
 */
$('#txt_payload').on('input', function (e) {
    buildPayload();
});

/**
 * 
 */

$('#btn_send_push').on('click', function () {
    // readFile()
    // sendAPNSPush();
});

$('#idIsJSON').on('click', function () {

    if ($("#idIsJSON").is(":checked")) {

        console.log('Checked');
        const dummyJSON = { "aps": { "alert": "Hello world!" } }

        $("#txt_payload").val(JSON.stringify(dummyJSON));
    } else {

        console.log('Un checked');

        $("#txt_payload").val("Hello world!");
        // $("#txt_payload").text("Hello world!");
    }
});

$('#btnP8').on('click', function() {
    $('#auth_cert_password_container').attr("hidden", true);
    $('#auth_cert_file').attr("accept", ".p8");
});

$('#btnP12').on('click', function() {
    $('#auth_cert_password_container').attr("hidden", false);
    $('#auth_cert_file').attr("accept", ".p12");
});

const buildPayload = () => {
    const payload = {
        "aps": {
            "alert": $('#txt_payload').val()
        }
    };

    const payloadString = JSON.stringify(payload, null, 2);
    console.log(payloadString);
    $('#lbl_json_preview').text(payloadString);
}

const getPrivateKey = () => {
    return new Promise((resolve, reject) => {
        var file = document.getElementById("auth_cert_file").files[0];
        if (file) {
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                // $('#txt_payload').text(evt.target.result)
                resolve(evt.target.result);
            }
            reader.onerror = function (evt) {
                // $('#txt_payload').text("error")
                reject("Error")
            }
        } else {
            reject("no file error")
        }
    });
}

// const bearerToken = async (privateKey, keyID, teamID) => {
//     // const header

//     const headers = {
//         "alg" : "ES256",
//         "kid" : keyID
//     }

//     const currentTime = dayjs()
//     const currentTimePlus1Hour = currentTime.add(1, 'hour').unix()

//     const claims = {
//         "iss": teamID,
//         "iat": currentTimePlus1Hour
//      }

//      const privateKey = await getPrivateKey()

//      const jwt = await new jose.SignJWT(claims).setProtectedHeader(headers).sign(privateKey);

//      console.log(jwt)
//      console.log()
// }

async function sendAPNSPush() {

    const isDev = $("#idIsJSON").is(":checked")
    const pushType = $("#idPushType").val()
    const priority = $("#idPushPririty").val()
    const keyID = $("#idKeyID").val()
    const teamID = $("#idTeamID").val()
    const bundleID = $("#idBundleID").val()
    const privateKey = await getPrivateKey();

    const deviceToken = $("#idDeviceToken").val()
    const isJSON = $("#idIsJSON").val()

    let stringPayload = $("#txt_payload").val()

    let jsonPayload = {
        "aps": {
            "alert": stringPayload
        }
    }

    if ($("#idIsJSON").is(":checked")) {
        jsonPayload = JSON.parse(stringPayload);
    }

    const header = {
        "apns-push-type": pushType,
        "apns-priority": priority,
        "apns-topic": bundleID
    }

    try {
        const result = await window.native_bridge.sendPush(header, jsonPayload, deviceToken, true, privateKey, keyID, teamID)
        alert("SUCCESS" + JSON.stringify(result))
    } catch (error) {
        alert("ERROR " + JSON.stringify(error))
    }

};