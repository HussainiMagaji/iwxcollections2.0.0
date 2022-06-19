const router = require('express').Router( );
const Cart = require('../models/cart.js');

router.get('*', (req, res, next) => {
  if(!req.session.cart) {
    req.session.user = { };
    req.session.login = 0; // not logged in
    req.session.login_referer = '/';
    req.session.cart = new Cart( );
    req.session.temp_user = { };
    console.log(`\nNew Client connected.\nID: ${req.sessionID}\n`);
  }
  next( );
});

module.exports = router;
