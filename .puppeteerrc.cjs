sconst { globSync } = require("glob");

const pattern = "chrome/**/chrome{.exe,}";
const files = globSync(pattern, { nodir: true, absolute: true });

if (files.length === 0) {
  console.warn('No chrome/headless found')
  console.warn('Run `npm run get:chrome` to download the latest version of chrome/headless\n')
  process.exit(0)
}

const executablePath = files[0]
console.debug('Using chrome/headless at', executablePath)
/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  executablePath: executablePath,
};

