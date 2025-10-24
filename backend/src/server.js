import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { scrape } from './core/scraper.js';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/scrape', async (req, res) => {
  try {
    const result = await scrape(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Backend rodando!');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});