const { get_products } = require('../lib/server/query.js');

module.exports = function(app) {
  app.get('/shop', (req, res) => {
    (async () => { 
      let result = await get_products(10, 0);
      res.render('shop.ejs', { products: result });
    })( );
  });
};
