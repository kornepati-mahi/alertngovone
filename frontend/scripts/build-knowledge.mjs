#!/usr/bin/env node
/**
 * Builds backend/knowledge.json — the retrieval corpus for the site chatbot.
 *
 * Everything here is read from the repo's own shipped data, so the assistant can
 * only repeat what the website actually says. Run from the frontend folder:
 *
 *   node scripts/build-knowledge.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND = path.resolve(HERE, "..");
const REPO = path.resolve(FRONTEND, "..");
const OUT = path.join(REPO, "backend", "knowledge.json");

/* ------------------------------------------------------------------ helpers */

/** Pull a top-level array literal out of a JSX/JS source file and evaluate it. */
function evalArrayLiteral(src, declaration) {
  const start = src.indexOf(declaration);
  if (start === -1) throw new Error(`Missing "${declaration}"`);
  const rest = src.slice(start + declaration.length);
  let depth = 0;
  let end = -1;
  for (let i = 0; i < rest.length; i += 1) {
    const c = rest[i];
    if (c === "[") depth += 1;
    else if (c === "]") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) throw new Error(`Unbalanced literal for "${declaration}"`);
  let literal = rest.slice(0, end + 1);
  // When the declaration already consumed the opening bracket, put it back so
  // the literal evaluates as an array rather than a block.
  if (!literal.trimStart().startsWith("[")) literal = `[${literal}]`;
  // eslint-disable-next-line no-eval
  return eval(literal);
}

const sentence = (p) => String(p || "").replace(/\s+/g, " ").trim().replace(/[.;\s]+$/, "");
const text = (...parts) => {
  const joined = parts.map(sentence).filter(Boolean).join(". ");
  return joined ? `${joined}.` : "";
};
const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();

/* -------------------------------------------------------------- 1. site data */

const pages = JSON.parse(fs.readFileSync(path.join(FRONTEND, "src/data/all_site_pages.json"), "utf8"));
const programsSrc = fs.readFileSync(path.join(FRONTEND, "src/pages/Programs.jsx"), "utf8");
const larRrSrc = fs.readFileSync(path.join(FRONTEND, "src/pages/PolavaramLaRr.jsx"), "utf8");

const literal = async (name) => {
  const mod = await import(pathToFileURL(path.join(FRONTEND, "src/api/client.js")).href);
  return mod[name];
};

const identityLit = (declaration) => evalArrayLiteral(programsSrc, declaration);

