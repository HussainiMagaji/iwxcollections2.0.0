module.exports = function(app) {

  app.get('/checkout', (req, res) => {
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

    res.render('checkout.ejs', {
      subtotal: subtotal.toLocaleString( ),
      shipping_fee: shipping_fee.toLocaleString( ),
      gross_total:(subtotal+shipping_fee).toLocaleString( )
    });
  });

};