import * as cheerio from 'cheerio';

export default function(htmlContent) {
  const products = [];
  const $ = cheerio.load(htmlContent);

  
  const itemSelector = 'li.ui-search-layout__item'; 

  $(itemSelector).each((i, el) => {
    const item = $(el);

    
    const titleLinkElement = item.find('a.poly-component__title');
    
    const title = titleLinkElement.text().trim();
    const link = titleLinkElement.attr('href');
    
   
    const priceElement = item.find('.andes-money-amount__fraction').first();
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