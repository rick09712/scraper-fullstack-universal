export default function({ $ }) {
    const news = [];
    
    
    $('.feed-post-body').each((i, el) => { 
        const item = $(el);

        const title = item.find('.feed-post-body-title a').text().trim();
        const link = item.find('.feed-post-body-title a').attr('href');
        const snippet = item.find('.feed-post-body-resumo').text().trim();

        if (title && link) {
            news.push({ title, link, snippet });
        }
    });

    return news;
}