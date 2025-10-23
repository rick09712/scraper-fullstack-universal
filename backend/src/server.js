import express from 'express';
import 'dotenv/config'; 

const app = express();


const PORT = process.env.PORT || 3000;


const openaiKey = process.env.OPENAI_API_KEYS;
const geminiKey = process.env.GEMINI_API_KEY;

app.get('/', (req, res) => {
  res.send('Backend rodando!');
});

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
