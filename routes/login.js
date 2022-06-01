const { validateEmail } = require('../lib/email.js');
const { verify_customer,
        get_customer_orders } = require('../lib/server/query.js');

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


  app.post('/login', async (req, res) => {
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
    let result;
    try {
      result = await verify_customer(req.body);

      req.session.user = result;
      req.session.login = 1; // user is logged in
      res.redirect(req.session.login_referer);

    } catch(error) {
        res.render('login.ejs', { error_message: error.message });
    }

  });

};
