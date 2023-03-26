

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
    validData()
    // getPrivateKeyP12().then(key => console.log("KEY => " + key)).catch(e => console.log(e));
    // readFile()
    // sendAPNSPush();
});

const defaultJSONPayload = {
    aps: {
        alert: "Hello World!",
        sound: "default"
    }
}

$('#idIsJSON').on('click', function () {
    if ($("#idIsJSON").is(":checked")) {
        $("#txt_payload").val(JSON.stringify(defaultJSONPayload));
    } else {
        $("#txt_payload").val(defaultJSONPayload.aps.alert);
    }
});

$('#btnP8').on('click', function () {
    $('#auth_cert_password_container').attr("hidden", true);
    $('#auth_cert_file').attr("accept", ".p8");
});

$('#btnP12').on('click', function () {
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

const getPrivateKeyP12 = async () => {

    const password = "12345" //TODO: Read from Input

    return new Promise((resolve, reject) => {
        var file = document.getElementById("auth_cert_file").files[0];
        if (file) {
            var reader = new FileReader();
            reader.readAsBinaryString(file);
            reader.onload = async function (evt) {
                try {
                    const privateKey = window.native_bridge.getPrivateKeyFromP12(evt.target.result, password)
                    resolve(privateKey)
                } catch (e) {
                    reject(e)
                }
            }
            reader.onerror = function (evt) {
                reject("Certificate Read error");
            }
        } else {
            reject("no file error")
        }
    });
}

function loadDefaultUI() {

}

function validData() {

    let isValid = true

    const keyID = $("#idKeyID").val()
    if (keyID?.toString().trim().length == 0) {
        isValid = false
        $("#idKeyID").addClass('is-invalid')
    } else {
        $("#idKeyID").removeClass('is-invalid')
    }

    const teamID = $("#idTeamID").val()
    if (teamID?.toString().trim().length == 0) {
        isValid = false
        $("#idTeamID").addClass('is-invalid')
    } else {
        $("#idTeamID").removeClass('is-invalid')
    }

    const bundleID = $("#idBundleID").val()
    if (bundleID?.toString().trim().length == 0) {
        isValid = false
        $("#idBundleID").addClass('is-invalid')
    } else {
        $("#idBundleID").removeClass('is-invalid')
    }


    const deviceToken = $("#idDeviceToken").val()
    if (deviceToken?.toString().trim().length == 0) {
        isValid = false
        $("#idDeviceToken").addClass('is-invalid')
    } else {
        $("#idDeviceToken").removeClass('is-invalid')
    }

    // const payload = $("#idTeamID").val()

}

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