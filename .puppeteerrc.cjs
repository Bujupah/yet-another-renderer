const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer.
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
  browserRevision: 'stable',
  defaultProduct: 'chrome',
  executablePath: join(__dirname, 'chrome', 'win64-124.0.6356.2', 'chrome-win64', 'chrome.exe'),
};

