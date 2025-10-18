# 🚀 Scraper Fullstack Universal

## 📄 Visão Geral do Projeto

Este é um projeto full-stack de uma ferramenta de web scraping universal. A aplicação permite que o usuário insira a URL de um site e extraia dados de diferentes formas, utilizando um backend robusto em Node.js e um frontend interativo em React.

O projeto foi desenvolvido para ser resiliente e adaptável, demonstrando a capacidade de lidar com diferentes tipos de sites e estruturas de dados.

---

## ✨ Funcionalidades Principais

-   **Frontend Interativo:** Interface construída com React e Vite para uma experiência de usuário rápida e moderna.
-   **Backend Poderoso:** API construída com Node.js e Express para gerenciar as requisições de scraping.
-   **Múltiplos Modos de Extração:**
    -   **Modo Estático:** Utiliza `axios` e `cheerio` para extrair dados de páginas simples (server-side rendered).
    -   **Modo Navegador:** Utiliza `puppeteer-extra` com o plugin stealth para simular um navegador real, contornar bloqueios simples e extrair dados de páginas dinâmicas (client-side rendered com JavaScript).
-   **Sistema de Adapters:** Arquitetura modular que permite criar "parsers" específicos para cada site (ex: `mercadolivre.com.br.js`), tornando a manutenção e expansão do projeto muito mais fáceis.

---

## 🛠️ Tecnologias Utilizadas

-   **Frontend:**
    -   React
    -   Vite
    -   Axios
-   **Backend:**
    -   Node.js
    -   Express
    -   Puppeteer-Extra (com Stealth Plugin)
    -   Cheerio
    -   Nodemon

---

## ⚙️ Como Rodar o Projeto Localmente

### Pré-requisitos

-   Node.js (versão 18 ou superior)
-   Navegador Google Chrome instalado

### Backend

1.  Navegue até a pasta do backend:
    ```bash
    cd backend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Crie um arquivo `.env` na pasta `backend` (pode copiar o `.env.example`) e adicione suas chaves, se necessário (ex: `GEMINI_API_KEY=SUA_CHAVE_AQUI`).
4.  Inicie o servidor:
    ```bash
    npm run dev
    ```
    O servidor estará rodando em `http://localhost:3000`.

### Frontend

1.  Abra um **novo terminal** e navegue até a pasta do frontend:
    ```bash
    cd frontend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Inicie a aplicação:
    ```bash
    npm run dev
    ```
    A aplicação estará acessível em `http://localhost:5173`.

---

## 👨‍💻 Desenvolvido por

-   **Richard V. Duarte**
-   [LinkedIn]
-   [GitHub](https://github.com/rick09712)