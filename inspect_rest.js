const fs = require('fs');

['live_news.html', 'live_gallery.html', 'live_contact.html', 'live_donate.html'].forEach(filename => {
  console.log('====================================');
  console.log('FILE:', filename);
  const html = fs.readFileSync(filename, 'utf8');

  // Look for text in articles, posts, headings
  const posts = html.match(/<article[\s\S]*?<\/article>/gi) || [];
  console.log('Articles found:', posts.length);

  const headings = html.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi) || [];
  console.log('Headings:', headings.map(h => h.replace(/<[^>]+>/g, '').trim()));

  // Find images
  const imgs = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let im;
  while ((im = imgRegex.exec(html)) !== null) {
    if (im[1].includes('uploads')) imgs.push(im[1]);
  }
  console.log('Upload images found:', imgs.length);
  if (imgs.length > 0) console.log('Sample images:', imgs.slice(0, 5));
});
