import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { scrape } from './core/scraper.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.post('/scrape', async (req, res) => {
  const { url, mode, adapter, goal } = req.body;
  console.log(`[Server] INICIANDO REQUISIÇÃO: URL=${url}, Modo=${mode}, Adapter=${adapter || 'Nenhum'}`);
  
  try {
    const result = await scrape({ url, mode, adapter, goal });
    const resultCount = Array.isArray(result) ? result.length : (result ? 1 : 0);
    console.log(`[Server] SUCESSO: Enviando ${resultCount} item(s) como resposta.`);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(`[Server] ERRO FATAL na rota /scrape para URL: ${url}`);
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.send('API rodando! 🌐');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
