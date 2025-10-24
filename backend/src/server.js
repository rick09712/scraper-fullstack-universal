import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend rodando!");
});

app.listen(process.env.PORT || 10000, () => {
  console.log(`Backend rodando na porta ${process.env.PORT || 10000}`);
});
