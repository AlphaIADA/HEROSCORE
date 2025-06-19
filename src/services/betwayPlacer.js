const puppeteer = require('puppeteer');
const { log } = require('../utils/logger');

/**
 * Log in to Betway and place the provided bet slip.
 * @param {Object} betwayData - Data returned from convertToBetway
 */
async function placeBetOnBetway(betwayData) {
  const { BETWAY_USERNAME, BETWAY_PASSWORD } = process.env;
  if (!BETWAY_USERNAME || !BETWAY_PASSWORD) {
    throw new Error('Betway credentials are not set');
  }

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  log('Launching browser to place bet on Betway');

  try {
    await page.goto('https://www.betway.com.ng/', { waitUntil: 'networkidle2' });
    log('Logging into Betway');

    // Login sequence - selectors may need adjustment
    await page.waitForSelector('#LoginForm_username');
    await page.type('#LoginForm_username', BETWAY_USERNAME, { delay: 20 });
    await page.type('#LoginForm_password', BETWAY_PASSWORD, { delay: 20 });
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Open bet slip URL
    if (betwayData.url) {
      await page.goto(betwayData.url, { waitUntil: 'networkidle2' });
      log('Submitting bet slip');
      // Wait for betslip submit button - selector may vary
      await page.waitForSelector('.betslip-submit');
      await page.click('.betslip-submit');
      await page.waitForTimeout(2000);
    }
  } finally {
    await browser.close();
  }
}

module.exports = { placeBetOnBetway };
