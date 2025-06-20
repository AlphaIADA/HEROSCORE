require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const converterRoutes = require('./src/routes/converterRoutes');
const { scrapeBet9jaBooking } = require('./src/services/bet9jaScraper');
const { scrape1xBet } = require('./src/services/platforms/oneXBetScraper');
const { scrapeSportybet } = require('./src/services/platforms/sportybetScraper');
const { scrapeBet9jaBooking: scrapeBetnaija } = require('./src/services/platforms/bet9jaScraper');
const { scrapeStake } = require('./src/services/platforms/stakeScraper');
const { convertToBetwayFormat } = require('./src/services/betwayConverter');
const { placeBetOnBetway } = require('./src/services/betwayPlacer');
const { log, error: logError } = require('./src/utils/logger');

const app = express();
app.use(bodyParser.json());

// Serve basic frontend
app.use(express.static('public'));

app.use('/api', converterRoutes);

app.post('/convert-ticket', async (req, res) => {
  const { bookingCode, platformFrom, platformTo } = req.body;

  console.log(`[${new Date().toISOString()}] Received convert request:`, req.body);

  try {
    if (platformFrom !== 'bet9ja' || platformTo !== 'betway') {
      return res.status(400).json({ error: 'Conversion not supported' });
    }

    const bet9jaSlip = await scrapeBet9jaBooking(bookingCode);
    console.log('SCRAPED SLIP:', bet9jaSlip);

    if (!bet9jaSlip || !bet9jaSlip.bets || bet9jaSlip.bets.length === 0) {
      return res.status(400).json({ error: 'No bets found or code is invalid' });
    }

    const converted = convertToBetwayFormat(bet9jaSlip);
    console.log('CONVERTED:', converted);

    return res.json(converted);
  } catch (err) {
    console.error('CONVERSION ERROR:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/place-bet', async (req, res) => {
  const { platformFrom, bookingCode } = req.body;

  if (!platformFrom || !bookingCode) {
    return res
      .status(400)
      .json({ error: 'platformFrom and bookingCode are required' });
  }

  const scrapers = {
    bet9ja: scrapeBet9jaBooking,
    '1xbet': scrape1xBet,
    sportybet: scrapeSportybet,
    betnaija: scrapeBetnaija,
    stake: scrapeStake,
  };

  const scrapeFn = scrapers[platformFrom];
  if (!scrapeFn) {
    return res.status(400).json({ error: 'Conversion not supported' });
  }

  try {
    log(`Placing bet from ${platformFrom} using code ${bookingCode}`);
    const betSlip = await scrapeFn(bookingCode);
    const betwayData = await convertToBetwayFormat(betSlip);
    await placeBetOnBetway(betwayData);
    return res.json({ status: 'bet placed' });
  } catch (err) {
    logError(err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  log(`Server running on port ${PORT}`);
});
