const express = require('express');
const router = express.Router();
const { scrapeBet9ja } = require('../services/bet9jaScraper');
const { convertToBetwayFormat } = require('../services/betwayConverter');

router.post('/convert', async (req, res) => {
  const { bookingCode } = req.body;
  if (!bookingCode) {
    return res.status(400).json({ error: 'Booking code is required' });
  }
  try {
    const betSlip = await scrapeBet9ja(bookingCode);
    const betwayData = await convertToBetwayFormat(betSlip);
    res.json(betwayData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// New route for converting a Bet9ja booking code directly to a Betway slip
router.post('/convert-ticket', async (req, res) => {
  const { bookingCode } = req.body;
  if (!bookingCode) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    const bet9jaSlip = await scrapeBet9ja(bookingCode);
    if (!bet9jaSlip) {
      return res.status(500).json({ error: 'Failed to scrape booking code' });
    }
    const converted = convertToBetwayFormat(bet9jaSlip);
    return res.json(converted);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
