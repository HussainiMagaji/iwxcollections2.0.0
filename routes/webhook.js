const { Blob } = require('node:buffer');

const fs = require('fs');
const ejs = require('ejs');
                                                
const Cart = require('../models/cart.js');

const connection = require('../lib/server/config.js');
const generateInvoice = require('../lib/pdf/generatePDF.js');
const { checkRRRStatus } = require('../lib/remita/remita.js');
const { get_products_supplier_mapping } = require('../lib/server/query.js');
const { sendMail } = require('../lib/email.js');

const c_invoice = '/root/iwxcollections2.0.0/views/invoice.ejs';
const s_invoice = '/root/iwxcollections2.0.0/views/supplier_invoice.ejs';


module.exports = function(app) {

  app.get('/invoice', async (req, res) => {

    let user = req.session.user;

    if(!user.email) {
      return;
    }

    if(user.temp_invoice_html) {
      let customer_invoice = await generateInvoice(user.temp_invoice_html)
      res.set('Content-Type', 'image/png');
      res.send(customer_invoice);
    }

  });


  app.get('/webhook', async (req, res) => {

    let user = req.session.user;
    let cart = req.session.cart;

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

        if(!user.amount || user.amount == 0) {
          return;                                                                   }

        let compiled_customer = ejs.compile(fs.readFileSync(c_invoice, 'utf8'));
        let compiled_supplier = ejs.compile(fs.readFileSync(s_invoice, 'utf8'));

        let customer_html = compiled_customer({ user : user });
        let supplier_html = compiled_supplier({ map: await get_products_supplier_mapping(user.cart_items) });

        const customer_invoice = await generateInvoice(customer_html);
        const supplier_invoice = await generateInvoice(supplier_html);

        //TODO
        sendMail({                                                                    from: 'iwxcollections',                                                     to: 'hussainimagaji99@gmail.com', //iwxcollections@email...
          subject: 'IWXCOLLECTIONS SUPPLIER INVOICE',
          attachments: [
            {
               contentType: 'image/png',
               filename: 'supplier_invoice.png',
               content: supplier_invoice
            }                                                                         ]
        });
                                                                                    sendMail({
          from: 'iwxcollections',                                                     to: user.email,
          subject: 'IWXCOLLECTIONS CUSTOMER INVOICE',
          attachments: [                                                                {                                                                              contentType: 'image/png',
               filename: 'customer_invoice.png',
               content: customer_invoice
            }
          ]
        });                                                                                                                                                     user.temp_invoice_html = customer_html;
        Cart.clear(cart);
        user.cart_items = [ ];
        user.amount = 0;

        res.render('confirm.ejs', {user: user});
      } break;
                                                                                  default: {                                                                    console.log(response);
        res.redirect('/');
      }                                                                     
   }

 });
   
};
