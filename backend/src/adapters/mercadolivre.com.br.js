import * as cheerio from 'cheerio';

export default function(htmlContent) {
  const products = [];
  const $ = cheerio.load(htmlContent);

  
  let scriptContent = null;
  
  
  scriptContent = $('#__PRELOADED_STATE__').html(); 
  
  
  if (!scriptContent) {
    $('script').each((i, el) => {
      const currentScript = $(el).html();
     
      if (currentScript && currentScript.includes('window.__PRELOADED_STATE__')) {
       
        scriptContent = currentScript.split('window.__PRELOADED_STATE__ = ')[1]?.split(';')[0]?.trim();
        return false; 
      }
    });
  }

  if (!scriptContent) {
    console.log('[Adapter ML] Erro Fatal: O bloco de dados (JSON) não foi encontrado no HTML.');
    return [];
  }

  try {
    const preloadedState = JSON.parse(scriptContent);
    
    
    const results = preloadedState.pageState?.initialState?.results || preloadedState.pageState?.search_results?.results;

    if (!results || !Array.isArray(results)) {
      console.log('[Adapter ML] Erro: A chave "results" não foi encontrada no caminho correto.');
      return [];
    }
    
    
    results.forEach(item => {
      if (item.id === 'POLYCARD' && item.polycard && item.polycard.metadata) {
        const { metadata, components } = item.polycard;

        const titleComponent = components.find(c => c.type === 'title');
        const priceComponent = components.find(c => c.type === 'price');

        if (titleComponent && priceComponent && metadata.url) {
          const title = titleComponent.title.text;
          const link = metadata.url.startsWith('http') ? metadata.url : `https://www.${metadata.url}`;
          
          let priceValue = 0;
          if (priceComponent.price && priceComponent.price.current_price) {
            priceValue = priceComponent.price.current_price.value;
          }

          const price = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(priceValue);

          products.push({
            title,
            price,
            link,
          });
        }
      }
    });
  } catch (e) {
    console.error(`[Adapter ML] Erro crítico ao processar o JSON: ${e.message}`);
    return [];
  }

  return products;
}