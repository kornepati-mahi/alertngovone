const fs = require('fs');

const html = fs.readFileSync('home.html', 'utf8');

const idx = html.indexOf('menu-donate-us');
console.log('2000 chars before menu-donate-us:');
console.log(html.slice(Math.max(0, idx - 2000), idx).replace(/<style[\s\S]*?<\/style>/gi, ''));
