FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y \
    ca-certificates fonts-liberation libasound2 libatk1.0-0 libatk-bridge2.0-0 \
    libc6 libgcc1 libgdk-pixbuf2.0-0 libgtk-3-0 libnspr4 libnss3 libx11-6 \
    libx11-xcb1 libxcomposite1 libxdamage1 libxext6 libxrandr2 libxss1 libxtst6 wget \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY . .

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

CMD ["node", "src/server.js"]