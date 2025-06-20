const puppeteer = require('puppeteer');

async function scrapeBet9jaBooking(code) {
  const browser = await puppeteer.launch({ headless: false }); // false to visually debug
  const page = await browser.newPage();

  await page.goto('https://sports.bet9ja.com/', { waitUntil: 'networkidle2' });

  // Wait for booking code input
  await page.waitForSelector('input[placeholder="Booking Code"]');

  // Type the code
  await page.type('input[placeholder="Booking Code"]', code);

  // Click the Load Booking button
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Load Booking')) {
      await btn.click();
      break;
    }
  }

  // Wait for the betting slip container to load
  await page.waitForTimeout(4000); // or wait for a slip container

  // Scrape games
  const bets = await page.evaluate(() => {
    const games = Array.from(document.querySelectorAll('.booking-slip-container .event-row'));
    return games.map(game => {
      const teams = game.querySelector('.teams')?.textContent || '';
      const [homeTeam, awayTeam] = teams.split(' vs ');
      const market = game.querySelector('.market')?.textContent || '';
      const odds = game.querySelector('.odds')?.textContent || '';
      return {
        homeTeam: homeTeam?.trim(),
        awayTeam: awayTeam?.trim(),
        market: market.trim(),
        odds: parseFloat(odds)
      };
    });
  });

  await browser.close();
  return { bookingCode: code, bets };
}

module.exports = { scrapeBet9jaBooking };
