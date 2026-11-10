const fs = require('fs');

const html = fs.readFileSync('home.html', 'utf8');

const idx = html.indexOf('menu-donate-us');
if (idx !== -1) {
  console.log('500 chars before menu-donate-us:');
  console.log(html.slice(Math.max(0, idx - 500), idx));
  console.log('1000 chars after menu-donate-us:');
  console.log(html.slice(idx, idx + 1000));
} else {
  console.log('menu-donate-us not found');
}
