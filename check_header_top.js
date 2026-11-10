const fs = require('fs');

const html = fs.readFileSync('home.html', 'utf8');

// Find all elements before menu-donate-us
const idx = html.indexOf('menu-donate-us');
const headerArea = html.slice(0, idx);

// Search for logo or phone or social icons
const phoneMatch = headerArea.match(/\d{10}/);
console.log('Phone in header:', phoneMatch);

// Look for texts in the top bar / row
const allTexts = headerArea
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<[^>]+>/g, '\n')
  .split('\n')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.includes('function') && !s.includes('{'));

console.log('Header text items before menu-donate-us:');
console.log(allTexts.slice(-20));
