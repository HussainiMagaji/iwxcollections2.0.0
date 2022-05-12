const puppeteer = require('puppeteer-core');

module.exports = async function(html = '') {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(html);

  const pdfBuffer = await page.pdf();

  await page.close();
  await browser.close();

  return pdfBuffer;
};
