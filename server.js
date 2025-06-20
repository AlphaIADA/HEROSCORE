require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const converterRoutes = require('./src/routes/converterRoutes');
const { scrapeBet9ja } = require('./src/services/bet9jaScraper');
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
  const { platformFrom, platformTo, bookingCode } = req.body;

  if (!platformFrom || !platformTo || !bookingCode) {
    return res
      .status(400)
      .json({ error: 'platformFrom, platformTo and bookingCode are required' });
  }

  const scrapers = {
    bet9ja: scrapeBet9ja,
    '1xbet': scrape1xBet,
    sportybet: scrapeSportybet,
    betnaija: scrapeBetnaija,
    stake: scrapeStake,
  };

  const converters = {
    betway: convertToBetwayFormat,
  };

  const scrapeFn = scrapers[platformFrom];
  const convertFn = converters[platformTo];

  if (!scrapeFn || !convertFn) {
    return res.status(400).json({ error: 'Conversion not supported' });
  }

  try {
    log(`Converting ${bookingCode} from ${platformFrom} to ${platformTo}`);
    const betSlip = await scrapeFn(bookingCode);
    const converted = await convertFn(betSlip);
    return res.json(converted);
  } catch (err) {
    logError(err);
    return res.status(500).json({ error: err.message });
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
    bet9ja: scrapeBet9ja,
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
