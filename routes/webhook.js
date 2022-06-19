const { Blob } = require('node:buffer');

const fs = require('fs');
const ejs = require('ejs');
                                                
const Cart = require('../models/cart.js');

const connection = require('../lib/server/config.js');
const generateInvoice = require('../lib/pdf/generatePDF.js');
const { checkRRRStatus } = require('../lib/remita/remita.js');
const { get_products_supplier_mapping } = require('../lib/server/query.js');
const { sendMail } = require('../lib/email.js');

const s_html = '/root/iwxcollections2.0.0/views/supplier_html.ejs';
const c_invoice = '/root/iwxcollections2.0.0/views/invoice.ejs';
const s_invoice = '/root/iwxcollections2.0.0/views/supplier_invoice.ejs';


module.exports = function(app) {

  app.get('/invoice', async (req, res) => {

    let user = req.session.temp_user;

    if(!user.email) {
      return;
    }

    if(user) {
      let compiled_customer = ejs.compile(fs.readFileSync(c_invoice, 'utf8'));
      let customer_html = compiled_customer({ user : user });
      let customer_invoice = await generateInvoice(customer_html);

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

        const map = await get_products_supplier_mapping(user.cart_items);


        let customer_html = compiled_customer({ user : user });
        let supplier_html = compiled_supplier({ user: user, map: map });


        const customer_invoice = await generateInvoice(customer_html);
        const supplier_invoice = await generateInvoice(supplier_html);

        //TODO send ordesr to corresponding suppliers
        
        Array.from(map.keys( )).forEach(supplier => {
          sendMail({
            from: 'iwxcollections',
            to: supplier.supplier_email,
            subject: 'IWXCOLLECTIONS SUPPLIER ORDER',
            html: (ejs.compile(fs.readFileSync(s_html, 'utf8')))({
                     user: user,
                     supplier: supplier,
                     orders: map.get(supplier)
                  })
          });
        });
        

        // Send customer order to iwx
        sendMail({
          from: 'iwxcollections',
          to: 'iwxcollections@gmail.com',
          subject: 'IWXCOLLECTIONS SUPPLIERS INVOICE',
          attachments: [
            {
               contentType: 'image/png',
               filename: 'supplier_invoice.png',
               content: supplier_invoice
            }                                                                         ]
        });
             
        // Send invoice to customer
        sendMail({
          from: 'iwxcollections',                                                     to: user.email,
          subject: 'IWXCOLLECTIONS CUSTOMER INVOICE',
          attachments: [                                                                {                                                                              contentType: 'image/png',
               filename: 'customer_invoice.png',
               content: customer_invoice
            }
          ]
        });

        Object.assign(req.session.temp_user, user);
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
