const fs = require('fs');

const files = [
  'live_gallery.html',
  'live_contact.html',
  'live_donate.html',
  'live_news.html',
  'live_faqs.html',
  'live_quick_links.html'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    const html = fs.readFileSync(file, 'utf8');
    console.log(`=== ${file} (${html.length} bytes) ===`);
    
    // Find title or h1/h2
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    console.log('Title:', titleMatch ? titleMatch[1] : 'No title');
    
    // Check images if gallery
    if (file === 'live_gallery.html') {
      const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)]
        .map(m => m[1])
        .filter(src => !src.includes('logo') && !src.includes('svg') && !src.includes('gravatar') && !src.includes('plugins') && !src.includes('themes'));
      console.log('Gallery image count:', imgMatches.length);
      console.log('Sample images:', imgMatches.slice(0, 5));
    }
    
    // Check contact content
    if (file === 'live_contact.html') {
      // Look for text, address, emails, phones
      const emails = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
      const phones = html.match(/(?:\+91|0)?[6-9]\d{9}/g) || [];
      console.log('Emails found:', [...new Set(emails)]);
      console.log('Phones found:', [...new Set(phones)]);
    }

    // Check donate content
    if (file === 'live_donate.html') {
      const bankDetails = html.match(/(?:SBI|State Bank|Account|IFSC|Branch|UPI)[^<]{0,100}/gi) || [];
      console.log('Bank/donation keywords:', bankDetails.slice(0, 5));
    }

    // Check news content
    if (file === 'live_news.html') {
      const headings = [...html.matchAll(/<h[234][^>]*>([\s\S]*?)<\/h[234]>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);
      console.log('News headings:', headings.slice(0, 10));
    }
  } else {
    console.log(`=== ${file} DOES NOT EXIST ===`);
  }
}