const categoryMeta = (() => {
  const src = programsSrc;
  const start = src.indexOf("const categoryMeta = {");
  const rest = src.slice(start + "const categoryMeta = ".length);
  let depth = 0;
  let end = -1;
  for (let i = 0; i < rest.length; i += 1) {
    const c = rest[i];
    if (c === "{") depth += 1;
    else if (c === "}") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  // eslint-disable-next-line no-eval
  return eval(`(${rest.slice(0, end + 1)})`);
})();

const programs = identityLit("const programs = ");

/**
 * The reference shelf literal contains JSX icon values, so it cannot be eval'd
 * here. Pull the plain string fields out of each object instead.
 */
const referenceLibrary = (() => {
  const start = larRrSrc.indexOf("const referenceLibrary = [");
  if (start === -1) return [];
  const body = larRrSrc.slice(start);
  const field = (block, key) => {
    const m = block.match(new RegExp(`${key}:\\s*"([^"]*)"`));
    return m ? m[1] : "";
  };
  const out = [];
  const re = /\{\s*\n\s*title:/g;
  const marks = [];
  let m;
  while ((m = re.exec(body))) marks.push(m.index);
  for (let i = 0; i < marks.length; i += 1) {
    const block = body.slice(marks[i], marks[i + 1] ?? marks[i] + 900);
    const entry = {
      title: field(block, "title"),
      file: field(block, "file"),
      meta: field(block, "meta"),
      size: field(block, "size"),
      chip: field(block, "chip"),
      desc: field(block, "desc")
    };
    if (entry.title && entry.file) out.push(entry);
  }
  return out;
})();

const defaultDownloads = await literal("defaultDownloads");
const defaultFaqs = await literal("defaultFaqs");
const defaultNews = await literal("defaultNews");
const defaultStats = await literal("defaultStats");

/* --------------------------------------------------------- 2. curated facts */

const ORG = {
  name: "ALERT — Association for Land Ecosystem Rights & Tribal Heritage",
  short_name: "ALERT",
  founded: "2004",
  registration: "Registered Society, Registration No. 307/2004 under the Societies Registration Act",
  tax: "Section 12A and Section 80G registered (80G receipts issued for donations)",
  fcra: "FCRA registered for receiving foreign contributions",
  headquarters: "Door No. 40-9/1-16, Sai Nagar, Near Benz Circle, Vijayawada - 520010, Andhra Pradesh, India",
  phone: "+91 866 2482345",
  whatsapp: "+91 94401 82940",
  email_general: "contact@alertngo.in",
  email_director: "director@alertngo.in",
  email_alt: "alertap.in@gmail.com",
  website: "https://alertngo.in",
  founder: "Y. L. J. B. Jayaraj (Founder Director)",
  region: "Fifth Schedule / tribal tracts of Andhra Pradesh — Alluri Sitharama Raju and Parvathipuram Manyam districts, Rampachodavaram and Chinturu ITDAs, K.R. Puram ITDA belt, and the Krishna coastal belt",
  mission: "Rights-based development for Adivasi and marginalized coastal communities: land and forest rights, rehabilitation entitlements, self-governance, livelihoods and child rights."
};

const WINGS = [
  ["Forest Rights & Land", "RoFR 2006 (IFR/CFR) claims, PESA self-governance, Andhra Pradesh Land Transfer Regulation Act 1 of 1970 restitution of alienated tribal land."],
  ["Polavaram Rehabilitation", "Land Acquisition & R&R entitlements for Project Affected Families of the Polavaram Irrigation Project under the RFCTLARR Act 2013."],
  ["Livelihoods & Women", "Antyodaya Matsya Mithra fisherwomen federation, micro-savings, indigenous millets and seed banks."],
  ["Child Rights & Education", "Bilingual education, nutrition, protection and statutory entitlements for Adivasi children."]
];

const ROUTES = [
  ["/", "Home — hero, impact figures and programme snapshot"],
  ["/about", "About ALERT — single scrolling page: who we are, approach, reach"],
  ["/programs", "Our Work — every programme with details, filterable by category"],
  ["/stories", "Stories — field stories from the teams"],
  ["/la-rr", "Land & Rights (Polavaram) — Sections 01-07: project overview, Land Acquisition Act 2013, R&R package, court cases, submergence habitations, RoFR & LTR, document archive"],
  ["/la-rr#overview", "Section 01 Polavaram Project Overview"],
  ["/la-rr#land_acquisition", "Section 02 Land Acquisition Act 2013"],
  ["/la-rr#rr_package", "Section 03 R&R Package & Colony Housing"],
  ["/la-rr#court_cases", "Section 04 Court Cases & Legal Cell"],
  ["/la-rr#submergence", "Section 05 Submergence Habitations & Maps"],
  ["/la-rr#rofr_ltr", "Section 06 RoFR & LTR Disposals"],
  ["/la-rr#archive", "Section 07 Polavaram Document Archive — catalogued pages and the statutory PDF shelf"],
  ["/all-pages?category=Polavaram%20LA%20%26%20R%26R", "Full listing of every Polavaram LA & R&R page in the document archive"],
  ["/downloads", "Downloads — bare acts, court records, FAQs and reports"],
  ["/news", "News From The Field"],
  ["/gallery", "Gallery — photographs and field videos"],
  ["/careers", "Careers & internships — openings and how to apply"],
  ["/partner", "Partner With Us — CSR, grants, foundation and in-kind partnerships"],
  ["/donate", "Donate — 80G supported giving"],
  ["/grievances", "Grievance Redressal"],
  ["/faqs", "Frequently Asked Questions"],
  ["/contact", "Contact — head office, phone, email and enquiry form"]
];

const LA_RR_SECTIONS = [
  ["Section 01 — Polavaram Project Overview", "overview", "The Polavaram (Dr. Narula Appa Rao) multipurpose project on the Godavari: extent, purpose and the communities it affects."],
  ["Section 02 — Land Acquisition Act 2013", "land_acquisition", "RFCTLARR Act 2013 entitlements — notification, survey, social impact assessment, consent, compensation and rehabilitation duties."],
  ["Section 03 — R&R Package & Colony Housing", "rr_package", "House sites, colony amenities, land-for-land, adult youth packages and the entitlements ALERT tracks for displaced families."],
  ["Section 04 — Court Cases & Legal Cell", "court_cases", "High Court writs, interim directions and the legal cell supporting project affected families."],
  ["Section 05 — Submergence Habitations & Maps", "submergence", "Submergence-area villages and habitations with maps and tabulated field data."],
  ["Section 06 — RoFR & LTR Disposals", "rofr_ltr", "Forest Rights Act and Land Transfer Regulation disposals and restitutions."],
  ["Section 07 — Polavaram Document Archive", "archive", "Every catalogued Polavaram page grouped by document type, with the statutory and reference PDF shelf. Full listing: /all-pages?category=Polavaram%20LA%20%26%20R%26R"]
];

/* ------------------------------------------------------------ 3. chunking */

const chunks = [];
const push = (id, kind, title, category, body, url) => {
  const t = clean(body);
  if (!t) return;
  chunks.push({ id, kind, title: clean(title), category: clean(category), text: t, url: url || "" });
};

// Programmes
for (const p of programs) {
  push(
    `program:${p.title}`,
    "programme",
    p.title,
    p.cat,
    text(p.desc, (p.details || []).length ? `Components: ${(p.details || []).join(", ")}` : ""),
    "/programs"
  );
}

// Programme pillars
for (const [cat, meta] of Object.entries(categoryMeta)) {
  push(`pillar:${cat}`, "pillar", cat, cat, text(meta && meta.sub), "/programs");
}

// Archived site pages (title + attached documents only — the scraped paragraphs are footer junk)
for (const [slug, page] of Object.entries(pages)) {
  const pdfs = (page.downloads || []).map((d) => clean(d.label || d.name || d.filename || d)).filter(Boolean);
  const bits = [];
  if (pdfs.length) bits.push(`Attached documents: ${pdfs.join(", ")}`);
  const tables = (page.tables || []).length;
  const imgs = (page.images || []).length;
  if (tables || imgs) bits.push(`Page contents: ${tables} data table(s), ${imgs} image(s).`);
  push(
    `page:${slug}`,
    "archived page",
    page.title || slug,
    page.category || "",
    text(`Archived site page "${page.title || slug}" in the ${page.category || "site"} section.`, bits.join(" ")),
    `/page/${slug}`
  );
}

// Downloads
for (const d of defaultDownloads || []) {
  push(
    `download:${d.file}`,
    "document",
    d.title,
    d.category || "",
    text(d.meta, "Available as a download on the Downloads page."),
    "/downloads"
  );
}

// Statutory / reference PDFs surfaced in the Land & Rights archive
for (const d of referenceLibrary || []) {
  push(
    `library:${d.file}`,
    "document",
    d.title,
    d.chip || "",
    text(d.desc, `Document type: ${d.chip || "record"}. Size on the site: ${d.size || "listed in the archive"}.`),
    "/la-rr#archive"
  );
}

// FAQs
(defaultFaqs || []).forEach((f, i) => {
  push(`faq:${i}`, "faq", f.q, "FAQ", text(f.a), "/faqs");
});

// News
(defaultNews || []).forEach((n) => {
  push(`news:${n.title}`, "news", n.title, n.tag || n.category || "", text(n.excerpt, n.date ? `Reported ${n.date}` : ""), "/news");
});

// Impact figures
const statsLine = (defaultStats || []).map((s) => `${s.metric_label}: ${s.metric_value}${s.suffix || ""}`).join("; ");
push("stats:impact", "statistics", "ALERT published impact figures", "Impact", text(statsLine, "These are the figures published on the site."), "/");

// Identity / registration / contact
push("core:identity", "organisation", "About ALERT", "Organisation", text(ORG.name, `Founded ${ORG.founded}.`, ORG.registration, ORG.tax, ORG.fcra, ORG.mission), "/about");
push("core:contact", "contact", "ALERT office, phone and email", "Contact", text(`Head office: ${ORG.headquarters}`, `Phone ${ORG.phone}`, `Mobile / WhatsApp ${ORG.whatsapp}`, `Email ${ORG.email_general} or ${ORG.email_director} (also ${ORG.email_alt}).`, `Founder Director: ${ORG.founder}`, `Website ${ORG.website}`), "/contact");
push("core:wings", "structure", "The four wings of ALERT's work", "Programmes", text(WINGS.map((w) => `${w[0]}: ${w[1]}`).join(" ")), "/programs");
push("core:region", "geography", "Where ALERT works", "Coverage", text(ORG.region), "/about");
push("core:routes", "navigation", "Where to find each part of this website", "Site map", text(ROUTES.map((r) => `${r[0]} — ${r[1]}`).join(" ")), "/");
push("core:larar", "navigation", "Land & Rights (Polavaram) page structure", "Site map", text(LA_RR_SECTIONS.map((s) => `${s[0]} (#${s[1]}): ${s[2]}`).join(" ")), "/la-rr");
push("core:donate", "support", "Donating and partnering with ALERT", "Support", text("Donations are 80G tax-exempt and receipted.", "Institutional, CSR, FCRA grant and in-kind partnerships are handled on the Partner With Us page.", "Careers and internships are listed on the Careers page; applications go to contact@alertngo.in."), "/donate");

/* ------------------------------------------------------------------ 4. emit */

const knowledge = {
  meta: {
    organisation: ORG,
    site_base_paths: ROUTES.map((r) => r[0]),
    generated_from: [
      "frontend/src/data/all_site_pages.json",
      "frontend/src/api/client.js",
      "frontend/src/pages/Programs.jsx",
      "frontend/src/pages/PolavaramLaRr.jsx",
      "curated ALERT identifiers"
    ],
    generated_at: new Date().toISOString(),
    chunk_count: chunks.length
  },
  sections: LA_RR_SECTIONS.map(([title, id, blurb]) => ({ title, id, blurb })),
  routes: ROUTES.map(([path_, label]) => ({ path: path_, label })),
  chunks
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(knowledge, null, 2), "utf8");

const kb = Math.round(JSON.stringify(knowledge).length / 1024);
process.stdout.write(`knowledge.json: ${chunks.length} chunks, ~${kb} kB → ${OUT}\n`);
