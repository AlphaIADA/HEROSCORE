const { similarity } = require('./matchMapper');

const MARKET_MAP = {
  'GG': 'Both Teams To Score - Yes',
  'Over 2.5': 'Total Goals Over 2.5',
};

/**
 * Translate a Bet9ja market description to the closest Betway equivalent.
 * If an exact mapping isn't found, the most similar known market is used.
 *
 * @param {string} bet9jaMarket - Market string scraped from Bet9ja
 * @returns {string} Betway market name
 */
function translateMarket(bet9jaMarket) {
  if (!bet9jaMarket) return '';

  if (MARKET_MAP[bet9jaMarket]) {
    return MARKET_MAP[bet9jaMarket];
  }

  let bestKey = null;
  let bestScore = -1;

  for (const key of Object.keys(MARKET_MAP)) {
    const score = similarity(bet9jaMarket.toLowerCase(), key.toLowerCase());
    if (score > bestScore) {
      bestScore = score;
      bestKey = key;
    }
  }

  return MARKET_MAP[bestKey] || bet9jaMarket;
}

module.exports = { translateMarket };
