const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: 'tanimusani003@gmail.com',
          pass: 'tanimu1234'
      }
});

function sendMail(mailOptions) {
   transporter.sendMail(mailOptions, function (err, info) {
     if(err)
        console.log(err)
     else
        console.log(info);
   })
}

function validateEmail(emailAddr) {
  let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (emailAddr.match(regexEmail)) {
    return true;
  } else {
    return false;
  }
}

module.exports = { validateEmail, sendMail };
