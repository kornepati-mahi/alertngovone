const fs = require('fs');

function inspectBody(filename, name) {
  console.log(`\n================== ${name} ==================`);
  const html = fs.readFileSync(filename, 'utf8');
  
  // Cut out between the end of the top nav/header and footer
  // On kubio, header ends before first section or wp-site-blocks
  // Let's find headings and content
  const matches = [...html.matchAll(/<(h[1-6]|p|table|iframe|img)[^>]*>([\s\S]*?)<\/\1>|<img[^>]*>/gi)];
  console.log('Total tags found:', matches.length);
  
  // Filter out navbar items
  const content = matches
    .map(m => m[0].trim())
    .filter(tag => {
      return !tag.includes('menu-item') &&
             !tag.includes('sub-menu') &&
             !tag.includes('Polavaram Irrigation Project') &&
             !tag.includes('Created with') &&
             !tag.includes('alert-logo');
    });

  console.log('Key content tags count:', content.length);
  console.log(content.slice(0, 15).join('\n'));
}

inspectBody('live_gallery.html', 'GALLERY');
inspectBody('live_contact.html', 'CONTACT US');
inspectBody('live_donate.html', 'DONATE NOW');
inspectBody('live_news.html', 'NEWS & VIEWS');
