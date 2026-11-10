const fs = require('fs');
const html = fs.readFileSync('home.html', 'utf8');

const regex = /background-color:[^;]+/gi;
const bgMatches = [...html.matchAll(regex)].map(m => m[0]);
console.log('Sample background-colors:', [...new Set(bgMatches)].slice(0, 15));
