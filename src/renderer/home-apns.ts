const apns_alert = {
    bundleID_suffix: "",
    priority: [10, 5, 1]
}
const apns_background = {
    bundleID_suffix: "",
    priority: [5, 1]
}

const apns_location = {
    bundleID_suffix: ".location-query",
    priority: [10, 5]
}

const apns_voip = {
    bundleID_suffix: ".voip",
    priority: [10]
}

const apns_complication = {
    bundleID_suffix: ".complication",
    priority: [10]
}

const apns_fileprovider = {
    bundleID_suffix: ".pushkit.fileprovider",
    priority: [10]
}

const apns_mdm = {
    bundleID_suffix: "",
    priority: [10]
}

const apns_liveactivity = {
    bundleID_suffix: ".push-type.liveactivity",
    priority: [10]
}

const apns_pushtotalk = {
    bundleID_suffix: ".voip-ptt",
    priority: [10]
}

const apns = {
    iOS: {
        alert: apns_alert,
        background: apns_background,
        location: apns_location,
        voip: apns_voip,
        complication: apns_complication,
        fileprovider: apns_fileprovider,
        mdm: apns_mdm,
        liveactivity: apns_liveactivity,
        pushtotalk: apns_pushtotalk,
    },
    iPadOS: {
        alert: apns_alert,
        background: apns_background,
        location: apns_location,
        voip: apns_voip,
        fileprovider: apns_fileprovider,
        mdm: apns_mdm,
        liveactivity: apns_liveactivity,
        pushtotalk: apns_pushtotalk,
    },
    macOS: {
        alert: apns_alert,
        background: apns_background,
        voip: apns_voip,
        fileprovider: apns_fileprovider,
        mdm: apns_mdm,
    },
    watchOS: {
        complication: apns_complication,
    },
    tvOS: {
        alert: apns_alert,
        background: apns_background,
        voip: apns_voip,
        fileprovider: apns_fileprovider,
        mdm: apns_mdm,
    }
}



/**
 * 
 */
$('#txt_apns_payload').on('input', function (e) {
    buildPayload();
});

/**
 * 
 */

$('#btn_apns_send_push').on('click', function () {
    if (validData()) {
        sendAPNSPush();
    }
});

const defaultAPNSJSONPayload = {
    aps: {
        alert: "Hello World!",
        sound: "default"
    }
}

$('#chkbox_apns_isJSON').on('click', function () {
    if ($("#chkbox_apns_isJSON").is(":checked")) {
        $("#txt_apns_payload").val(JSON.stringify(defaultAPNSJSONPayload, null, 2));
    } else {
        $("#txt_apns_payload").val(defaultAPNSJSONPayload.aps.alert);
    }

    buildPayload();
});

$('#btn_apns_P8').on('click', function () {
    $('#auth_cert_password_container').attr("hidden", true);
    $('#file_apns_auth_cert').attr("accept", ".p8");
    $('#file_apns_auth_cert').val(null);
    $('#idContainerKeyID').attr("hidden", false);
    resetErrorFields();
});

$('#btn_apns_P12').on('click', function () {
    $('#auth_cert_password_container').attr("hidden", false);
    $('#file_apns_auth_cert').attr("accept", ".p12")
    $('#file_apns_auth_cert').val(null);
    $('#idContainerKeyID').attr("hidden", true);
    resetErrorFields();
});

$('#select_apns_PushType').on('change', function (event) {
    apns_loadPriorityForPushType();
});

function osTypeClickAction(event) {
    apns_loadPushTypeForOS()
}

$('#btn_apns_iOS').on("click", { type: "iOS" }, osTypeClickAction);
$('#btn_apns_iPadOS').on("click", { type: "iPadOS" }, osTypeClickAction);
$('#btn_apns_macOS').on("click", { type: "macOS" }, osTypeClickAction);
$('#btn_apns_watchOS').on("click", { type: "watchOS" }, osTypeClickAction);
$('#btn_apns_tvOS').on("click", { type: "tvOS" }, osTypeClickAction);



const buildPayload = () => {

    if ($("#chkbox_apns_isJSON").is(":checked")) {
        const value = $('#txt_apns_payload').val();

        try {
            const tempString = JSON.parse(value)
            $('#lbl_apns_json_preview').text(value);
        } catch (e) {
            $('#lbl_apns_json_preview').text("Enter valid JSON");
        }


    } else {
        let tempPayload = JSON.parse(JSON.stringify(defaultAPNSJSONPayload));
        tempPayload.aps.alert = $('#txt_apns_payload').val();

        const payloadString = JSON.stringify(tempPayload, null, 2);
        $('#lbl_apns_json_preview').text(payloadString);
    }
}

