const { matchTeams } = require('../utils/matchMapper');
const { translateMarket } = require('../utils/marketTranslator');

const betwayFixtureList = [
  { homeTeam: "Chelsea", awayTeam: "Arsenal" },
  { homeTeam: "Manchester United", awayTeam: "Liverpool" }
];

function convertToBetwayFormat(bet9jaSlip) {
  const output = [];

  for (const bet of bet9jaSlip.bets) {
    const matched = matchTeams(bet.homeTeam, bet.awayTeam, betwayFixtureList);
    const market = translateMarket(bet.market);

    if (matched && market !== "Unknown Market") {
      output.push({
        homeTeam: matched.homeTeam,
        awayTeam: matched.awayTeam,
        market,
        selection: "Auto-Mapped",
        odds: bet.odds
      });
    } else {
      output.push({
        homeTeam: bet.homeTeam,
        awayTeam: bet.awayTeam,
        market: "Not found or not supported",
        status: "error"
      });
    }
  }

  return {
    platform: "Betway",
    convertedFrom: bet9jaSlip.bookingCode,
    status: "partial",
    bets: output
  };
}

module.exports = { convertToBetwayFormat };
