
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
    
});

const buildPayload = () => {
    const payload = {
        "aps": {
            "alert": $('#txt_payload').val()
        }
    };

    console.log(payload);
    const payloadString = JSON.stringify(payload, null, " ");
    $('#lbl_json_preview').text(payloadString);
}