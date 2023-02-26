// const jose = require("jose");
// const dayjs = require('dayjs');

// console.log("Main Utils executed");

// const bearerToken = async (privateKey, keyID, teamID) => {
//     // const header
//     console.log("bearerToken_begin")
//     // const keyID = $("idKeyID").val()
//     // const teamID = $("idTeamID").val()

//     const headers = {
//         "alg": "ES256",
//         "kid": keyID
//     }

//     const currentTime = dayjs()
//     const currentTimePlus1Hour = currentTime.add(1, 'hour').unix()

//     const claims = {
//         "iss": teamID,
//         "iat": currentTimePlus1Hour
//     }

//     // const privateKey = await getPrivateKey()

//     const jwt = await new jose.SignJWT(claims).setProtectedHeader(headers).sign(privateKey);

//     console.log(jwt)
//     // alert(jwt);
//     return Promise.resolve(jwt)


//     // console.log()

// }