import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import chromium from '@sparticuz/chromium';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

puppeteer.use(StealthPlugin());

const blockedResourceTypes = [
    'image',
    'media',
    'font',
    'ping',
    'other'
];

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
        let chromeExecutablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
        
        if (!await fs.stat(chromeExecutablePath).catch(() => null)) {
            chromeExecutablePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
        }
        
        if (!await fs.stat(chromeExecutablePath).catch(() => null)) {
             console.log('[Browser] Aviso: Não foi encontrado o Chrome local. Tentando o Chromium padrão...');
             chromeExecutablePath = await chromium.executablePath(); 
        }

        browser = await puppeteer.launch({
            executablePath: chromeExecutablePath,
            headless: chromium.headless,
            args: [
                ...chromium.args,
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--window-size=1920x1080'
            ],
            ignoreHTTPSErrors: true,
            defaultViewport: chromium.defaultViewport,
        });

        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setRequestInterception(true);

        page.on('request', (req) => {
            const resourceType = req.resourceType();
            const requestUrl = req.url();

            if (blockedResourceTypes.includes(resourceType) ||
                skippedDomains.some(domain => requestUrl.includes(domain))) {
                req.abort();
            } else {
                req.continue();
            }
        });

        console.log(`Navegando para: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
        console.log('[Browser] Navegação concluída.');

        try {
            console.log('[Browser] Procurando botão de cookies...');
            const cookieButtonSelector = 'button[data-testid="action:understood-button"]';
            await page.waitForSelector(cookieButtonSelector, { timeout: 5000 });
            await page.click(cookieButtonSelector);
            console.log('[Browser] Banner de cookies fechado.');
        } catch (e) {
            
        }

        try {
            console.log('[Browser] Procurando pop-up de CEP...');
            const cepCloseButtonSelector = 'button[aria-label*="Fechar"], button.andes-button--secondary';
            await page.waitForSelector(cepCloseButtonSelector, { timeout: 5000 });
            await page.click(cepCloseButtonSelector);
            console.log('[Browser] Pop-up do CEP fechado.');
        } catch (e) {
            
        }
    
       await new Promise(r => setTimeout(r, 1000));

        const mainSelector = '.ui-search-layout__item';
        console.log(`Aguardando pelo seletor: "${mainSelector}"`);
        try {
            await page.waitForSelector(mainSelector, { timeout: 15000 });
            console.log('[Browser] Seletor encontrado com sucesso!');
        } catch (e) {
            console.error(`[Browser] Erro ao esperar pelo seletor principal: ${e.message}`);
        }
        
        const htmlContent = await page.content();
        
        if (adapterName === 'mercadolivre.com.br') {
            const htmlPath = path.resolve(__dirname, '..', 'debug_ml_content.html');
            await fs.writeFile(htmlPath, htmlContent);
        }

        if (adapterName) {
            const adapterModule = await import(`../adapters/${adapterName}.js`);
            const adapter = adapterModule.default;
            const result = adapter({ html: htmlContent });
            return result;
        }

        return { html: htmlContent };

    } catch (error) {
        if (page) {
            try {
                const errorScreenshotPath = path.resolve(__dirname, '..', 'debug_ml_error_screenshot.png');
                await page.screenshot({ path: errorScreenshotPath, fullPage: true });
            } catch (ssError) {
                
            }
        }
        throw new Error(`Falha ao carregar ou processar a URL com o navegador: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}