import axios from 'axios';


const API_URL = 'https://api.mercadolibre.com/sites/MLB/search';

export default async function({ url }) {
  const products = [];
  
 
  const urlObj = new URL(url);
  const query = urlObj.pathname.split('/').pop() || 'notebook'; 

  try {
    const response = await axios.get(API_URL, {
      params: {
        q: query, 
        limit: 50 
      },
      headers: {
        'Accept': 'application/json'
      },
      timeout: 10000
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
    throw new Error(`Falha ao conectar ou processar a API do Mercado Livre: ${error.message}`);
  }

  return products;
}