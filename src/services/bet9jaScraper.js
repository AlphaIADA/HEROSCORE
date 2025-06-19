const puppeteer = require('puppeteer');

async function scrapeBet9ja(bookingCode) {
  const url = 'https://web.bet9ja.com/Sport/Game.aspx?ids=1&bookingCode=' + bookingCode;
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
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
  return { bookingCode, bets };
}

module.exports = { scrapeBet9ja };
