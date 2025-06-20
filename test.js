const { scrapeBet9jaBooking } = require('./src/services/bet9jaScraper');

(async () => {
  const result = await scrapeBet9jaBooking('357CN9L');
  console.log(JSON.stringify(result, null, 2));
})();
