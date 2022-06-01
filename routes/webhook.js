const { Blob } = require('node:buffer');

const fs = require('fs');
const ejs = require('ejs');

const Cart = require('../models/cart.js');
const connection = require('../lib/server/config.js');
const generateInvoice = require('../lib/pdf/generatePDF.js');
const { checkRRRStatus } = require('../lib/remita/remita.js');
const { get_products_supplier_mapping } = require('../lib/server/query.js');
const { sendMail } = require('../lib/email.js');


module.exports = function(app) {

  app.get('/invoice', async (req, res) => {

    let user = req.session.user;                                                let cart = req.session.cart;

    if(!user.amount || user.amount == 0) {
      return;
    }                      
             
    let compiled_customer = ejs.compile(fs.readFileSync('/root/iwxcollections2.0.0/views/invoice.ejs', 'utf8'));
    let compiled_supplier = ejs.compile(fs.readFileSync('/root/iwxcollections2.0.0/views/supplier_invoice.ejs', 'utf8'));
    
    let customer_html = compiled_customer({ user : user });
    let supplier_html = compiled_supplier({ map: await get_products_supplier_mapping(user.cart_items) });

    const customer_invoice = await generateInvoice(customer_html);
    const supplier_invoice = await generateInvoice(supplier_html);

    Cart.clear(cart); //empty cart
    user.cart_items = [];
    user.amount = 0;

    res.set('Content-Type', 'image/png');
    res.send(customer_invoice);

    //TODO
    sendMail({
      from: 'iwxcollections',
      to: 'hussainimagaji99@gmail.com',
      subject: 'IWXCOLLECTIONS SUPPLIER INVOICE', 
      attachments: [
        {
          contentType: 'image/png',
          filename: 'supplier_invoice.png',
          content: supplier_invoice
        }
      ]
    });

  });


  app.get('/webhook', async (req, res) => {

    let user = req.session.user;
 
    if(!user.email || !req.query.RRR) {
      return;
    }

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
	res.render('confirm.ejs', {user: user}); 
      } break;

      default: {
        console.log(response);
	res.redirect('/');
      }

   } 

 });

};
