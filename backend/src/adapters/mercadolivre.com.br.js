import axios from 'axios';


const API_URL = 'https://api.mercadolivre.com/sites/MLB/search'; 

export default async function({ url }) {
  const products = [];
  let query = 'notebook';
  
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    
    const pathParts = urlObj.pathname.split('/');
    query = pathParts.pop() || pathParts.pop() || 'notebook';
    
    if (query.includes('_')) {
        query = query.split('_')[0];
    }

  } catch (e) {
    query = 'notebook';
  }

  try {
    const response = await axios.get(API_URL, {
      params: {
        q: query,
        limit: 50
      },
     
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        
        'Host': 'api.mercadolivre.com'
      },
      timeout: 15000 
    });

    const results = response.data.results;

    if (!results || results.length === 0) {
      return [];
    }
    
   

    results.forEach(item => {
      if (item.price && item.permalink) {
        const title = item.title.trim();
        
        let priceText = 'Preço não disponível';
        if (item.price) {
            priceText = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: item.currency_id }).format(item.price);
        }

        products.push({
          title,
          price: priceText,
          link: item.permalink,
        });
      }
    });

  } catch (error) {
    
    if (error.message.includes('getaddrinfo ENOTFOUND')) {
        throw new Error("Falha no processo de scraping: O servidor de hospedagem (Render) não está conseguindo resolver o endereço da API do Mercado Livre. O problema está na rede do Render.");
    }
    throw new Error(`Falha ao conectar ou processar a API do Mercado Livre: ${error.message}`);
  }

  return products;
}