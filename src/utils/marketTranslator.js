// Utility to translate Bet9ja betting market names to their Betway equivalents.

// Map of Bet9ja market identifiers to Betway market descriptions. Add to this
// object as needed when new markets need to be supported.
const marketMap = {
  "GG": "Both Teams To Score - Yes",
  "Over 2.5": "Total Goals Over 2.5",
  "1X": "Double Chance - Home or Draw"
  // Add more mappings
};

// Translate a single market string. Returns "Unknown Market" if no mapping is
// found.
const translateMarket = (market) => {
  if (!market) return "Unknown Market";
  return marketMap[market.trim()] || "Unknown Market";
};

module.exports = { translateMarket };
