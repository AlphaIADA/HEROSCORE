require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const converterRoutes = require('./src/routes/converterRoutes');
const { scrapeBet9ja } = require('./src/services/bet9jaScraper');
const { convertToBetway } = require('./src/services/betwayConverter');

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

  if (platformFrom === 'bet9ja' && platformTo === 'betway') {
    try {
      const betSlip = await scrapeBet9ja(bookingCode);
      const betwayData = await convertToBetway(betSlip);
      return res.json(betwayData);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(400).json({ error: 'Conversion not supported' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
