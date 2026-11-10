const fs = require('fs');

function dumpTable(filename) {
  console.log('====================================');
  console.log('TABLE OF:', filename);
  const html = fs.readFileSync(filename, 'utf8');
  const tMatch = html.match(/<table[\s\S]*?<\/table>/i);
  if (tMatch) {
    const trRegex = /<tr[\s\S]*?<\/tr>/gi;
    let tr;
    while ((tr = trRegex.exec(tMatch[0])) !== null) {
      const tdRegex = /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi;
      let td;
      const row = [];
      while ((td = tdRegex.exec(tr[0])) !== null) {
        const raw = td[1];
        const linkMatch = raw.match(/href=["']([^"']+)["']/i);
        const text = raw.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#8211;/g, '-').replace(/&nbsp;/g, ' ').trim();
        row.push({ text, url: linkMatch ? linkMatch[1] : null });
      }
      if (row.length > 0) console.log(JSON.stringify(row));
    }
  } else {
    console.log('No table');
  }
}

dumpTable('live_faqs.html');
dumpTable('live_quick_links.html');
