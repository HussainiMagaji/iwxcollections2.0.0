const fs = require('fs');
const jwt = require('jsonwebtoken');

const cert_path = '/etc/letsencrypt/live/www.iwxcollections.ml';
const secretKey = fs.readFileSync(cert_path + '/privkey.pem').subarray(0, 128).toString();


function encodeRegToken(user_id) {
  let info = { id: user_id };
  const token = jwt.sign(info, secretKey);
  
  return token;
}

function decodeRegToken(token) {
    
  let decoded = jwt.verify(token, secretKey);

  let userId = decoded.id;

  // Check that the user didn't take too long
  let dateNow = new Date();
  let tokenTime = decoded.iat * 1000;
  
  // Two hours
  let hours = 2;
  let tokenLife = hours * 60 * 60 * 60 * 60 * 60 * 60 * 60 * 1000;
  
  // User took too long to enter the code
  if(tokenTime + tokenLife < dateNow.getTime()) {
    return {            
       expired: true,
       id: userId //TODO
    };
  }
   
  // User registered in time
  return {
     expired: false,
     id: userId
  };
  
}

module.exports = { secretKey, encodeRegToken, decodeRegToken };
