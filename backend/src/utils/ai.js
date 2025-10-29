import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { scrapeWithBrowser } from '../core/browser.js';
import * as cheerio from 'cheerio';
import * as fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OPENAI_API_KEY = "";
const GEMINI_API_KEY = "";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const gemini = new GoogleGenerativeAI(GEMINI_API_KEY);

async function extractContent(url) {
    const debugPath = path.resolve(__dirname, '..', '..', 'debug_ai_content.html');
    
    let html = null;
    try {
        const browserResult = await scrapeWithBrowser(url);
        html = browserResult.html;
    } catch (e) {
        const axios = (await import('axios')).default;
        const response = await axios.get(url, { headers: { 'User-Agent': 'scraper-bot/1.0' } });
        html = response.data;
    }

    if (!html) return '';

    await fs.writeFile(debugPath, html);

    const $ = cheerio.load(html);
    
    $('script, style, header, footer, nav, img, a').remove();
    const mainContent = $('body').text().replace(/\s\s+/g, ' ').trim().slice(0, 15000);
    return mainContent;
}

async function useOpenAI(content, goal) {
    const prompt = `Você é um Web Scraper experiente. Sua tarefa é extrair dados brutos de uma página web.
    URL: ${content.url}
    HTML (Texto Principal): ${content.mainContent}
    
    Seu objetivo: ${goal}
    
    Regras de Saída:
    1. A saída DEVE ser um objeto JSON válido.
    2. Não inclua texto introdutório ou explicativo (apenas o JSON puro).
    3. Use a formatação do JSON para representar os dados extraídos.`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
    });

    const jsonString = response.choices[0].message.content.trim();
    return JSON.parse(jsonString);
}

async function useGemini(content, goal) {
    const prompt = `Você é um Web Scraper experiente. Sua tarefa é extrair dados brutos de uma página web.
    URL: ${content.url}
    HTML (Texto Principal): ${content.mainContent}
    
    Seu objetivo: ${goal}
    
    Regras de Saída:
    1. A saída DEVE ser um objeto JSON válido.
    2. Não inclua texto introdutório ou explicativo (apenas o JSON puro).
    3. Use a formatação do JSON para representar os dados extraídos.`;

    const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        price: { type: 'string' },
                        link: { type: 'string' },
                        extra: { type: 'string' }
                    },
                    required: ['title']
                }
            }
        }
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
}

export async function scrapeWithAI(url, goal) {
    const content = { url, mainContent: await extractContent(url) };
    
    let result = null;
    let lastError = null;

    // 1. Tenta OpenAI
    try {
        result = await useOpenAI(content, goal);
        return result;
    } catch (error) {
        lastError = error;
    }
    
   
    try {
        result = await useGemini(content, goal);
        return result;
    } catch (error) {
        lastError = error;
    }

    // Se ambos falharem
    throw new Error(`Ambas as APIs de IA (GPT e Gemini) falharam. Último erro: ${lastError.message}`);
}