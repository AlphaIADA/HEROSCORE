const axios = require('axios');
const { mapMatches } = require('../utils/matchMapper');
const { translateMarket } = require('../utils/marketTranslator');

async function convertToBetway(betSlip) {
  // Placeholder conversion logic
  const convertedBets = betSlip.bets.map(bet => ({
    homeTeam: bet.homeTeam,
    awayTeam: bet.awayTeam,
    market: translateMarket(bet.market),
    odds: bet.odds
  }));

  // Example: would send data to Betway API here
  return {
    bookingCode: betSlip.bookingCode,
    bets: convertedBets
  };
}

module.exports = { convertToBetway };
