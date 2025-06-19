const fs = require('fs');
const path = require('path');

const LOG_FILE = path.resolve(__dirname, '../../server.log');
const ERROR_FILE = path.resolve(__dirname, '../../error.log');

function log(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, line);
  console.log(line.trim());
}

function error(err) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ERROR: ${err.stack || err}\n`;
  fs.appendFileSync(ERROR_FILE, line);
  console.error(line.trim());
}

module.exports = { log, error };
