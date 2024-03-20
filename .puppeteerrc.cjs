const { globSync } = require("glob");
const Logger = require('./dist/logger')
const pattern = "chrome/**/chrome{.exe,}";
const files = globSync(pattern, { nodir: true, absolute: true });

const logger = new Logger.default('init')

if (files.length === 0) {
  logger.warn('No chrome/headless found')
  logger.warn('Run `npm run get:chrome` to download the latest version of chrome/headless\n')
  process.exit(0)
}

const executablePath = files[0]
logger.debug('Using chrome/headless', 'path', executablePath)

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  executablePath: executablePath,
};

