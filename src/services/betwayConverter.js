const { translateMarket } = require('../utils/marketTranslator');
const SimpleCache = require('../utils/simpleCache');
const { log } = require('../utils/logger');

const cache = new SimpleCache(5 * 60 * 1000);

/**
 * Convert a Bet9ja bet slip into a Betway compatible format.
 * A simple pre-filled URL is generated using the converted bets.
 *
 * @param {Object} betSlip - Bet9ja bet slip { bookingCode, bets }
 * @returns {Object} structured bet slip for Betway
 */
async function convertToBetway(betSlip) {
  if (!betSlip || !Array.isArray(betSlip.bets)) {
    throw new Error('Invalid bet slip supplied');
  }

  const cacheKey = JSON.stringify(betSlip);
  const cached = cache.get(cacheKey);
  if (cached) {
    log(`Betway convert cache hit for ${betSlip.bookingCode}`);
    return cached;
  }

  const bets = betSlip.bets.map(bet => {
    if (!bet.homeTeam || !bet.awayTeam) {
      throw new Error('Game not found on Betway');
    }
    const translated = translateMarket(bet.market);
    if (!translated || translated === bet.market) {
      throw new Error(`Market not found on Betway: ${bet.market}`);
    }
    let market = translated;
    let selection = '';

    // Split market and selection if provided in the translator output
    if (typeof translated === 'string' && translated.includes(' - ')) {
      const parts = translated.split(' - ');
      market = parts[0];
      selection = parts[1] || '';
    }

    return {
      homeTeam: bet.homeTeam,
      awayTeam: bet.awayTeam,
      market,
      selection,
    };
  });

  // Generate a naive pre-filled URL representation
  const urlBase = 'https://www.betway.com.ng/betslip?bets=';
  const url = urlBase + encodeURIComponent(JSON.stringify(bets));

  const result = {
    platform: 'Betway',
    status: 'converted',
    bets,
    url,
  };
  cache.set(cacheKey, result);
  return result;
}

module.exports = { convertToBetway };
