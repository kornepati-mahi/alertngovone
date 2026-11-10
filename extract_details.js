const fs = require('fs');

function inspectFile(filename, label) {
  console.log(`\n================== ${label} (${filename}) ==================`);
  if (!fs.existsSync(filename)) {
    console.log('FILE NOT FOUND!');
    return;
  }
  const html = fs.readFileSync(filename, 'utf8');
  
  // Extract all text inside main content container if possible
  // Kubio sites usually put content in wp-site-blocks or main or article or entry-content
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '');
  
  // Find all images
  const imgs = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)]
    .map(m => m[1])
    .filter(s => s.includes('wp-content/uploads'));
  console.log('Upload Images count:', imgs.length);
  if (imgs.length > 0) {
    console.log('Sample images:', imgs.slice(0, 8));
  }

  // Find all links (especially pdfs or external links)
  const links = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map(m => ({ href: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() }))
    .filter(l => l.href && !l.href.startsWith('#') && !l.href.includes('alertngo.in/#') && l.text);
  console.log('Links count:', links.length);
  console.log('Sample links:', links.slice(0, 10));

  // Find headings
  const headings = [...html.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(Boolean);
  console.log('Headings:', headings.slice(0, 10));

  // Find paragraphs or blockquotes or cards
  const pList = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(t => t.length > 20);
  console.log('Paragraphs count:', pList.length);
  console.log('Sample paragraphs:', pList.slice(0, 5));
}

inspectFile('live_gallery.html', 'GALLERY');
inspectFile('live_contact.html', 'CONTACT US');
inspectFile('live_donate.html', 'DONATE NOW');
inspectFile('live_news.html', 'NEWS & VIEWS');
inspectFile('live_faqs.html', 'FAQS');
inspectFile('live_quick_links.html', 'QUICK LINKS');
