import * as cheerio from 'cheerio';


export default async function({ html }) {
  const products = [];
  
  if (!html) {
      return [];
  }
  
  const $ = cheerio.load(html);

  
  const scriptContent = $('#__PRELOADED_STATE__').html();
  
  if (!scriptContent) {
    return [];
  }

  try {
    const preloadedState = JSON.parse(scriptContent);
    
    const results = preloadedState.pageState.initialState.results;

    if (!results || !Array.isArray(results)) {
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
    return [];
  }

  return products;
}