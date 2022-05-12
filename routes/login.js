const connection = require('../lib/server/config.js');
const validateEmail = require('../lib/email/validate.js');
const { get_customer_orders } = require('../lib/server/query.js');

module.exports = function(app) {

  app.get('/login', (req, res) => {
    //store previous page b4 login
    let idx = req.headers['referer'].lastIndexOf('/');
    let referer = req.headers['referer'].slice(idx);

    if((referer != '/login') || (referer != '/signup')) {
      req.session.login_referer = referer;
    }

    let login_status = req.session.login; // 0 or 1
    if(login_status == 1) {
      res.redirect('/account');
    } else {
        res.render('login.ejs', { error_message: null });
    }
  });
                                
  app.get('/account', async (req, res) => {
    let user = req.session.user;
    res.render('account.ejs', {
      email: user.email,
      orders: await get_customer_orders(user.id)
    });
  });

  app.post('/login', (req, res) => {
    //validate email
    if(!req.body.email || !req.body.password) {
      res.render('login.ejs', { error_message: 'Incomplete inputs!' });
      return;
    }

    if(!validateEmail(req.body.email)) {
      res.render('login.ejs', { error_message: 'Invalid e-mail!' });
      return;
    }
    
    //verify existence and authentify password
    connection.query(`CALL VERIFY_CUSTOMER('${JSON.stringify(req.body)}');`, (error, result) => {
      if (error) {
        res.render('login.ejs', { error_message: error.message });
      } else {
        req.session.user = result[0][0];
        req.session.login = 1; // user is logged in
        res.redirect(req.session.login_referer);
      }
    });
  });

  app.post('/signup', (req, res) => {
    //validate email
    if(!req.body.email || !req.body.password || !req.body.cpassword) {
      res.render('login.ejs', { error_message: 'Incomplete inputs!' });
      return;
    }

    if(!validateEmail(req.body.email)) {
      res.render('login.ejs', { error_message: 'Invalid e-mail!' });
      return;
    }
    //verify email uniqueness
    if(req.body.password !== req.body.cpassword) {
      res.render('login.ejs', { error_message: 'Passwords not matched!' });
      return;
    }
    
    connection.query(`CALL ADD_CUSTOMER( '${JSON.stringify(req.body)}' )`, (error, result) => {
      if (error) {
        res.render('login.ejs', { error_message: error.message });
      } else {
        req.session.user = result[0][0];
        req.session.login = 1; // user is logged in
        res.redirect(req.session.login_referer);
      }
    });

  });

};
