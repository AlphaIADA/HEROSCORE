const puppeteer = require('puppeteer');
const SimpleCache = require('../utils/simpleCache');
const { log } = require('../utils/logger');

const cache = new SimpleCache(5 * 60 * 1000); // 5 minute cache

async function scrapeBet9ja(bookingCode) {
  const cached = cache.get(bookingCode);
  if (cached) {
    log(`Bet9ja cache hit for ${bookingCode}`);
    return cached;
  }

  const url =
    'https://web.bet9ja.com/Sport/Game.aspx?ids=1&bookingCode=' + bookingCode;
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  log(`Scraping Bet9ja for ${bookingCode}`);
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Wait for bet slip container to appear
  await page.waitForSelector('.coupon-area');

  const bets = await page.evaluate(() => {
    const rows = document.querySelectorAll('.coupon-area .eventrow');
    const results = [];
    rows.forEach(row => {
      const teams = row.querySelector('.event-title')?.textContent.trim() || '';
      const [homeTeam, awayTeam] = teams.split(' vs ');
      const market = row.querySelector('.market')?.textContent.trim() || '';
      const oddsText = row.querySelector('.selection .price')?.textContent.trim() || '';
      const odds = parseFloat(oddsText);
      results.push({ homeTeam, awayTeam, market, odds });
    });
    return results;
  });

  await browser.close();
  const result = { bookingCode, bets };
  cache.set(bookingCode, result);
  return result;
}

async function scrapeBet9jaBooking(bookingCode) {
  return scrapeBet9ja(bookingCode);
}

module.exports = {
  scrapeBet9ja,
  scrapeBet9jaBooking,
};
