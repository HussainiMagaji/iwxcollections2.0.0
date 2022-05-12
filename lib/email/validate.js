function validateEmail(emailAddr) {
  let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (emailAddr.match(regexEmail)) {	
    return true;
  } else {
    return false;
  }
}

module.exports = validateEmail;
