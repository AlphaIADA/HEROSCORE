const puppeteer = require('puppeteer');

async function scrapeBet9jaBooking(code) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://sports.bet9ja.com/', { waitUntil: 'networkidle2' });

  await page.waitForSelector('input[placeholder="Booking Code"]');
  await page.type('input[placeholder="Booking Code"]', code);

  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Load Booking')) {
      await btn.click();
      break;
    }
  }

  await page.waitForTimeout(4000); // or wait for a slip container

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
