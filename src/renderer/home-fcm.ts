const defaultFCMJSONPayload = {
    notification: {
        title: "Title",
        body: "Hello World!",
        image: ""
    }
}


$('#btn_fcm_device').on("click", fcm_deviceAction);
$('#btn_fcm_topic').on("click", fcm_topicAction);

$('#btn_fcm_send_push').on("click", fcm_sendPush);

function fcm_deviceAction() {
    $('#txt_fcm_DeviceToken').attr("placeholder", "Device Token");
}

function fcm_topicAction() {
    $('#txt_fcm_DeviceToken').attr("placeholder", "Topic");
}

/**
 * 
 */
$('#txt_fcm_payload').on('input', function (e) {
    fcm_buildPayload();
});

$('#chkbox_fcm_isJSON').on('click', function () {
    if ($("#chkbox_fcm_isJSON").is(":checked")) {
        $("#txt_fcm_payload").val(JSON.stringify(defaultFCMJSONPayload, null, 2));
    } else {
        $("#txt_fcm_payload").val(defaultFCMJSONPayload.notification.body);
    }

    fcm_buildPayload();
});

/**
 * Async method used to fetch the private key from the .p8 file
 * @returns Promise
 */
const getGoogleServicesJSON = async () => {
    return new Promise((resolve, reject) => {
        let file = document.getElementById("file_fcm_google_services_json").files[0];
        if (file) {
            let reader = new FileReader();
            reader.readAsText(file);
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

function fcm_onPayloadChange() {

}

function fcm_sendPush() {
    if (fcm_validData()) {
        console.log("FCM is Valid")
        sendFCMPush();
    } else {
        console.log("FCM is Invalid")
    }
}

const fcm_buildPayload = () => {

    if ($("#chkbox_fcm_isJSON").is(":checked")) {
        const value = $('#txt_fcm_payload').val();

        try {
            const tempString = JSON.parse(value)
            $('#lbl_fcm_json_preview').text(value);
        } catch (e) {
            $('#lbl_fcm_json_preview').text("Enter valid JSON");
        }


    } else {
        let tempPayload = JSON.parse(JSON.stringify(defaultFCMJSONPayload));
        tempPayload.notification.body = $('#txt_fcm_payload').val();

        const payloadString = JSON.stringify(tempPayload, null, 2);
        $('#lbl_fcm_json_preview').text(payloadString);
    }
}

/**
 * Method used to validate the form for APNS 
 * @returns Returns true/false where true indicates the form is valid
 */
function fcm_validData() {

    let isValid = true


    const file = document.getElementById("file_fcm_google_services_json").files[0];
    if (file) {
        $("#file_fcm_google_services_json").removeClass('is-invalid')
    } else {
        isValid = false
        $("#file_fcm_google_services_json").addClass('is-invalid')
    }


    const deviceToken = $("#txt_fcm_DeviceToken").val()
    if (deviceToken?.toString().trim().length == 0) {
        isValid = false
        $("#txt_fcm_DeviceToken").addClass('is-invalid')
    } else {
        $("#txt_fcm_DeviceToken").removeClass('is-invalid')
    }



    const payload = $('#txt_fcm_payload').val();
    const isJSON = $("#chkbox_fcm_isJSON").is(":checked")

    if (isJSON) {
        try {
            JSON.parse(payload);
            $("#txt_fcm_payload").removeClass('is-invalid')
        } catch (e) {
            $("#txt_fcm_payload").addClass('is-invalid')
        }
    } else {
        if (payload?.toString().trim().length == 0) {
            isValid = false
            $("#txt_fcm_payload").addClass('is-invalid')
        } else {
            $("#txt_fcm_payload").removeClass('is-invalid')
        }
    }
    return isValid;
}


/**
 * Click Action for element #btn_fcm_send_push
 */
const sendFCMPush = async () => {

    let tokenOrTopic = null
    if ($("#btn_fcm_device").is(":checked")) {
        tokenOrTopic = { token: $("#txt_fcm_DeviceToken").val() }
    } else if ($("#btn_fcm_topic").is(":checked")) {
        tokenOrTopic = { topic: $("#txt_fcm_DeviceToken").val() }
    } else {

    }

    let googleServiceKEY = await getGoogleServicesJSON()
    googleServiceKEY = JSON.parse(googleServiceKEY)
    
    console.log(`googleService : ${googleServiceKEY}`);



    const isJSON = $("#chkbox_fcm_isJSON").is(":checked")

    let stringPayload = $("#txt_fcm_payload").val()

    let jsonPayload = JSON.parse(JSON.stringify(defaultFCMJSONPayload));

    if (isJSON) {
        jsonPayload = JSON.parse(stringPayload);
    } else {
        jsonPayload.notification.body = stringPayload
    }

    // TODO: Implement FCM push 

    // if ($("#btn_apns_P8").is(":checked")) {
    //     sendAPNS_P8()
    // } else if ($("#btn_apns_P12").is(":checked")) {
    //     sendAPNS_P12()
    // } else {

    // }



    try {
        const result = await window.native_bridge.fcmAPI(
            googleServiceKEY,
            tokenOrTopic,
            jsonPayload
        );

        if (result.status === true) {
            alert(`SUCCESS : ${result.message}`)
        } else {
            alert(`FAILED : ${result.message}`)
        }

        
    } catch (error) {
        
    }

};

fcm_buildPayload();