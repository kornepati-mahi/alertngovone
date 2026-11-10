const fs = require('fs');

// Fetch home page of alertngo.in to inspect header layout
// Let's inspect the HTML of achievements.html where menu-donate-us was found
if (fs.existsSync('achievements.html')) {
  const html = fs.readFileSync('achievements.html', 'utf8');
  const idx = html.indexOf('menu-donate-us');
  console.log('500 chars before menu-donate-us:');
  console.log(html.slice(Math.max(0, idx - 500), idx));
  console.log('500 chars after menu-donate-us:');
  console.log(html.slice(idx, idx + 500));
} else {
  console.log('achievements.html does not exist');
}
