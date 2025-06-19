const express = require('express');
const router = express.Router();
const { scrapeBet9ja } = require('../services/bet9jaScraper');
const { convertToBetway } = require('../services/betwayConverter');

router.post('/convert', async (req, res) => {
  const { bookingCode } = req.body;
  if (!bookingCode) {
    return res.status(400).json({ error: 'Booking code is required' });
  }
  try {
    const betSlip = await scrapeBet9ja(bookingCode);
    const betwayData = await convertToBetway(betSlip);
    res.json(betwayData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
