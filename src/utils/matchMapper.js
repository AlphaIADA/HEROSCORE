/**
 * Normalize a team name to a canonical form recognised by Betway.
 * Basic replacements are handled here; additional names can be added as
 * needed.  The comparison performed by mapMatches uses these normalized
 * versions to improve fuzzy matching accuracy.
 */
function normalizeTeamName(name) {
  if (!name) return '';

  const replacements = {
    'man utd': 'manchester united',
    'man united': 'manchester united',
    'man city': 'manchester city',
    'psg': 'paris saint germain',
    'spurs': 'tottenham hotspur',
  };

  const key = name.toLowerCase().replace(/\./g, '').trim();
  return replacements[key] || name;
}

/**
 * Compute Levenshtein distance between two strings.  This implementation is
 * intentionally simple and avoids external dependencies so it can run in
 * restricted environments.
 */
function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

/**
 * Convert distance to a similarity score between 0 and 1
 */
function similarity(a, b) {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const distance = levenshtein(a, b);
  return 1 - distance / Math.max(a.length, b.length);
}

/**
 * Attempt to find the Betway event that best matches a Bet9ja event using
 * fuzzy string comparison.  Both home and away team names are normalised and
 * compared along with league and time information if provided.
 *
 * @param {Object} bet9jaEvent  - Event scraped from Bet9ja
 * @param {Array<Object>} betwayEvents - List of Betway events to compare
 * @returns {Object|null} The best matching Betway event or null if none score
 *                        above the threshold
 */
function mapMatches(bet9jaEvent, betwayEvents = []) {
  if (!bet9jaEvent) return null;

  const bet9jaString = [
    normalizeTeamName(bet9jaEvent.homeTeam),
    normalizeTeamName(bet9jaEvent.awayTeam),
    bet9jaEvent.league || '',
    bet9jaEvent.time || ''
  ]
    .join(' ')
    .trim();

  let bestMatch = null;
  let bestScore = 0;

  for (const event of betwayEvents) {
    const betwayString = [
      normalizeTeamName(event.homeTeam),
      normalizeTeamName(event.awayTeam),
      event.league || '',
      event.time || ''
    ]
      .join(' ')
      .trim();

    const score = similarity(bet9jaString, betwayString);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = event;
    }
  }

  // Require a reasonable match to avoid false positives
  return bestScore >= 0.5 ? bestMatch : null;
}

module.exports = { mapMatches, normalizeTeamName, similarity };
