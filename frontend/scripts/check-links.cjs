// Dev check: scan all internal links in src/ against App routes + fallback dataset slugs
const fs = require("fs"), path = require("path");
const d = require("../src/data/all_site_pages.json");
const slugs = new Set(Object.keys(d));
Object.values(d).forEach((p) => p.slug && slugs.add(String(p.slug).toLowerCase()));
const routes = ["", "governing-body","vision-mission-2","core-values","organizational-profile","organogram","alert-policies","area-of-operation","flood-relief-measures","2023-2","flood-relief-measures-2022","flood-relief-measures-2021-2","flood-relief-measures-2020","blankets-distribution-in-east-godavari","groceries-distribution-in-west-godavari","about","programs","stories","la-rr","grievances","downloads","news","news-views","faqs","gallery","gallery-9","careers","partner","donate","donate-now","contact","quick-links","all-pages","admin","admin/flash-news"];
const ok = new Set([...routes, ...slugs]);
const files = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) { if (f !== "node_modules" && f !== "dist") walk(p); }
    else if (/\.jsx?$/.test(f)) files.push(p);
  }
})(path.join(__dirname, "../src"));
const bad = new Map();
for (const f of files) {
  const txt = fs.readFileSync(f, "utf8");
  const re = /(?:to|href)=["'`](\/[^"'`#?]*)(?:[#?][^"'`]*)?["'`]/g;
  let m;
  while ((m = re.exec(txt))) {
    const s = m[1].slice(1).replace(/\/$/, "");
    if (!s) continue;
    if (!ok.has(s) && !bad.has(s)) bad.set(s, []);
    if (!ok.has(s)) bad.get(s).push(path.relative(process.cwd(), f));
  }
}
for (const [s, fs_] of bad) console.log("/" + s + "  <=  " + [...new Set(fs_)].join(", "));
console.log("total broken:", bad.size);
