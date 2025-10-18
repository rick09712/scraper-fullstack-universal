import * as cheerio from 'cheerio';

export default function(htmlContent) {
  const products = [];
  const $ = cheerio.load(htmlContent);

  const scriptContent = $('#__PRELOADED_STATE__').html();
  
  if (!scriptContent) {
    console.log('[Adapter ML] Erro Fatal: O script __PRELOADED_STATE__ não foi encontrado no HTML.');
    return [];
  }

  try {
    const preloadedState = JSON.parse(scriptContent);
    // Este é o caminho correto para os resultados, baseado no seu arquivo HTML
    const results = preloadedState.pageState.initialState.results;

    if (!results || !Array.isArray(results)) {
      console.log('[Adapter ML] Erro: A chave "results" não foi encontrada no caminho correto (pageState.initialState.results).');
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
    console.error('[Adapter ML] Erro crítico ao processar o JSON:', e.message);
    return [];
  }

  console.log(`[Adapter ML] Análise finalizada. Produtos extraídos com sucesso: ${products.length}`);
  return products;
}