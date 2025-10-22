import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export async function scrapeWithBrowser(url) {
  let browser;
  try {
    const executablePath =
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      process.env.PUPPETEER_CHROMIUM_PATH_FALLBACK;

    browser = await puppeteer.launch({
      headless: 'new',
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    try {
      const cookieButtonSelector = 'button[data-testid="action:understood-button"]';
      await page.waitForSelector(cookieButtonSelector, { timeout: 5000 });
      await page.click(cookieButtonSelector);
    } catch (e) {}

    try {
      const cepButtonSelector = 'button.andes-button--transparent';
      await page.waitForSelector(cepButtonSelector, { timeout: 5000 });
      await page.click(cepButtonSelector);
    } catch (e) {}

    await page.waitForSelector('.ui-search-layout__item', { timeout: 20000 });

    const html = await page.content();
    return html;

  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
