
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import chromium from '@sparticuz/chromium';

puppeteer.use(StealthPlugin());

export async function scrapeWithBrowser(url) {
  const browser = await puppeteer.launch({ 
    args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'], 
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless, 
    ignoreHTTPSErrors: true,
  });
  
  const page = await browser.newPage();
  
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  );

  page.setDefaultNavigationTimeout(60000); 
  
  await page.setGeolocation({ latitude: 0, longitude: 0 });

  await page.goto(url, { waitUntil: 'domcontentloaded' }); 

  
  try {
      await page.click('button[data-testid="cookie-consent-button"]', { timeout: 5000 });
      
      await new Promise(r => setTimeout(r, 1000)); 
  } catch (e) {
      
  }

  
  await new Promise(r => setTimeout(r, 5000)); 

  const html = await page.content();
  await browser.close();

  return html;
}