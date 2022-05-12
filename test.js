const fs = require('fs');                                         const ejs = require('ejs');
const puppeteer = require('puppeteer-core');


(async function( ) {
   let compiled = ejs.compile(fs.readFileSync('/storage/emulated/0/IWX2.0.0/iwx_collections/views/invoice.ejs', 'utf8'));
})( );
