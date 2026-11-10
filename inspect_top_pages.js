const fs = require('fs');

const files = [
  'live_gallery.html',
  'live_contact.html',
  'live_donate.html',
  'live_news.html',
  'live_faqs.html',
  'live_quick_links.html'
];

files.forEach(f => {
  console.log('====================================');
  console.log('FILE:', f);
  if (!fs.existsSync(f)) {
    console.log('File does not exist');
    return;
  }
  const html = fs.readFileSync(f, 'utf8');

  // Title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  console.log('Title:', titleMatch ? titleMatch[1] : 'None');

  // Tables
  const tableMatches = html.match(/<table[\s\S]*?<\/table>/gi);
  console.log('Tables found:', tableMatches ? tableMatches.length : 0);

  // Links
  const links = [];
  const linkRegex = /href=["']([^"']*(?:drive\.google|\.pdf|\.docx?|usp=)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let lm;
  while ((lm = linkRegex.exec(html)) !== null) {
    links.push({ url: lm[1], text: lm[2].replace(/<[^>]+>/g, '').trim() });
  }
  console.log('Drive/PDF Links found:', links.length);
  if (links.length > 0) {
    console.log('Sample links:', links.slice(0, 3));
  }

  // Text between title and footer
  const titleIdx = html.indexOf('wp-block-kubio-page-title');
  const footerIdx = html.indexOf('wp-block-kubio-footer');
  if (titleIdx !== -1 && footerIdx !== -1) {
    const textOnly = html.slice(titleIdx, footerIdx)
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '\n')
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.includes('wp-block'));
    console.log('Text lines count:', textOnly.length);
    console.log('Sample lines (first 5):', textOnly.slice(0, 5));
  } else {
    console.log('No kubio page title found, searching content...');
  }
});
