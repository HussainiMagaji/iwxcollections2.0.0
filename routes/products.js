const { get_products } = require('../lib/server/query.js');

module.exports = function(app) {
    app.get('/products/:idx', (req, res) => {
        (async () => { 
            let result = await get_products(10, req.params.idx);
            res.send(result);
        })( );
    });
};
