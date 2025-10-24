import * as cheerio from 'cheerio';

export default function(htmlContent) {
  const products = [];
  const $ = cheerio.load(htmlContent);

  
  $('.ui-search-layout__item').each((i, el) => {
    const item = $(el);

   
    const titleElement = item.find('.poly-component__title');
    
    
    const link = titleElement.attr('href');
    
    
    const priceElement = item.find('.andes-money-amount__fraction');
    
    const title = titleElement.text().trim();
    const price = priceElement.length ? `R$ ${priceElement.text().trim()}` : 'Preço não encontrado';

    
    if (title && link) {
      products.push({
        title,
        price,
        link,
      });
    }
  });

  return products;
}