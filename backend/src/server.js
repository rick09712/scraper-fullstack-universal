import express from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import { scrapeWithAI } from "./utils/ai.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();
puppeteer.use(stealth());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get("/health", (req, res) => {
  res.json({ success: true, message: "Backend ativo" });
});

app.post("/scrape", async (req, res) => {
  const { url, mode = "auto", adapter, goal } = req.body;
  if (!url) return res.status(400).json({ success: false, error: "URL obrigatória" });

  try {
    let html = "";

    if (mode === "static" || mode === "auto") {
      const { data } = await axios.get(url);
      html = data;
    } else if (mode === "browser") {
      const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
      html = await page.content();
      await browser.close();
    } else if (mode === "ai") {
      const result = await scrapeWithAI(url, goal);
      return res.json({ success: true, data: result });
    }

    let data = [];
    if (adapter) {
      const adapterPath = path.join(__dirname, "adapters", `${adapter}.js`);
      if (fs.existsSync(adapterPath)) {
        const adapterModule = await import(`./adapters/${adapter}.js`);
        data = adapterModule.default({ html });
      } else {
        return res.status(400).json({ success: false, error: `Adapter ${adapter} não encontrado` });
      }
    } else {
      const $ = cheerio.load(html);
      const links = [];
      $("a").each((_, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr("href");
        if (text && href) links.push({ text, href });
      });
      data = links.slice(0, 20);
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
