const { get_states, get_local_governments } = require('../lib/server/query.js');


module.exports = function(app) {

  app.get('/lgas/:state', async (req, res) => {
    const state = req.params.state.trim();
    const lgas = await get_local_governments(state);
    res.send(lgas);
  });

  app.get('/checkout', async (req, res) => {
    let user = req.session.user,
    cart = req.session.cart,
    subtotal = cart.amount,
    shipping_fee = 1000;

    if(!user.email) {
      res.redirect('/login');
      return;
    }

    subtotal += ((10/100) * cart.amount); //10% commission
    user.amount = subtotal + shipping_fee;
    user.cart_items = cart.items;
    const states = await get_states( );

    res.render('checkout.ejs', {
      states: states,
      subtotal: subtotal.toLocaleString( ),
      shipping_fee: shipping_fee.toLocaleString( ),
      gross_total:(subtotal+shipping_fee).toLocaleString( )
    });
  });

};
