export default function($) {
  return {
    title: $('h1.product-title').text().trim(),
    price: $('.price').text().trim()
  };
}