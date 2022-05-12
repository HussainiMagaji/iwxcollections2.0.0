const fs = require('fs');
const ejs = require('ejs');

const Cart = require('../models/cart.js');
const connection = require('../lib/server/config.js');
const generatePDF = require('../lib/pdf/generatePDF.js');
const { checkRRRStatus } = require('../lib/remita/remita.js');


module.exports = function(app) {

  app.get('/webhook', (req, res) => {

    let user = req.session.user;
    let cart = req.session.cart;

    (async function( ) {

       let response = await checkRRRStatus(req.query.RRR);

       switch(response.status) {

	  case '00':
	  case '01': { //successful transaction

	    connection.query(`CALL ADD_ORDER('${JSON.stringify(user)}')`, (error, result) => {
              if (error) {
		console.error(error);
		res.redirect('/');
	      }
            });

	    let compiled = ejs.compile(fs.readFileSync('/storage/emulated/0/IWX2.0.0/iwx_collections/views/invoice.ejs', 'utf8'));
            const html = compiled({ user : user });
	    const pdf = await generatePDF(html);

	    Cart.clear(cart); //empty cart
	    user.cart_items = [ ];

	    res.set('Content-Type', 'application/pdf');
	    res.send(pdf);
	     
	  } break;

	  default: {
	     console.log(response);
	     res.redirect('/');
	  }

       }

    })( );

  });

};
