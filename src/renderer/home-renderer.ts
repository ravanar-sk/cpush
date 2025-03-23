window.onload = function() {
    // alert('On Load')
    apns_loadPushTypeForOS()
}


$('#btnAPNS').on("click", onCloudServiceSelected);
$('#btnFCM').on("click", onCloudServiceSelected);

function onCloudServiceSelected() {
    if ($("#btnAPNS").is(":checked")) {
        console.log("APNS Selected");
        $("#container_apns").removeClass('d-none');
        $("#container_fcm").addClass('d-none');
    } else if ($("#btnFCM").is(":checked")) {
        console.log("FCM selected");
        $("#container_fcm").removeClass('d-none');
        $("#container_apns").addClass('d-none');
    } else {
        console.log("Invalid Selection");
    }
}