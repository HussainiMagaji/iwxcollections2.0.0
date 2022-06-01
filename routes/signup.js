const fs = require('fs');
const ejs = require('ejs');

const { validateEmail, sendMail } = require('../lib/email.js');
const { encodeRegToken, decodeRegToken } = require('../lib/misc.js');
const { email_exist, add_customer, 
        add_unverified_user, 
        get_unverified_user_by_id } = require('../lib/server/query.js');


function generateVerificationHTML(req, user) {
  // Generate token
  const token = encodeRegToken(user.user_id);                             
  // Personalise email html
  let compiled = ejs.compile(fs.readFileSync('/root/iwxcollections2.0.0/views/verify.ejs', 'utf8'));
  let html = compiled({ email : user.email, token: token });

  return html;
}
 


module.exports = function(app) {

  app.post('/signup', async (req, res) => {

    // Validate inputs
    if(!req.body.email || !req.body.password || !req.body.cpassword) {
       res.render('login.ejs', { error_message: 'Incomplete inputs!' });
       return;
    }

    // Validate email syntax
    if(!validateEmail(req.body.email)) {
       res.render('login.ejs', { error_message: 'Invalid e-mail!' });
       return;
    }

    // Password matching 
    if(req.body.password !== req.body.cpassword) {
       res.render('login.ejs', { error_message: 'Passwords not matched!' });       return;
    }

    // Check email uniqueness
    let check = await email_exist(req.body.email);
    if(check) { // Email already exist - reject
      res.render('login.ejs', { error_message: `${req.body.email} is already registered!` });
      return;
    }

    // Add email among "unverified" emails
    let user;
    try {
 
      user = await add_unverified_user(req.body.email, req.body.password);
   
      // Send verification link to email and alert user to check it
      sendMail({
        from: 'iwxcollections',
        to: user.email,
        subject: 'IWXCOLLECTIONS USER VERIFICATION',
        html: generateVerificationHTML(req, user)
      });

      res.render('login.ejs', { error_message: `A verification link has been sent to ${user.email}` });

      } catch(error) {
          res.render('login.ejs', { error_message: 'A verification link has already been sent to this email.\nPlease check your inbox!' });
      }

  });

  
  app.get('/verify/:token', async (req, res) => {
     
    const token = req.params.token;
    const decoded = decodeRegToken(token);
    let user;    

    try {
      user = await get_unverified_user_by_id(decoded.id);
      
      if(!user) {
        res.render('login.ejs', {error_message: 'Link is invalid, expired or used!'});
        return;
      }

    } catch(error) {
        res.render('login.ejs', {error_message: 'Invalid/Expired link!'});
        return;
    }

    if(decoded.expired) { // Link expired

       // Resend link to email
       sendMail({
         from: 'iwxcollections',
         to: user.email,
         subject: 'IWXCOLLECTIONS USER VERIFICATION',
         html: generateVerificationHTML(req, user)
       });

       // Inform user
       res.render('login.ejs', { error_message: 'Email verification link is expired./nCheck inbox/spam for a new link.' });
       
    } else { // Link not expired
        // Add verified user to db
        try {
          let result = await add_customer(user);

          req.session.user = result;
          req.session.login = 1; // user is logged in
          res.redirect(req.session.login_referer);
        
        } catch(error) {
            res.render('login.ejs', { error_message: error.message });
        }
    }

  });

};
