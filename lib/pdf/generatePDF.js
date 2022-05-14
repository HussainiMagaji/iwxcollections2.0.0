const puppeteer = require('puppeteer');

module.exports = async function(html = '') {

  const browser = await puppeteer.launch({
     args: ['--no-sandbox', '--disabled-setupid-sandbox']
  });

  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle0' }); 

  let pdfBuffer = await page.screenshot({fullPage: true});

  await page.close();
  await browser.close();

  return pdfBuffer;
};

