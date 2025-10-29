import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const isProduction = process.env.NODE_ENV === 'production';

const blockedResourceTypes = ['image', 'media', 'font', 'ping', 'other'];
const skippedDomains = [
  'google-analytics.com',
  'googletagmanager.com',
  'doubleclick.net',
  'facebook.net',
  'fbcdn.net',
  'twitter.com',
  'youtube.com',
  'googleapis.com',
  'gstatic.com',
  'nr-data.net'
];

export async function scrapeWithBrowser(url, adapterName) {
  console.log('[Browser] Lançando navegador camuflado...');
  let browser = null;
  let page = null;

  try {
  
    let executablePath;
    let launchArgs = [
      ...chromium.args,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1920x1080'
    ];
    let headlessMode = chromium.headless;

    if (isProduction) {
      console.log('[Browser] Usando Chromium otimizado para produção.');
      executablePath = await chromium.executablePath();
      launchArgs.push(
        '--single-process',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      );
    } else {
      let localPath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
      if (!await fs.stat(localPath).catch(() => null)) {
        localPath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
      }

      if (await fs.stat(localPath).catch(() => null)) {
        console.log('[Browser] Usando Chrome local.');
        executablePath = localPath;
      } else {
        console.log('[Browser] Aviso: Chrome local não encontrado. Usando Chromium padrão.');
        executablePath = await chromium.executablePath();
        headlessMode = 'new';
      }

      launchArgs = ['--no-sandbox', '--disable-setuid-sandbox'];
      headlessMode = 'new';
    }


    browser = await puppeteer.launch({
      executablePath,
      headless: headlessMode,
      args: launchArgs,
      ignoreHTTPSErrors: true,
      defaultViewport: chromium.defaultViewport,
    });

    page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setRequestInterception(true);

    page.on('request', (req) => {
      const resourceType = req.resourceType();
      const requestUrl = req.url();
      if (
        blockedResourceTypes.includes(resourceType) ||
        skippedDomains.some(domain => requestUrl.includes(domain))
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    console.log(`[Browser] Navegando para: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    console.log('[Browser] Navegação concluída.');

    
    try {
      const cookieButtonSelector = 'button[data-testid="action:understood-button"]';
      await page.waitForSelector(cookieButtonSelector, { timeout: 5000 });
      await page.click(cookieButtonSelector);
      console.log('[Browser] Banner de cookies fechado.');
    } catch {}

    try {
      const cepCloseButtonSelector = 'button[aria-label*="Fechar"], button.andes-button--secondary';
      await page.waitForSelector(cepCloseButtonSelector, { timeout: 5000 });
      await page.click(cepCloseButtonSelector);
      console.log('[Browser] Pop-up do CEP fechado.');
    } catch {}

    await new Promise(r => setTimeout(r, 1000));

    
    const mainSelector = '.ui-search-layout__item';
    try {
      await page.waitForSelector(mainSelector, { timeout: 15000 });
      console.log('[Browser] Seletor encontrado com sucesso!');
    } catch (e) {
      console.error(`[Browser] Erro ao esperar pelo seletor principal: ${e.message}`);
    }

    const htmlContent = await page.content();

   
    if (adapterName === 'mercadolivre.com.br' && !isProduction) {
      const htmlPath = path.resolve(__dirname, '..', 'debug_ml_content.html');
      await fs.writeFile(htmlPath, htmlContent);
    }

  
    if (adapterName) {
      const adapterModule = await import(`../adapters/${adapterName}.js`);
      const adapter = adapterModule.default;
      return adapter({ html: htmlContent });
    }

    return { html: htmlContent };

  } catch (error) {
    if (page && !isProduction) {
      try {
        const errorScreenshotPath = path.resolve(__dirname, '..', 'debug_ml_error_screenshot.png');
        await page.screenshot({ path: errorScreenshotPath, fullPage: true });
      } catch {}
    }
    throw new Error(`Falha ao carregar ou processar a URL com o navegador: ${error.message}`);
  } finally {
    if (browser) await browser.close();
  }
}
