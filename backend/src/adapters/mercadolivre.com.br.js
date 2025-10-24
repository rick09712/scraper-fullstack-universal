import * as cheerio from 'cheerio';

export default function(htmlContent) {
  const products = [];
  const $ = cheerio.load(htmlContent);


  $('.ui-search-result__content-wrapper').each((i, el) => {
    const item = $(el);

    const titleElement = item.find('.poly-component__title');
    const title = titleElement.text().trim();

    const link = titleElement.attr('href');
    
    const priceElement = item.find('.andes-money-amount__fraction').first();
    const price = priceElement.length ? `R$ ${priceElement.text().trim()}` : 'Preço não encontrado';

    if (title && link && price !== 'Preço não encontrado') {
      products.push({
        title,
        price,
        link,
      });
    }
  });

  
  if (products.length === 0) {
      $('.ui-search-layout__item').each((i, el) => {
        const item = $(el);
        const titleElement = item.find('.poly-component__title');
        const priceElement = item.find('.andes-money-amount__fraction').first();
        
        const title = titleElement.text().trim();
        const link = titleElement.attr('href');
        const price = priceElement.length ? `R$ ${priceElement.text().trim()}` : 'Preço não encontrado';

        if (title && link && price !== 'Preço não encontrado') {
          products.push({
            title,
            price,
            link,
          });
        }
      });
  }

  return products;
}