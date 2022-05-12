const { generateRRR, initiatePayment } = require('../lib/remita/remita.js');

module.exports = function(app) {

  app.post('/order', async (req, res) => {
    let user = req.session.user;

    if(!user.cart_items.length) {
      res.send('ORDER ALREADY PROCESSED!');
      return;
    }

    Object.assign(user, req.body);

    if(Object.keys(req.body).length < 5) {
       res.redirect('/checkout');
       return;
    } else {
       Object.keys(req.body).forEach(key => {
	 let value = req.body[key].trim( );
	 if(!value || value == '') {
	   res.redirect('/checkout');
	   return;
	 }
       });
    }

    let response = await generateRRR(user);
    switch(response.statuscode) {
      case '025': {
        user.RRR = response.RRR;
        response = await initiatePayment(user);
      } break;
      default: {
        console.log(response);
      }
    }
    res.send(response);
  });

};
