// import jose from 'jose';
// const jose = require("jose");
// import DateTime from "luxon"
// const { DateTime } = require("luxon");
// import dayjs from 'dayjs';
// const dayjs = require('dayjs');

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
    sendAPNSPush();
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

const buildPayload = () => {
    const payload = {
        "aps": {
            "alert": $('#txt_payload').val()
        }
    };

    const payloadString = JSON.stringify(payload, null, " ");
    console.log(payloadString);
    $('#lbl_json_preview').text(payloadString);
}

const getPrivateKey = () => {
    return new Promise((resolve, reject) => {
        var file = document.getElementById("file_p8").files[0];
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


    const pushType = $("idPushType").val()
    const priority = $("idPushPririty").val()
    const keyID = $("idKeyID").val()
    const teamID = $("idTeamID").val()
    const bundleID = $("idBundleID").val()
    const privateKey = await getPrivateKey();

    const deviceToken = $("idDeviceToken").val()
    const isJSON = $("idIsJSON").val()

    let stringPayload = $("#txt_payload").val()

    let jsonPayload = {
        "aps": {
            "alert": stringPayload
        }
    }
    if ($("#idIsJSON").is(":checked")) {
        jsonPayload = JSON.parse(stringPayload);
    }

    // const response = 
    console.log("code_33") // prints out 'pong'
    try {
        const bearerToken = await window.native_bridge.getBearerToken(privateKey, keyID, teamID)
        // const bearerToken = await window.native_bridge.getBearerToken("privateKey", "keyID", "teamID")
        console.log("code_99 :" + bearerToken)
    } catch (error) {
        console.log("code_13 :" + error)
    }

    console.log("code_23 :")

    let myHeaders = new Headers();
    myHeaders.append("apns-push-type", pushType);
    myHeaders.append("apns-topic", bundleID);
    myHeaders.append("Authorization", "Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6IllWQzlXTE5KVTYifQ.eyJpc3MiOiI0RjdIVDdQQjhYIiwiaWF0IjoxNjY5NDYxNjQyfQ.ty5U_huToaDiC6LYpROVermNFfGTC6L6bESFc-LL0UlQylyk4inMPm0KrmGX0QOj4-tyCUXJud_p5-OprHIJhQ");
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
        method: 'POST',
        mode: 'no-cors',
        headers: myHeaders,
        body: jsonPayload,
        redirect: 'follow',
    };

    return;
    fetch("https://api.sandbox.push.apple.com/3/device/4c90e04a66d10382eec5d2c0e57483e683eafe580f7e576fe76c7ee13c671e25", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));

};

