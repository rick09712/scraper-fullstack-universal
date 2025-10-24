import axios from 'axios';
import * as cheerio from 'cheerio';
import { scrapeWithBrowser } from './browser.js';
import adapters from '../adapters/index.js';
import { scrapeWithAI } from '../utils/ai.js';

export async function scrape({ url, mode = 'auto', adapter, goal }) {
  try {
    if (mode === 'ai') {
      return await scrapeWithAI(url, goal);
    }

    
    if (adapter && adapters[adapter] && adapters[adapter].constructor.name === 'AsyncFunction') {
        const result = await adapters[adapter]({ url }); 
        if (result && result.length > 0) return result;
        
        
        if (mode !== 'auto') {
            return result;
        }
    }

    
    if (mode === 'static' || mode === 'auto') {
      try {
        const { data } = await axios.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
          timeout: 10000
        });
        
        const $ = cheerio.load(data);
        
     
        if (adapter && adapters[adapter] && adapters[adapter].constructor.name !== 'AsyncFunction') {
            return adapters[adapter]({ $ }); 
        }
        
        const title = $('title').text() || $('h1').first().text();
        const snippet = $('body').text().replace(/\s\s+/g, ' ').trim().slice(0, 400);
        return { title, snippet };
        
      } catch (err) {
        if (mode === 'auto') {
          
          const html = await scrapeWithBrowser(url);
          const $ = cheerio.load(html);
          
          if (adapter && adapters[adapter]) {
            return adapters[adapter]({ $ });
          }
          return { html };
        }
        throw err;
      }
    }

  
    if (mode === 'browser') {
      const html = await scrapeWithBrowser(url);
      const $ = cheerio.load(html);

      if (adapter && adapters[adapter]) {
        return adapters[adapter]({ $ });
      }
      return { html };
    }

    throw new Error('Modo de scraping inválido.');
  } catch (error) {
      throw new Error(`Falha no processo de scraping: ${error.message}`);
  }
}