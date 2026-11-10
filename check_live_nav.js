const fs = require('fs');

const html = fs.readFileSync('downloads_live.html', 'utf8');

// Find the nav menu on alertngo.in
const navRegex = /<nav[^>]*>([\s\S]*?)<\/nav>/gi;
let m;
while ((m = navRegex.exec(html)) !== null) {
  console.log('Found NAV:');
  const aRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let am;
  while ((am = aRegex.exec(m[0])) !== null) {
    const text = am[2].replace(/<[^>]+>/g, '').trim();
    if (text) console.log('  -', text, '->', am[1]);
  }
}
