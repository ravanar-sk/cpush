

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
    if (validData()) {
        sendAPNSPush();
    }
});

const defaultJSONPayload = {
    aps: {
        alert: "Hello World!",
        sound: "default"
    }
}

$('#idIsJSON').on('click', function () {
    if ($("#idIsJSON").is(":checked")) {
        $("#txt_payload").val(JSON.stringify(defaultJSONPayload, null, 2));
    } else {
        $("#txt_payload").val(defaultJSONPayload.aps.alert);
    }

    buildPayload();
});

$('#btnP8').on('click', function () {
    $('#auth_cert_password_container').attr("hidden", true);
    $('#auth_cert_file').attr("accept", ".p8");
    $('#idContainerKeyID').attr("hidden", false);
});

$('#btnP12').on('click', function () {
    $('#auth_cert_password_container').attr("hidden", false);
    $('#auth_cert_file').attr("accept", ".p12");

    $('#idContainerKeyID').attr("hidden", true);
});

const buildPayload = () => {

    if ($("#idIsJSON").is(":checked")) {
        const value = $('#txt_payload').val();

        try {
            const tempString = JSON.parse(value)
            $('#lbl_json_preview').text(value);
        } catch (e) {
            $('#lbl_json_preview').text("Enter valid JSON");
        }


    } else {
        let tempPayload = JSON.parse(JSON.stringify(defaultJSONPayload));
        tempPayload.aps.alert = $('#txt_payload').val();

        const payloadString = JSON.stringify(tempPayload, null, 2);
        $('#lbl_json_preview').text(payloadString);
    }
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

    return new Promise((resolve, reject) => {
        var file = document.getElementById("auth_cert_file").files[0];
        if (file) {
            var reader = new FileReader();
            reader.readAsBinaryString(file);
            reader.onload = async function (evt) {
                try {
                    // const privateKey = window.native_bridge.getPrivateKeyFromP12(evt.target.result, password)
                    resolve(evt.target.result)
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

    const isP8 = $("#btnP8").is(":checked");

    if (isP8) {
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

        
        var file = document.getElementById("auth_cert_file").files[0];
        if (file) {
            $("#auth_cert_file").removeClass('is-invalid')
        } else {
            isValid = false
            $("#auth_cert_file").addClass('is-invalid')
        }


        const payload = $('#txt_payload').val();
        const isJSON = $("#idIsJSON").is(":checked")

        if (isJSON) {
            try {
                JSON.parse(payload);
                $("#txt_payload").removeClass('is-invalid')
            } catch (e) {
                $("#txt_payload").addClass('is-invalid')
            }
        } else {
            if (payload?.toString().trim().length == 0) {
                isValid = false
                $("#txt_payload").addClass('is-invalid')
            } else {
                $("#txt_payload").removeClass('is-invalid')
            }
        }
    } else {

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


        var file = document.getElementById("auth_cert_file").files[0];
        if (file) {
            $("#auth_cert_file").removeClass('is-invalid')
        } else {
            isValid = false
            $("#auth_cert_file").addClass('is-invalid')
        }


        const payload = $('#txt_payload').val();
        const isJSON = $("#idIsJSON").is(":checked")

        if (isJSON) {
            try {
                JSON.parse(payload);
                $("#txt_payload").removeClass('is-invalid')
            } catch (e) {
                $("#txt_payload").addClass('is-invalid')
            }
        } else {
            if (payload?.toString().trim().length == 0) {
                isValid = false
                $("#txt_payload").addClass('is-invalid')
            } else {
                $("#txt_payload").removeClass('is-invalid')
            }
        }
    }



    return isValid;
}
async function sendAPNSPush() {

    const isDev = $("#idIsJSON").is(":checked")
    const pushType = $("#idPushType").val()
    const priority = $("#idPushPririty").val()
    const keyID = $("#idKeyID").val()
    const teamID = $("#idTeamID").val()
    const bundleID = $("#idBundleID").val()
    let privateKey = ''
    let p12base64 = ''

    if ($("#btnP8").is(":checked")) {
        privateKey = await getPrivateKey();
    } else if ($("#btnP12").is(":checked")) {
        p12base64 = await getPrivateKeyP12();
    } else {

    }

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
        // const result = await window.native_bridge.sendPush(header, jsonPayload, deviceToken, true, privateKey, keyID, teamID)
        const result = await window.native_bridge.sendPushP12(header, jsonPayload, deviceToken, true, p12base64, "1234")
        alert("SUCCESS" + JSON.stringify(result))
    } catch (error) {
        alert("ERROR " + JSON.stringify(error))
    }

};



buildPayload()