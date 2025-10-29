import * as cheerio from 'cheerio';

export default function ({ html }) {
  const products = [];
  const $ = cheerio.load(html);
  const scriptContent = $('#__PRELOADED_STATE__').html();
  if (!scriptContent) return [];

  try {
    const preloadedState = JSON.parse(scriptContent);
    const results = preloadedState?.pageStoreState?.search?.results;
    if (!results || !Array.isArray(results)) return [];

    results.forEach(item => {
      const title =
        item.polycard?.components.find(c => c.type === 'title')?.title?.text ||
        item.title ||
        'Título não encontrado';

      const priceValue =
        item.polycard?.components.find(c => c.type === 'price')?.price?.current_price?.value || null;

      let link = null;

      if (item.permalink) {
        link = item.permalink;
      } else if (item.navigation_data?.target?.url) {
        link = item.navigation_data.target.url;
      } else if (item.polycard?.metadata?.url) {
        const possibleUrl = item.polycard.metadata.url;
        if (!possibleUrl.includes('click') && !possibleUrl.includes('mlclics')) {
          link = possibleUrl;
        }
      }

      if (!link) return;

      link = link.trim();
      link = link.replace(/^(https?:\/\/)?(www\.)?(mercadolivre\.com\.br)+/g, '');
      link = link.startsWith('/') ? link : `/${link}`;
      link = `https://www.mercadolivre.com.br${link}`;
      link = link.replace(/\/{2,}/g, '/').replace('https:/', 'https://');

      let formattedPrice = null;
      if (priceValue !== null && !isNaN(priceValue)) {
        formattedPrice = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(priceValue);
      }

      if (title && formattedPrice && link) {
        products.push({ title, price: formattedPrice, link });
      }
    });
  } catch (e) {
    console.error(`[Adapter ML] Erro crítico ao processar o JSON: ${e.message}`);
    return [];
  }

  console.log(`[Adapter ML] Produtos encontrados: ${products.length}`);
  return products;
}
