export default function($) {
  const headlines = [];
  const seenTitles = new Set();

  $('a.feed-post-link').each((index, element) => {
    const title = $(element).text().trim();
    const link = $(element).attr('href');
    
    if (title && link && !seenTitles.has(title)) {
      seenTitles.add(title);
      headlines.push({ title, link });
    }
  });

  return headlines;
}