import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

async function extractWithGemini(apiKey, html, goal) {
  if (!apiKey) {
    throw new Error('Nenhuma chave da Gemini API fornecida.');
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Analise o seguinte código HTML e extraia os dados conforme o objetivo. Retorne APENAS o array JSON, sem nenhum texto, explicação ou formatação extra como \`\`\`json. O JSON deve ser a única coisa na sua resposta.\n\nOBJETIVO: ${goal}\n\nHTML:\n${html}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error(`[AI Extractor] Erro com a Gemini API: ${error.message}`);
    throw new Error('Falha ao extrair dados do HTML com a Gemini API.');
  }
}

export async function scrapeWithAI(url, goal) {
    const geminiApiKey = process.env.GEMINI_API_KEY || '';
  
    if (geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `Extraia os seguintes dados da URL e retorne APENAS o JSON resultante.\nURL: ${url}\nObjetivo: ${goal}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (error) {
        throw new Error(`A API da IA falhou. Detalhe: ${error.message}`);
      }
    }
    
    throw new Error('Nenhuma chave de API da IA foi configurada corretamente.');
}

export { extractWithGemini };