const getPrivateKeyP8 = () => {
    return new Promise((resolve, reject) => {
        var file = document.getElementById("file_apns_auth_cert").files[0];
        if (file) {
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                // $('#txt_apns_payload').text(evt.target.result)
                resolve(evt.target.result);
            }
            reader.onerror = function (evt) {
                // $('#txt_apns_payload').text("error")
                reject("Error")
            }
        } else {
            reject("no file error")
        }
    });
}

const getPrivateKeyP12 = async () => {

    return new Promise((resolve, reject) => {
        var file = document.getElementById("file_apns_auth_cert").files[0];
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

function apns_OSType() {
    if ($("#btn_apns_iOS").is(":checked"))
        return 'iOS';
    else if ($("#btn_apns_iPadOS").is(":checked"))
        return 'iPadOS';
    else if ($("#btn_apns_macOS").is(":checked"))
        return 'macOS';
    else if ($("#btn_apns_watchOS").is(":checked"))
        return 'watchOS';
    else if ($("#btn_apns_tvOS").is(":checked"))
        return 'tvOS';
    else
    return '';
}

function apns_loadPushTypeForOS() {
    const osType = apns_OSType();

    if (osType.length > 0) {

        $('#select_apns_PushType').empty();
        
        const json = apns[osType];
        const keys = Object.keys(json);
        for (let index = 0; index < keys.length; index++) {
            const key = keys[index];
            const data = json[key]
            $('#select_apns_PushType').append(`<option value=\"${key}\">${key}</option>`);
        }

        apns_loadPriorityForPushType();
    }

}

function apns_loadPriorityForPushType() {

    const osType = apns_OSType();
    const json = apns[osType];

    const pushType = $("#select_apns_PushType").val()

    const json_PushType = json[pushType];

    const arrayPriority = json_PushType.priority;

    $('#idPushPririty').empty();

    for(let index = 0 ; index < arrayPriority.length ; index++) {
        const priority = arrayPriority[index];
        $('#idPushPririty').append(`<option value=\"${priority}\">${priority}</option>`);
    }
}

function validData() {

    let isValid = true

    const isP8 = $("#btn_apns_P8").is(":checked");

    if (isP8) {
        const keyID = $("#txt_apns_KeyID").val()
        if (keyID?.toString().trim().length == 0) {
            isValid = false
            $("#txt_apns_KeyID").addClass('is-invalid')
        } else {
            $("#txt_apns_KeyID").removeClass('is-invalid')
        }

        const teamID = $("#txt_apns_TeamID").val()
        if (teamID?.toString().trim().length == 0) {
            isValid = false
            $("#txt_apns_TeamID").addClass('is-invalid')
        } else {
            $("#txt_apns_TeamID").removeClass('is-invalid')
        }

        const bundleID = $("#txt_apns_BundleID").val()
        if (bundleID?.toString().trim().length == 0) {
            isValid = false
            $("#txt_apns_BundleID").addClass('is-invalid')
        } else {
            $("#txt_apns_BundleID").removeClass('is-invalid')
        }


        const deviceToken = $("#txt_apns_DeviceToken").val()
        if (deviceToken?.toString().trim().length == 0) {
            isValid = false
            $("#txt_apns_DeviceToken").addClass('is-invalid')
        } else {
            $("#txt_apns_DeviceToken").removeClass('is-invalid')
        }


        var file = document.getElementById("file_apns_auth_cert").files[0];
        if (file) {
            $("#file_apns_auth_cert").removeClass('is-invalid')
        } else {
            isValid = false
            $("#file_apns_auth_cert").addClass('is-invalid')
        }


        const payload = $('#txt_apns_payload').val();
        const isJSON = $("#chkbox_apns_isJSON").is(":checked")

        if (isJSON) {
            try {
                JSON.parse(payload);
                $("#txt_apns_payload").removeClass('is-invalid')
            } catch (e) {
                $("#txt_apns_payload").addClass('is-invalid')
            }
        } else {
            if (payload?.toString().trim().length == 0) {
                isValid = false
                $("#txt_apns_payload").addClass('is-invalid')
            } else {
                $("#txt_apns_payload").removeClass('is-invalid')
            }
        }
    } else {

        const bundleID = $("#txt_apns_BundleID").val()
        if (bundleID?.toString().trim().length == 0) {
            isValid = false
            $("#txt_apns_BundleID").addClass('is-invalid')
        } else {
            $("#txt_apns_BundleID").removeClass('is-invalid')
        }


        const deviceToken = $("#txt_apns_DeviceToken").val()
        if (deviceToken?.toString().trim().length == 0) {
            isValid = false
            $("#txt_apns_DeviceToken").addClass('is-invalid')
        } else {
            $("#txt_apns_DeviceToken").removeClass('is-invalid')
        }


        var file = document.getElementById("file_apns_auth_cert").files[0];
        if (file) {
            $("#file_apns_auth_cert").removeClass('is-invalid')
        } else {
            isValid = false
            $("#file_apns_auth_cert").addClass('is-invalid')
        }


        const payload = $('#txt_apns_payload').val();
        const isJSON = $("#chkbox_apns_isJSON").is(":checked")

        if (isJSON) {
            try {
                JSON.parse(payload);
                $("#txt_apns_payload").removeClass('is-invalid')
            } catch (e) {
                $("#txt_apns_payload").addClass('is-invalid')
            }
        } else {
            if (payload?.toString().trim().length == 0) {
                isValid = false
                $("#txt_apns_payload").addClass('is-invalid')
            } else {
                $("#txt_apns_payload").removeClass('is-invalid')
            }
        }
    }
    return isValid;
}
function sendAPNSPush() {
    if ($("#btn_apns_P8").is(":checked")) {
        sendAPNS_P8()
    } else if ($("#btn_apns_P12").is(":checked")) {
        sendAPNS_P12()
    } else {

    }
};

const sendAPNS_P8 = async () => {
    const isDev = $("#idIsDevelopment").is(":checked")
    const pushType = $("#select_apns_PushType").val()
    const priority = $("#idPushPririty").val()
    const keyID = $("#txt_apns_KeyID").val()
    const teamID = $("#txt_apns_TeamID").val()
    const bundleID = $("#txt_apns_BundleID").val()
    const privateKey = await getPrivateKeyP8();

    const deviceToken = $("#txt_apns_DeviceToken").val()
    const isJSON = $("#chkbox_apns_isJSON").val()

    let stringPayload = $("#txt_apns_payload").val()

    let jsonPayload = JSON.parse(JSON.stringify(defaultAPNSJSONPayload));

    if ($("#chkbox_apns_isJSON").is(":checked")) {
        jsonPayload = JSON.parse(stringPayload);
    } else {
        jsonPayload.aps.alert = stringPayload
    }

    const header = {
        "apns-push-type": pushType,
        "apns-priority": priority,
        "apns-topic": bundleID
    }

    try {
        const result = await window.native_bridge.apnsAPI(
            isDev,
            header,
            jsonPayload,
            deviceToken,
            {
                isP12: false,
                privateKey,
                keyID,
                teamID,
            });
        alert("SUCCESS" + JSON.stringify(result))
    } catch (error) {
        alert(`ERROR : ${error}`)
    }
}

const sendAPNS_P12 = async () => {
    const isDev = $("#idIsDevelopment").is(":checked")
    const pushType = $("#select_apns_PushType").val()
    const priority = $("#idPushPririty").val()
    const bundleID = $("#txt_apns_BundleID").val()
    const p12Buffer = await getPrivateKeyP12();
    const password = $("#auth_cert_password").val();

    const deviceToken = $("#txt_apns_DeviceToken").val()

    const isJSON = $("#chkbox_apns_isJSON").val()

    let stringPayload = $("#txt_apns_payload").val()

    let jsonPayload = JSON.parse(JSON.stringify(defaultAPNSJSONPayload));

    if ($("#chkbox_apns_isJSON").is(":checked")) {
        jsonPayload = JSON.parse(stringPayload);
    } else {
        jsonPayload.aps.alert = stringPayload
    }

    const header = {
        "apns-push-type": pushType,
        "apns-priority": priority,
        "apns-topic": bundleID
    }

    try {
        const result = await window.native_bridge.apnsAPI(
            isDev,
            header,
            jsonPayload,
            deviceToken,
            {
                isP12: true,
                buffer: p12Buffer,
                password
            });
        alert("SUCCESS" + JSON.stringify(result))
    } catch (error) {
        alert(`ERROR : ${error}`)
    }
}

function resetErrorFields() {
    $("#txt_apns_KeyID").removeClass('is-invalid')
    $("#txt_apns_TeamID").removeClass('is-invalid')
    $("#txt_apns_BundleID").removeClass('is-invalid')
    $("#txt_apns_DeviceToken").removeClass('is-invalid')
    $("#file_apns_auth_cert").removeClass('is-invalid')
    $("#txt_apns_payload").removeClass('is-invalid')
}

buildPayload()