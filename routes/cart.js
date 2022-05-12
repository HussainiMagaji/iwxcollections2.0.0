const Cart = require('../models/cart.js');
const { get_product_by_id } = require('../lib/server/query.js');

module.exports = function(app) {

  app.get('/cart', (req, res) => {
    let cart = req.session.cart;
    res.render('cart.ejs', {
      cart: cart.items,
      product: null,
      quantityValue: null
    });
  });

  app.get('/cart/:id', (req, res) => {  
    (async( ) => { 
      let cart = req.session.cart,
      id = req.params.id,
      quantityValue = 1;
      
      if(Cart.getItem(cart, id)) { //Product in cart?
        quantityValue = Cart.getItem(cart, id).quantity;
        Cart.remove(cart, id); //remove from cart
      }
  
      res.render('cart.ejs', {
        cart: cart.items,
        product: await get_product_by_id(id),
        quantityValue: quantityValue
      });
    })( );
  });

  app.post('/cart', (req, res) => {
    (async( ) => { 
      let cart = req.session.cart,
        id = req.body.id,
        quantity = req.body.quantity,
        product = await get_product_by_id(id);
  
      product.quantity = quantity;
      let status = Cart.append(cart, product);
      res.end(String(status)); //return status
    })( );
  });

  app.delete('/cart/:id', (req, res) => {
    let cart = req.session.cart;
    Cart.remove(cart, req.params.id)
      res.json({status: 'deleted'});
  });

};
