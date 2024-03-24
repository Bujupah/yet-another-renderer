const { existsSync } = require('fs');

const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || 'chrome/win64-122.0.6261.128/chrome-win64/chrome.exe'

// check if file exists
if (!existsSync(executablePath)) {
  console.warn('No chrome/headless found')
  console.warn('Run `npm run get:chrome` to download the latest version of chrome/headless\n')
  process.exit(1)
}

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  defaultProduct: 'chrome',
  executablePath: executablePath,
  skipDownload: true,
  skipChromeDownload: true,
  skipChromeHeadlessShellDownload: true,

};

