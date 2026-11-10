import { defaultOperationalRegions, defaultMapSettings } from "../data/defaultOperationalRegions";
import { DEFAULT_35_POLICIES, DEFAULT_COMPLIANCE_PORTAL } from "../data/defaultPolicies";
import { DEFAULT_TIMELINE_HEADER, DEFAULT_TIMELINE_METRICS, DEFAULT_MILESTONES } from "../data/defaultMilestones";

export { DEFAULT_35_POLICIES, DEFAULT_COMPLIANCE_PORTAL, DEFAULT_TIMELINE_HEADER, DEFAULT_TIMELINE_METRICS, DEFAULT_MILESTONES };

export const API_BASE = "http://127.0.0.1:8000";
const TIMEOUT_MS = 1200;

// The full 90-page fallback dataset is ~178 kB; keep it out of the landing bundle
// and only fetch it as its own chunk when a content route actually needs it.
const loadFallbackPages = () => import("../data/all_site_pages.json").then((m) => m.default);

/**
 * Universal safe GET fetcher with timeout and immediate fallback.
 * Uses native fetch — no extra HTTP library in the bundle.
 */
async function safeGet(endpoint, fallbackData) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const payload = await res.json();
      if (payload && (payload.success || payload.data || payload.page)) {
        const resolvedData = payload.data !== undefined ? payload.data : (payload.page !== undefined ? payload.page : payload);
        return {
          ...payload,
          data: resolvedData,
          page: payload.page || (resolvedData && typeof resolvedData === "object" ? resolvedData : undefined),
          source: "api",
          success: true,
        };
      }
    }
  } catch (err) {
    // Graceful fallback to compiled data
  } finally {
    clearTimeout(timer);
  }
  const isObj = fallbackData && typeof fallbackData === "object" && !Array.isArray(fallbackData);
  return {
    ...(isObj ? fallbackData : {}),
    data: fallbackData,
    page: isObj ? (fallbackData.page || fallbackData) : undefined,
    source: "local",
    success: true,
  };
}

// 1. STATS
export const defaultStats = [
  { metric_key: "acres_secured", metric_label: "Acres Forest Rights Secured", metric_value: 15000, suffix: "+" },
  { metric_key: "tribal_families", metric_label: "Adivasi Families Supported", metric_value: 25000, suffix: "+" },
  { metric_key: "polavaram_villages", metric_label: "Submergence Villages Monitored", metric_value: 371, suffix: "" },
  { metric_key: "solar_hamlets", metric_label: "Off-Grid Solar Hamlets Energized", metric_value: 75, suffix: "+" },
  { metric_key: "women_fisheries", metric_label: "Yenadi Women in Cooperatives", metric_value: 3500, suffix: "+" },
  { metric_key: "flood_relief", metric_label: "Families Emergency Relieved", metric_value: 4200, suffix: "+" }
];

export async function fetchImpactStats() {
  return safeGet("get_stats.php", defaultStats);
}

// 1b. FLASH NEWS (topbar scrolling announcements)
export const defaultFlashNews = [
  { id: 0, message: "Welcome to ALERT — latest announcements and field updates appear here." }
];

export async function fetchFlashNews() {
  const local = localStorage.getItem("alertngo_flash_news");
  const fallback = local ? JSON.parse(local) : defaultFlashNews;
  return safeGet("get_flash_news.php", fallback);
}

export const defaultHeroSlides = [
  { id: 1, image_url: "/uploads/submergence-area-map-1.jpg", subtitle: "Defending Adivasi Forest & Land Rights", is_active: 1, sort_order: 1 },
  { id: 2, image_url: "/uploads/all2023.jpeg", subtitle: "Flood Relief & Emergency Provisioning", is_active: 1, sort_order: 2 },
  { id: 3, image_url: "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg", subtitle: "Empowering Marginalized Communities", is_active: 1, sort_order: 3 },
  { id: 4, image_url: "/uploads/PHOTO-2023-02-15-19-20-55_1.jpg", subtitle: "Revitalizing Gram Sabha Self-Governance", is_active: 1, sort_order: 4 },
  { id: 5, image_url: "/uploads/WhatsApp-Image-2021-09-16-at-7.50.55-PM-1024x461.jpeg", subtitle: "Project Green Energy: Solar Future", is_active: 1, sort_order: 5 }
];

export async function fetchHeroSlides() {
  const local = localStorage.getItem("alertngo_hero_slides");
  const fallback = local ? JSON.parse(local) : defaultHeroSlides;
  return safeGet("get_hero_slides.php", fallback);
}

// 1c. ADMIN - FLASH NEWS & HERO SLIDES CRUD (requires ADMIN_KEY from backend/.env)
const ADMIN_TIMEOUT_MS = 8000;

async function adminRequest(endpoint, method, key, data) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ADMIN_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method: method.toUpperCase(),
      headers: {
        "X-Admin-Key": key || (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("alertngo_admin_key") : "") || "alertngo@123",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
      signal: controller.signal,
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      const wrapped = new Error(payload.message || `Request failed (${res.status})`);
      wrapped.status = res.status;
      throw wrapped;
    }
    return payload;
  } catch (err) {
    if (err.status !== undefined) throw err;
    const wrapped = new Error(err.name === "AbortError" ? "Request timed out" : err.message || "Request failed");
    wrapped.status = 0;
    throw wrapped;
  } finally {
    clearTimeout(timer);
  }
}

export const adminListFlashNews = (key) => adminRequest("admin_flash_news.php", "get", key);
export const adminCreateFlashNews = (key, payload) => adminRequest("admin_flash_news.php", "post", key, payload);
export const adminUpdateFlashNews = (key, payload) => adminRequest("admin_flash_news.php", "put", key, payload);
export const adminDeleteFlashNews = (key, id) => adminRequest("admin_flash_news.php", "delete", key, { id });

export const adminListHeroSlides = (key) => adminRequest("admin_hero_slides.php", "get", key);
export const adminCreateHeroSlide = (key, payload) => adminRequest("admin_hero_slides.php", "post", key, payload);
export const adminUpdateHeroSlide = (key, payload) => adminRequest("admin_hero_slides.php", "put", key, payload);
export const adminDeleteHeroSlide = (key, id) => adminRequest("admin_hero_slides.php", "delete", key, { id });

// 1d. HOME FEATURES (Our Work, Our Vision, Our Mission, etc.)
export const defaultHomeFeatures = [
  {
    id: 1,
    title: "Our Work",
    description: "ALERT, established in 2004, specializes in empowering Adivasis in the Fifth Scheduled Areas of Andhra Pradesh through rights-based approaches.",
    link_url: "/about",
    icon_name: "university",
    is_active: 1,
    sort_order: 1
  },
  {
    id: 2,
    title: "Our Vision",
    description: "Empowerment of socially excluded and marginalized communities towards prosperity and peace through constitutional rights-based development.",
    link_url: "/about",
    icon_name: "note",
    is_active: 1,
    sort_order: 2
  },
  {
    id: 3,
    title: "Our Mission",
    description: "To awaken, sensitize, organize and mobilize Adivasi communities for Self-governance, self-reliance, and sustainable environment.",
    link_url: "/about",
    icon_name: "cloud",
    is_active: 1,
    sort_order: 3
  }
];

export async function fetchHomeFeatures() {
  const local = localStorage.getItem("alertngo_home_features");
  const fallback = local ? JSON.parse(local) : defaultHomeFeatures;
  return safeGet("get_home_features.php", fallback);
}

export const adminListHomeFeatures = (key) => adminRequest("admin_home_features.php", "get", key);
export const adminCreateHomeFeature = (key, payload) => adminRequest("admin_home_features.php", "post", key, payload);
export const adminUpdateHomeFeature = (key, payload) => adminRequest("admin_home_features.php", "put", key, payload);
export const adminDeleteHomeFeature = (key, id) => adminRequest("admin_home_features.php", "delete", key, { id });

// 1e. HOME ABOUT ("Who We Are")
export const defaultHomeAbout = {
  years_number: "20+",
  years_label: "Years of Service",
  image_url: "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg",
  tag: "Who We Are",
  title: "Championing Adivasi Rights and Sustainable Development",
  lead_text: "Led by YL Jayaraj with 47 years of NGO experience, ALERT specializes in empowering Adivasis in Andhra Pradesh.",
  p1: "ALERT, established in 2004, is a South India-based not-for-profit organization headquartered in Vijayawada. The organization focuses on ensuring effective implementation of affirmative legislations, securing forest rights, and promoting self-governance.",
  p2: "ALERT partners with Adivasi Mahasabha, advocating for Adivasi rights and sustainable development, supporting thousands of acres of individual and community forest rights besides facilitating effective service delivery.",
  features: [
    "Forest Rights Secured",
    "Women Empowerment",
    "Sustainable Livelihoods",
    "Self-Governance",
    "Natural Resources",
    "Disaster Relief"
  ],
  btn1_text: "Learn More",
  btn1_link: "/about",
  btn2_text: "Get Involved",
  btn2_link: "/contact",
  impact_stats: [
    { number: "20", suffix: "+", label: "Years of Service", note: "Rooted in the Fifth Scheduled Areas since 2004" },
    { number: "25000", suffix: "+", label: "Families Impacted", note: "Adivasi households across three operating regions" },
    { number: "15000", suffix: "+", label: "Acres Forest Rights", note: "Individual and community forest titles secured" },
    { number: "371", suffix: "", label: "Habitations Defended", note: "Polavaram submergence villages under R&R advocacy" }
  ]
};

export async function fetchHomeAbout() {
  const local = localStorage.getItem("alertngo_home_about");
  const fallback = local ? JSON.parse(local) : defaultHomeAbout;
  return safeGet("get_home_about.php", fallback);
}

export const adminSaveHomeAbout = (key, payload) => adminRequest("admin_home_about.php", "post", key, payload);

// 1f. REGIONS ("Where We Work")
export const defaultRegions = [
  {
    id: 1,
    title: "ASR Hill Agency",
    tag: "Rampachodavaram & Chinturu ITDAs",
    description: "PESA Gram Sabha sovereignty, community forest rights (CFR) and individual forest pattas across the Eastern Ghats agency mandals.",
    mandals: "6 mandals",
    tribes: "Koya · Konda Reddi (PVTG) · Valmiki",
    stat: "6 Mandals",
    image_url: "/uploads/region-asr-culture.jpg",
    alt_text: "Adivasi cultural gathering in the agency hills",
    accent: "#3E8E0F",
    icon_name: "tree",
    sort_order: 1,
    is_active: 1
  },
  {
    id: 2,
    title: "Eluru Agency & Polavaram",
    tag: "K.R. Puram ITDA · Dam Belt",
    description: "LTR 1/70 land restitution, fair RFCTLARR compensation and rehabilitation support for families facing Polavaram submergence.",
    mandals: "5 mandals · 371 habitations",
    tribes: "Koya · Konda Dora · Nayaks",
    stat: "371 Habitations",
    image_url: "/uploads/submergence-area-map-1.jpg",
    alt_text: "Polavaram submergence contour map along the Godavari",
    accent: "#D97706",
    icon_name: "water",
    sort_order: 2,
    is_active: 1
  },
  {
    id: 3,
    title: "Coastal Krishna Belt",
    tag: "Machilipatnam Coastal Cell",
    description: "Land and housing entitlements for nomadic Yenadi families, the Matsya Mithra women's fisheries federation, and mangrove resilience.",
    mandals: "6 coastal mandals",
    tribes: "Yenadi · Fisher communities",
    stat: "3,500+ Women",
    image_url: "/uploads/coastal-krishna-fishing.jpg",
    alt_text: "Traditional fishing crews on the Krishna coast",
    accent: "#0ea5e9",
    icon_name: "fish",
    sort_order: 3,
    is_active: 1
  }
];

export async function fetchRegions() {
  const local = localStorage.getItem("alertngo_home_regions");
  const fallback = local ? JSON.parse(local) : defaultRegions;
  return safeGet("get_regions.php", fallback);
}

export const adminListRegions = (key) => adminRequest("admin_regions.php", "get", key);
export const adminCreateRegion = (key, payload) => adminRequest("admin_regions.php", "post", key, payload);
export const adminUpdateRegion = (key, payload) => adminRequest("admin_regions.php", "put", key, payload);
export const adminDeleteRegion = (key, id) => adminRequest("admin_regions.php", "delete", key, { id });

// 1g. TEAM MEMBERS ("Board of Directors" / "ALERT Team")
export const defaultTeamMembers = [
  {
    id: 1,
    name: "Prof. Ch. Diwakar Babu",
    role: "President",
    image_url: "/uploads/Divakar-Babu.jpg",
    img: "/uploads/Divakar-Babu.jpg",
    bio: "Renowned legal scholar, former Principal of V.R. Law College, and constitutional rights specialist guiding ALERT's legal interventions in tribal fifth-scheduled areas.",
    highlights: ["Principal VR Law College", "Constitutional Rights Expert", "Appellate Litigation Advisor"],
    quote: "Justice is non-negotiable for the indigenous forest dwelling communities.",
    badge: "Board of Directors",
    sort_order: 1,
    is_active: 1
  },
  {
    id: 2,
    name: "Mr V. Rama Krishna",
    role: "Vice President",
    image_url: "/uploads/Ramakrishna.jpg",
    img: "/uploads/Ramakrishna.jpg",
    bio: "Senior development activist specializing in rural livelihood cooperatives, grassroots agrarian sustainability, and natural resource stewardship for forest hamlets.",
    highlights: ["Rural Livelihood Cooperatives", "Community Mobilization", "Natural Resource Policy"],
    quote: "Self-reliance begins when communities govern their own indigenous land.",
    badge: "Board of Directors",
    sort_order: 2,
    is_active: 1
  },
  {
    id: 3,
    name: "Mr Y.L.J.B. Jayaraj",
    role: "Secretary & Director",
    image_url: "/uploads/jayaraj-sir.jpg",
    img: "/uploads/jayaraj-sir.jpg",
    bio: "Founder & Chief Functionary with 47+ years of grass-roots human rights, affirmative tribal advocacy, and institutional leadership across Andhra Pradesh.",
    highlights: ["47+ Years Grassroots Leadership", "FRA & PESA Enforcement Specialist", "Disaster Relief Coordinator"],
    quote: "Every tribal settlement has a constitutional right to sovereignty, dignity, and flourishing.",
    badge: "Founder & Director",
    sort_order: 3,
    is_active: 1
  },
  {
    id: 4,
    name: "Ms P. Sirisha",
    role: "Treasurer",
    image_url: "/uploads/Sirisha-1.jpg",
    img: "/uploads/Sirisha-1.jpg",
    bio: "Development finance specialist overseeing statutory financial auditing, reporting, and regulatory compliances under FCRA and Indian Income Tax regulations.",
    highlights: ["12A & 80G Compliances", "Statutory Financial Auditing", "Transparent Donor Reporting"],
    quote: "Uncompromising integrity and financial transparency are our core tenets.",
    badge: "Board of Directors",
    sort_order: 4,
    is_active: 1
  },
  {
    id: 5,
    name: "Mr J. Prasad",
    role: "Executive Member",
    image_url: "/uploads/Jillela-Prasad-1-3.png",
    img: "/uploads/Jillela-Prasad-1-3.png",
    bio: "Community organizer actively directing field campaigns on Forest Rights (RoFR 2006), GPS boundary demarcation, and Gram Sabha empowerment across Godavari agency mandals.",
    highlights: ["RoFR Patta Verification", "Gram Sabha Mobilizer", "Youth Leadership Training"],
    quote: "The Gram Sabha is the true sovereign custodian of our ancestral forests.",
    badge: "Board of Directors",
    sort_order: 5,
    is_active: 1
  },
  {
    id: 6,
    name: "Ms K.L. Nancharamma",
    role: "Executive Member",
    image_url: "/uploads/Nancharamma-1-1.png",
    img: "/uploads/Nancharamma-1-1.png",
    bio: "Indigenous community leader championing Yenadi women rights, healthcare access, and the Antyodaya Matsya Mithra fisheries cooperative federation.",
    highlights: ["Antyodaya Women Leader", "Fisheries Cooperative Builder", "Indigenous Gender Rights"],
    quote: "When women lead economic cooperatives, entire tribal habitations rise.",
    badge: "Board of Directors",
    sort_order: 6,
    is_active: 1
  },
  {
    id: 7,
    name: "Ms N. Silpa",
    role: "Executive Member",
    image_url: "/uploads/silpa-1.png",
    img: "/uploads/silpa-1.png",
    bio: "Field intervention coordinator focusing on tribal youth digital informatics, ashram school education equity, and flood disaster relief logistical operations.",
    highlights: ["Tribal Youth Informatics", "Ashram School Advocacy", "Emergency Relief Operations"],
    quote: "Education and digital access are the strongest equalizers for tribal youth.",
    badge: "Board of Directors",
    sort_order: 7,
    is_active: 1
  }
];

export async function fetchTeamMembers() {
  const local = typeof localStorage !== "undefined" ? localStorage.getItem("alertngo_team_members") : null;
  const fallback = local ? JSON.parse(local) : defaultTeamMembers;
  return safeGet("get_team.php", fallback);
}

export const adminListTeam = (key) => adminRequest("admin_team.php", "get", key);
export const adminCreateTeamMember = (key, payload) => adminRequest("admin_team.php", "post", key, payload);
export const adminUpdateTeamMember = (key, payload) => adminRequest("admin_team.php", "put", key, payload);
export const adminDeleteTeamMember = (key, id) => adminRequest("admin_team.php", "delete", key, { id });
export const adminReorderTeam = (key, payload) => adminRequest("admin_team.php", "put", key, { action: "reorder", items: payload });

export function sanitizeUploadFolder(folder, fallback = "") {
  if (!folder) return fallback;
  return folder
    .trim()
    .toLowerCase()
    .replace(/\\/g, "/")
    .replace(/\/{2,}/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-z0-9_\/-]/g, "");
}

export function adminUploadImage(key, fileOrDataUrl, folder = "", onProgress = null) {
  return new Promise(async (resolve) => {
    const adminKey = key || (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("alertngo_admin_key") : "") || "alertngo@123";
    const cleanFolder = sanitizeUploadFolder(folder, "");
    const queryParam = cleanFolder ? `?folder=${encodeURIComponent(cleanFolder)}` : "";

    if (typeof File !== "undefined" && fileOrDataUrl instanceof File) {
      // ⚡ STEP 0: Attempt 0.05-second instant local host link
      try {
        const instantRes = await adminInstantLocalAttach(fileOrDataUrl.name, fileOrDataUrl.size, cleanFolder);
        if (instantRes && instantRes.success && instantRes.url) {
          if (typeof onProgress === "function") onProgress({ loaded: fileOrDataUrl.size, total: fileOrDataUrl.size, percent: 100, instant: true });
          resolve(instantRes);
          return;
        }
      } catch (_) { }

      const formData = new FormData();
      formData.append("image", fileOrDataUrl);
      formData.append("file", fileOrDataUrl);
      formData.append("admin_key", adminKey);
      if (cleanFolder) {
        formData.append("folder", cleanFolder);
        formData.append("category", cleanFolder);
      }

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE}/admin_upload.php${queryParam}`, true);
      xhr.setRequestHeader("X-Admin-Key", adminKey);
      if (cleanFolder) xhr.setRequestHeader("X-Upload-Folder", cleanFolder);

      if (xhr.upload && typeof onProgress === "function") {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && event.total > 0) {
            const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
            onProgress({ loaded: event.loaded, total: event.total, percent });
          }
        };
      }

      xhr.onload = () => {
        try {
          const payload = JSON.parse(xhr.responseText || "{}");
          if (xhr.status >= 200 && xhr.status < 300 && payload.success && payload.url) {
            if (typeof onProgress === "function") onProgress({ loaded: fileOrDataUrl.size, total: fileOrDataUrl.size, percent: 100 });
            resolve(payload);
          } else {
            resolve({ success: false, message: payload.message || `Upload failed (HTTP ${xhr.status})` });
          }
        } catch (_) {
          resolve({ success: false, message: `Upload error: ${xhr.statusText || xhr.status}` });
        }
      };

      xhr.onerror = () => resolve({ success: false, message: "Network error during image upload." });
      xhr.timeout = 600000;
      xhr.send(formData);
    } else if (typeof fileOrDataUrl === "string" && fileOrDataUrl.startsWith("data:")) {
      try {
        const res = await fetch(`${API_BASE}/admin_upload.php${queryParam}`, {
          method: "POST",
          headers: {
            "X-Admin-Key": adminKey,
            "Content-Type": "application/json",
            ...(cleanFolder ? { "X-Upload-Folder": cleanFolder } : {}),
          },
          body: JSON.stringify({
            dataUrl: fileOrDataUrl,
            folder: cleanFolder,
            category: cleanFolder,
            admin_key: adminKey,
          }),
        });
        const payload = await res.json().catch(() => ({}));
        if (res.ok && payload && payload.success && payload.url) {
          resolve(payload);
        } else {
          resolve({ success: false, message: payload?.message || `Upload failed (HTTP ${res.status})` });
        }
      } catch (err) {
        resolve({ success: false, message: "Network error: " + (err.message || "Upload failed") });
      }
    } else {
      resolve({ success: false, message: "No valid image data provided for upload." });
    }
  });
}

export function adminUploadVideo(key, file, folder = "videos", onProgress = null) {
  return new Promise(async (resolve) => {
    const adminKey = key || (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("alertngo_admin_key") : "") || "alertngo@123";
    const cleanFolder = sanitizeUploadFolder(folder, "videos");
    const queryParam = `?folder=${encodeURIComponent(cleanFolder)}`;

    if (!(typeof File !== "undefined" && file instanceof File)) {
      resolve({ success: false, message: "No valid video file provided for upload." });
      return;
    }

    // ⚡ STEP 0: Attempt 0.05-second instant local NTFS hardlink first (less than 0.1s!)
    try {
      const instantRes = await adminInstantLocalAttach(file.name, file.size, cleanFolder);
      if (instantRes && instantRes.success && instantRes.url) {
        if (typeof onProgress === "function") {
          onProgress({ loaded: file.size, total: file.size, percent: 100, instant: true });
        }
        resolve(instantRes);
        return;
      }
    } catch (_) {
      // Fallback to chunk streamer
    }

    // For files > 10 MB (like 320 MB - 1GB+), use 4 concurrent parallel chunk uploads (25 MB chunks for large files)
    const CHUNK_SIZE = file.size > 100 * 1024 * 1024 ? 25 * 1024 * 1024 : 15 * 1024 * 1024;
    if (file.size > 10 * 1024 * 1024) {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const fileId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const chunkBytesLoaded = new Array(totalChunks).fill(0);

      const updateOverallProgress = () => {
        if (typeof onProgress !== "function") return;
        const totalLoaded = chunkBytesLoaded.reduce((a, b) => a + b, 0);
        const percent = Math.min(99, Math.round((totalLoaded / file.size) * 100));
        onProgress({ loaded: totalLoaded, total: file.size, percent });
      };

      const uploadSingleChunk = async (chunkIndex) => {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const chunkBlob = file.slice(start, end);
        const chunkSize = end - start;

        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            await new Promise((chunkResolve, chunkReject) => {
              const formData = new FormData();
              formData.append("chunk", chunkBlob, file.name);
              formData.append("file", chunkBlob, file.name);
              formData.append("video", chunkBlob, file.name);
              formData.append("chunk_index", chunkIndex.toString());
              formData.append("total_chunks", totalChunks.toString());
              formData.append("file_id", fileId);
              formData.append("original_name", file.name);
              formData.append("admin_key", adminKey);
              formData.append("folder", cleanFolder);

              const xhr = new XMLHttpRequest();
              xhr.open("POST", `${API_BASE}/admin_upload.php${queryParam}`, true);
              xhr.setRequestHeader("X-Admin-Key", adminKey);
              xhr.setRequestHeader("X-Upload-Folder", cleanFolder);

              if (xhr.upload) {
                xhr.upload.onprogress = (evt) => {
                  if (evt.lengthComputable && evt.total > 0) {
                    chunkBytesLoaded[chunkIndex] = evt.loaded;
                    updateOverallProgress();
                  }
                };
              }

              xhr.onload = () => {
                try {
                  const payload = JSON.parse(xhr.responseText || "{}");
                  if (xhr.status >= 200 && xhr.status < 300 && payload.success) {
                    chunkBytesLoaded[chunkIndex] = chunkSize;
                    updateOverallProgress();
                    chunkResolve(payload);
                  } else {
                    chunkReject(new Error(payload.message || `Chunk ${chunkIndex} failed (${xhr.status})`));
                  }
                } catch (e) {
                  chunkReject(new Error(`Chunk response error: ${xhr.statusText || xhr.status}`));
                }
              };

              xhr.onerror = () => chunkReject(new Error("Network connection error on chunk upload."));
              xhr.ontimeout = () => chunkReject(new Error("Chunk upload timed out."));
              xhr.timeout = 180000;
              xhr.send(formData);
            });
            return true;
          } catch (err) {
            if (attempt >= 2) throw err;
            await new Promise((r) => setTimeout(r, 600));
          }
        }
      };

      // 4 concurrent parallel worker streams
      const CONCURRENCY = 4;
      let nextIndex = 0;
      let hasError = null;

      const worker = async () => {
        while (nextIndex < totalChunks && !hasError) {
          const current = nextIndex++;
          try {
            await uploadSingleChunk(current);
          } catch (err) {
            hasError = err;
          }
        }
      };

      try {
        const workers = Array.from({ length: Math.min(CONCURRENCY, totalChunks) }, () => worker());
        await Promise.all(workers);

        if (hasError) {
          resolve({ success: false, message: `Upload failed: ${hasError.message}` });
          return;
        }

        // Final step: Fast server-side merge of all parallel chunks
        const mergeRes = await fetch(`${API_BASE}/admin_upload.php${queryParam}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Admin-Key": adminKey,
            "X-Upload-Folder": cleanFolder,
            Accept: "application/json"
          },
          body: JSON.stringify({
            action: "merge_chunks",
            file_id: fileId,
            total_chunks: totalChunks,
            original_name: file.name,
            folder: cleanFolder,
            admin_key: adminKey
          })
        });

        const mergePayload = await mergeRes.json().catch(() => ({}));
        if (mergeRes.ok && mergePayload && mergePayload.success && mergePayload.url) {
          if (typeof onProgress === "function") {
            onProgress({ loaded: file.size, total: file.size, percent: 100 });
          }
          resolve(mergePayload);
        } else {
          resolve({ success: false, message: mergePayload?.message || "Failed to assemble uploaded video." });
        }
      } catch (err) {
        resolve({ success: false, message: "Upload error: " + err.message });
      }
      return;
    }

    // Direct single upload for files <= 10 MB
    const formData = new FormData();
    formData.append("video", file);
    formData.append("file", file);
    formData.append("admin_key", adminKey);
    formData.append("folder", cleanFolder);
    formData.append("category", cleanFolder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/admin_upload.php${queryParam}`, true);
    xhr.setRequestHeader("X-Admin-Key", adminKey);
    xhr.setRequestHeader("X-Upload-Folder", cleanFolder);

    if (xhr.upload && typeof onProgress === "function") {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percent
          });
        }
      };
    }

    xhr.onload = () => {
      try {
        const payload = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300 && payload.success && payload.url) {
          if (typeof onProgress === "function") {
            onProgress({ loaded: file.size, total: file.size, percent: 100 });
          }
          resolve(payload);
        } else {
          resolve({
            success: false,
            message: payload.message || `Upload failed (HTTP ${xhr.status})`
          });
        }
      } catch (e) {
        resolve({ success: false, message: `Upload error: ${xhr.statusText || xhr.status}` });
      }
    };

    xhr.onerror = () => {
      resolve({ success: false, message: "Network error during video upload. Please check connection." });
    };

    xhr.ontimeout = () => {
      resolve({ success: false, message: "Upload timed out. Please try again." });
    };

    xhr.timeout = 1800000; // 30 mins
    xhr.send(formData);
  });
}

export async function adminListFolderFiles(folder = "achievements", type = "", slug = "") {
  const cleanFolder = sanitizeUploadFolder(folder, "achievements");
  const adminKey = (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("alertngo_admin_key") : "") || "alertngo@123";
  try {
    const params = new URLSearchParams({
      action: "list_files",
      folder: cleanFolder,
      ...(type ? { type } : {}),
      ...(slug ? { slug } : {})
    });
    const res = await fetch(`${API_BASE}/admin_upload.php?${params.toString()}`, {
      headers: {
        "X-Admin-Key": adminKey,
        Accept: "application/json"
      }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("Error listing folder files:", err);
  }
  return { success: false, files: [] };
}

export async function adminAttachLocalFile(filename, folder = "achievements", url = "") {
  const cleanFolder = sanitizeUploadFolder(folder, "achievements");
  const adminKey = (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("alertngo_admin_key") : "") || "alertngo@123";
  try {
    const res = await fetch(`${API_BASE}/admin_upload.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Key": adminKey,
        Accept: "application/json"
      },
      body: JSON.stringify({
        action: "attach_local_file",
        filename,
        folder: cleanFolder,
        ...(url ? { url } : {}),
        admin_key: adminKey
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("Error attaching local file:", err);
  }
  return { success: false, message: "Failed to attach file." };
}

export async function adminInstantLocalAttach(filename, size = 0, folder = "achievements/videos", localPath = "") {
  const cleanFolder = sanitizeUploadFolder(folder, "achievements/videos");
  const adminKey = (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("alertngo_admin_key") : "") || "alertngo@123";
  try {
    const res = await fetch(`${API_BASE}/admin_upload.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Key": adminKey,
        Accept: "application/json"
      },
      body: JSON.stringify({
        action: "instant_local_attach",
        filename,
        size,
        folder: cleanFolder,
        ...(localPath ? { local_path: localPath } : {}),
        admin_key: adminKey
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.url) {
        return data;
      }
    }
  } catch (err) {
    console.warn("Instant local attach check:", err);
  }
  return { success: false, found: false };
}

// 2. ALL 90 PAGES
export async function fetchAllPages(category = null) {
  const fallbackPages = await loadFallbackPages();
  const seenFallback = new Set();
  const localList = [];
  for (const p of Object.values(fallbackPages)) {
    const s = (p?.slug || "").trim();
    if (!s || seenFallback.has(s)) continue;
    seenFallback.add(s);
    localList.push({
      slug: s,
      title: p.title || s,
      category: p.category || "General",
      tables_count: p.tables ? p.tables.length : 0,
      images_count: p.images ? p.images.length : 0,
      downloads_count: p.downloads ? p.downloads.length : 0,
      url: p.url || `/${s}`,
      excerpt: p.paragraphs && p.paragraphs.length > 0 ? p.paragraphs[0].slice(0, 160) + "..." : ""
    });
  }

  const url = category ? `get_pages.php?category=${encodeURIComponent(category)}` : "get_pages.php";
  const result = await safeGet(url, localList);
  if (result && Array.isArray(result.data)) {
    const seen = new Set();
    result.data = result.data.filter((item) => {
      const s = (item?.slug || "").trim();
      if (!s || seen.has(s)) return false;
      seen.add(s);
      return true;
    });
  }
  return result;
}

// 3. SINGLE PAGE DETAIL
export async function fetchPageBySlug(slug) {
  const cleanSlug = (slug || "").toLowerCase().replace(/^\/+/, "").replace(/\/+$/, "").trim();
  if (!cleanSlug) return { data: null, source: "none", success: false };

  // 1. Check direct page override (real-time admin sync). Skip for slugs that are
  //    managed by their own admin pages and fetched fresh from backend, to avoid
  //    serving stale cached overrides.
  const achievementsSlugs = new Set(["achievements", "child-interventions", "child-bare-acts", "reports", "portfolio-3"]);
  let isAchievementsCachedSlug = false;
  try {
    const achCacheRaw = localStorage.getItem("alertngo_achievements_pages_cache");
    if (achCacheRaw) {
      const achCache = JSON.parse(achCacheRaw);
      if (Array.isArray(achCache) && achCache.some((p) => String(p?.slug || "").toLowerCase() === cleanSlug)) {
        isAchievementsCachedSlug = true;
      }
    }
  } catch (_) {}
  const preferApiOverOverride = cleanSlug === "la-rr" || achievementsSlugs.has(cleanSlug) || isAchievementsCachedSlug;
  let overridePage = null;
  try {
    const cached = localStorage.getItem(`alertngo_page_override_${cleanSlug}`) || localStorage.getItem(`alertngo_page_override_/${cleanSlug}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && (parsed.title || parsed.slug || parsed.nav_label)) {
        const c = parsed.content || {};
        overridePage = {
          ...parsed,
          ...c,
          slug: (parsed.slug || cleanSlug).replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase(),
          title: parsed.title || parsed.nav_label || c.title || cleanSlug,
          nav_label: parsed.nav_label || parsed.title || c.nav_label || cleanSlug,
          subtitle: parsed.subtitle !== undefined ? parsed.subtitle : (c.subtitle || ""),
          category: parsed.category || c.category || "Official Record",
          badge: parsed.badge || c.badge || "ALERT Document",
          stats: Array.isArray(parsed.stats) ? parsed.stats : (Array.isArray(c.stats) ? c.stats : []),
          downloads: Array.isArray(parsed.downloads) ? parsed.downloads : (Array.isArray(c.downloads) ? c.downloads : []),
          images: Array.isArray(parsed.images) ? parsed.images : (Array.isArray(c.images) ? c.images : []),
          videos: Array.isArray(parsed.videos) ? parsed.videos : (Array.isArray(c.videos) ? c.videos : []),
          paragraphs: Array.isArray(parsed.paragraphs) ? parsed.paragraphs : (Array.isArray(c.paragraphs) ? c.paragraphs : []),
          tables: Array.isArray(parsed.tables) ? parsed.tables : (Array.isArray(c.tables) ? c.tables : [])
        };
        if (!preferApiOverOverride) {
          return { data: overridePage, source: "override", success: true };
        }
      }
    }
  } catch (_) {}

  // 2. Check LA & RR pages cache
  try {
    const larrCached = localStorage.getItem("alertngo_larr_pages_cache");
    if (larrCached) {
      const parsed = JSON.parse(larrCached);
      if (Array.isArray(parsed)) {
        const match = parsed.find((p) => (p.slug || "").replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase() === cleanSlug);
        if (match) {
          const content = match.content || {};
          const localPage = {
            ...match,
            ...content,
            slug: (match.slug || cleanSlug).replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase(),
            title: match.title || match.nav_label || content.title,
            nav_label: match.nav_label || match.title || content.nav_label,
            subtitle: match.subtitle !== undefined ? match.subtitle : (content.subtitle || ""),
            category: match.category || content.category || "LA & RR",
            badge: match.badge || content.badge || "LA & RR Project",
            stats: (Array.isArray(match.stats) && match.stats.length > 0) ? match.stats : (Array.isArray(content.stats) ? content.stats : []),
            downloads: (Array.isArray(match.downloads) && match.downloads.length > 0) ? match.downloads : (Array.isArray(content.downloads) ? content.downloads : []),
            images: (Array.isArray(match.images) && match.images.length > 0) ? match.images : (Array.isArray(content.images) ? content.images : []),
            videos: (Array.isArray(match.videos) && match.videos.length > 0) ? match.videos : (Array.isArray(content.videos) ? content.videos : []),
            paragraphs: (Array.isArray(match.paragraphs) && match.paragraphs.length > 0) ? match.paragraphs : (Array.isArray(content.paragraphs) ? content.paragraphs : []),
            tables: (Array.isArray(match.tables) && match.tables.length > 0) ? match.tables : (Array.isArray(content.tables) ? content.tables : [])
          };
          return { data: localPage, source: "larr_cache", success: true };
        }
      }
    }
  } catch (_) {}

  // 3. Check RoFR pages cache
  try {
    const rofrCached = localStorage.getItem("alertngo_rofr_pages_cache");
    if (rofrCached) {
      const parsed = JSON.parse(rofrCached);
      if (Array.isArray(parsed)) {
        const match = parsed.find((p) => (p.slug || "").replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase() === cleanSlug);
        if (match) {
          const content = match.content || {};
          const localPage = {
            ...match,
            ...content,
            slug: (match.slug || cleanSlug).replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase(),
            title: match.title || match.nav_label || content.title,
            nav_label: match.nav_label || match.title || content.nav_label,
            subtitle: match.subtitle !== undefined ? match.subtitle : (content.subtitle || ""),
            category: match.category || content.category || "RoFR & LTR",
            badge: match.badge || content.badge || "RoFR & LTR",
            stats: (Array.isArray(match.stats) && match.stats.length > 0) ? match.stats : (Array.isArray(content.stats) ? content.stats : []),
            downloads: (Array.isArray(match.downloads) && match.downloads.length > 0) ? match.downloads : (Array.isArray(content.downloads) ? content.downloads : []),
            images: (Array.isArray(match.images) && match.images.length > 0) ? match.images : (Array.isArray(content.images) ? content.images : []),
            videos: (Array.isArray(match.videos) && match.videos.length > 0) ? match.videos : (Array.isArray(content.videos) ? content.videos : []),
            paragraphs: (Array.isArray(match.paragraphs) && match.paragraphs.length > 0) ? match.paragraphs : (Array.isArray(content.paragraphs) ? content.paragraphs : []),
            tables: (Array.isArray(match.tables) && match.tables.length > 0) ? match.tables : (Array.isArray(content.tables) ? content.tables : [])
          };
          return { data: localPage, source: "rofr_cache", success: true };
        }
      }
    }
  } catch (_) {}

  // 4. Check About Dropdowns cache
  try {
    const aboutCached = localStorage.getItem("alertngo_about_dropdowns");
    if (aboutCached) {
      const parsed = JSON.parse(aboutCached);
      if (Array.isArray(parsed)) {
        const match = parsed.find((p) => (p.path || "").replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase() === cleanSlug);
        if (match) {
          const localPage = {
            slug: cleanSlug,
            title: match.label,
            nav_label: match.label,
            category: "About Us",
            badge: "About Us",
            subtitle: `Official records, profile, and documentation for ${match.label}.`,
            stats: [],
            downloads: [],
            images: [],
            videos: [],
            paragraphs: [
              `Welcome to ${match.label}. Comprehensive information, photo documentation, video recordings, and official PDF documents are maintained here by ALERT.`
            ],
            tables: []
          };
          return { data: localPage, source: "about_cache", success: true };
        }
      }
    }
  } catch (_) {}

  // 5. Check Polavaram pages cache
  try {
    const polCached = localStorage.getItem("alertngo_polavaram_pages_cache");
    if (polCached) {
      const parsed = JSON.parse(polCached);
      if (Array.isArray(parsed)) {
        const match = parsed.find((p) => (p.slug || "").replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase() === cleanSlug);
        if (match) {
          const content = match.content || {};
          const localPage = {
            ...match,
            ...content,
            slug: (match.slug || cleanSlug).replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase(),
            title: match.title || content.title,
            nav_label: match.nav_label || content.nav_label,
            subtitle: match.subtitle || content.subtitle,
            category: match.category || content.category || "Polavaram Project",
            badge: match.badge || content.badge || "Polavaram PIP",
            stats: (content.stats && content.stats.length > 0) ? content.stats : (match.stats || []),
            downloads: (content.downloads && content.downloads.length > 0) ? content.downloads : (match.downloads || []),
            images: (content.images && content.images.length > 0) ? content.images : (match.images || []),
            videos: (content.videos && content.videos.length > 0) ? content.videos : (match.videos || []),
            paragraphs: (content.paragraphs && content.paragraphs.length > 0) ? content.paragraphs : (match.paragraphs || []),
            tables: (content.tables && content.tables.length > 0) ? content.tables : (match.tables || [])
          };
          return { data: localPage, source: "pol_cache", success: true };
        }
      }
    }
  } catch (_) {}

  // 5b. Check Flood Relief pages cache
  try {
    const floodCached = localStorage.getItem("alertngo_flood_relief_pages_cache");
    if (floodCached) {
      const parsed = JSON.parse(floodCached);
      if (Array.isArray(parsed)) {
        const match = parsed.find((p) => (p.slug || "").replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase() === cleanSlug);
        if (match) {
          const content = match.content || {};
          const localPage = {
            ...match,
            ...content,
            slug: (match.slug || cleanSlug).replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase(),
            title: match.title || content.title,
            nav_label: match.nav_label || content.nav_label,
            subtitle: match.subtitle || content.subtitle,
            category: match.category || content.category || "Flood Relief",
            badge: match.badge || content.badge || "Flood Relief",
            stats: (content.stats && content.stats.length > 0) ? content.stats : (match.stats || []),
            downloads: (content.downloads && content.downloads.length > 0) ? content.downloads : (match.downloads || []),
            images: (content.images && content.images.length > 0) ? content.images : (match.images || []),
            videos: (content.videos && content.videos.length > 0) ? content.videos : (match.videos || []),
            paragraphs: (content.paragraphs && content.paragraphs.length > 0) ? content.paragraphs : (match.paragraphs || []),
            tables: (content.tables && content.tables.length > 0) ? content.tables : (match.tables || [])
          };
          return { data: localPage, source: "flood_cache", success: true };
        }
      }
    }
  } catch (_) {}

  // 5c. Check Achievements pages cache (only if it has actual content; otherwise prefer fresh backend data)
  try {
    const achCached = localStorage.getItem("alertngo_achievements_pages_cache");
    if (achCached) {
      const parsed = JSON.parse(achCached);
      if (Array.isArray(parsed)) {
        const match = parsed.find((p) => (p.slug || "").replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase() === cleanSlug);
        if (match) {
          const content = match.content || {};
          const localPage = {
            ...match,
            ...content,
            slug: (match.slug || cleanSlug).replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase(),
            title: match.title || content.title || content.nav_label,
            nav_label: match.nav_label || content.nav_label || match.title || content.title,
            subtitle: match.subtitle ?? content.subtitle ?? "",
            category: match.category || content.category || "Achievements",
            badge: match.badge || content.badge || "Achievements",
            stats: (Array.isArray(content.stats) && content.stats.length > 0) ? content.stats : (Array.isArray(match.stats) ? match.stats : []),
            downloads: (Array.isArray(content.downloads) && content.downloads.length > 0) ? content.downloads : (Array.isArray(match.downloads) ? match.downloads : []),
            images: (Array.isArray(content.images) && content.images.length > 0) ? content.images : (Array.isArray(match.images) ? match.images : []),
            videos: (Array.isArray(content.videos) && content.videos.length > 0) ? content.videos : (Array.isArray(match.videos) ? match.videos : []),
            paragraphs: (Array.isArray(content.paragraphs) && content.paragraphs.length > 0) ? content.paragraphs : (Array.isArray(match.paragraphs) ? match.paragraphs : []),
            tables: (Array.isArray(content.tables) && content.tables.length > 0) ? content.tables : (Array.isArray(match.tables) ? match.tables : [])
          };
          const hasRealContent =
            (localPage.paragraphs && localPage.paragraphs.length > 0) ||
            (localPage.downloads && localPage.downloads.length > 0) ||
            (localPage.images && localPage.images.length > 0) ||
            (localPage.videos && localPage.videos.length > 0) ||
            (localPage.tables && localPage.tables.length > 0) ||
            (localPage.stats && localPage.stats.length > 0);
          if (hasRealContent) {
            return { data: localPage, source: "ach_cache", success: true };
          }
        }
      }
    }
  } catch (_) {}

  // 7. Check backend API first for fresh/admin-managed content (DB-backed pages)
  const result = await safeGet(`get_page.php?slug=${encodeURIComponent(cleanSlug)}`, null);
  if (result && result.source === "api" && result.data) {
    if (overridePage) {
      const apiData = result.data || {};
      const apiContent = apiData.content || {};
      const merged = {
        ...apiData,
        ...apiContent,
        ...overridePage,
        // Prefer fresh DB arrays/content when override is sparse, but keep override if it has newer content
        paragraphs: (Array.isArray(overridePage.paragraphs) && overridePage.paragraphs.length > 0) ? overridePage.paragraphs : (Array.isArray(apiData.paragraphs) ? apiData.paragraphs : (Array.isArray(apiContent.paragraphs) ? apiContent.paragraphs : [])),
        downloads: (Array.isArray(overridePage.downloads) && overridePage.downloads.length > 0) ? overridePage.downloads : (Array.isArray(apiData.downloads) ? apiData.downloads : (Array.isArray(apiContent.downloads) ? apiContent.downloads : [])),
        images: (Array.isArray(overridePage.images) && overridePage.images.length > 0) ? overridePage.images : (Array.isArray(apiData.images) ? apiData.images : (Array.isArray(apiContent.images) ? apiContent.images : [])),
        videos: (Array.isArray(overridePage.videos) && overridePage.videos.length > 0) ? overridePage.videos : (Array.isArray(apiData.videos) ? apiData.videos : (Array.isArray(apiContent.videos) ? apiContent.videos : [])),
        tables: (Array.isArray(overridePage.tables) && overridePage.tables.length > 0) ? overridePage.tables : (Array.isArray(apiData.tables) ? apiData.tables : (Array.isArray(apiContent.tables) ? apiContent.tables : [])),
        stats: (Array.isArray(overridePage.stats) && overridePage.stats.length > 0) ? overridePage.stats : (Array.isArray(apiData.stats) ? apiData.stats : (Array.isArray(apiContent.stats) ? apiContent.stats : [])),
      };
      return { data: merged, source: result.source || "api", success: true };
    }
    return result;
  }
  if (overridePage) {
    return { data: overridePage, source: "override", success: true };
  }

  // 6. Fallback compiled pages (all_site_pages.json) when backend is unavailable/not found
  const fallbackPages = await loadFallbackPages();
  const fallbackMatch = fallbackPages[cleanSlug] ||
    Object.values(fallbackPages).find(p => (p.slug || "").replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase() === cleanSlug) ||
    null;

  if (fallbackMatch) {
    const c = fallbackMatch.content || {};
    const localPage = {
      ...fallbackMatch,
      ...c,
      slug: (fallbackMatch.slug || cleanSlug).replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase(),
      title: fallbackMatch.title || c.title || cleanSlug,
      nav_label: fallbackMatch.nav_label || fallbackMatch.title || c.nav_label || cleanSlug,
      subtitle: fallbackMatch.subtitle || c.subtitle || "",
      category: fallbackMatch.category || c.category || "Official Documentation",
      badge: fallbackMatch.badge || c.badge || "ALERT Archive",
      stats: (Array.isArray(fallbackMatch.stats) && fallbackMatch.stats.length > 0) ? fallbackMatch.stats : (Array.isArray(c.stats) ? c.stats : []),
      downloads: (Array.isArray(fallbackMatch.downloads) && fallbackMatch.downloads.length > 0) ? fallbackMatch.downloads : (Array.isArray(c.downloads) ? c.downloads : []),
      images: (Array.isArray(fallbackMatch.images) && fallbackMatch.images.length > 0) ? fallbackMatch.images : (Array.isArray(c.images) ? c.images : []),
      videos: (Array.isArray(fallbackMatch.videos) && fallbackMatch.videos.length > 0) ? fallbackMatch.videos : (Array.isArray(c.videos) ? c.videos : []),
      paragraphs: (Array.isArray(fallbackMatch.paragraphs) && fallbackMatch.paragraphs.length > 0) ? fallbackMatch.paragraphs : (Array.isArray(c.paragraphs) ? c.paragraphs : []),
      tables: (Array.isArray(fallbackMatch.tables) && fallbackMatch.tables.length > 0) ? fallbackMatch.tables : (Array.isArray(c.tables) ? c.tables : [])
    };
    return { data: localPage, source: "fallback", success: true };
  }

  // 8. Graceful default page object so dynamic dropdown pages always display cleanly
  const formattedTitle = cleanSlug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const fallbackStarter = {
    slug: cleanSlug,
    title: formattedTitle,
    nav_label: formattedTitle,
    category: "General",
    badge: "Official Record",
    subtitle: `Official records, reports, and community documentation for ${formattedTitle}.`,
    stats: [],
    downloads: [],
    images: [],
    videos: [],
    paragraphs: [
      `Welcome to ${formattedTitle}. Official records, field reports, and documentation are maintained here by ALERT.`
    ],
    tables: []
  };
  return { data: fallbackStarter, source: "starter", success: true };
}

// 4. GALLERY
export const defaultGallery = [
  { src: "/uploads/reels/reel-1-dhimsa.mp4", poster: "/uploads/reels/reel-1-dhimsa.jpg", type: "video", duration: "0:08", title: "Dhimsa Dance at a Community Gathering", cat: "Community" },
  { src: "/uploads/reels/reel-2-learning.mp4", poster: "/uploads/reels/reel-2-learning.jpg", type: "video", duration: "0:08", title: "Digital Learning Reaches Agency Schools", cat: "Education" },
  { src: "/uploads/reels/reel-3-school-kits.mp4", poster: "/uploads/reels/reel-3-school-kits.jpg", type: "video", duration: "0:08", title: "School Kits for Children in Hill Villages", cat: "Education" },
  { src: "/uploads/reels/reel-4-women.mp4", poster: "/uploads/reels/reel-4-women.jpg", type: "video", duration: "0:08", title: "Yenadi Women's Federation Convention", cat: "Women" },
  { src: "/uploads/PHOTO-2023-02-15-19-20-55_1.jpg", title: "Adivasi Community Meeting & Rights Dialogue", cat: "Community" },
  { src: "/uploads/PHOTO-2023-02-15-19-20-56_2-1.jpg", title: "Gram Sabha Forest Rights Documentation", cat: "Forest Rights" },
  { src: "/uploads/PHOTO-2023-02-15-19-20-52_1.jpg", title: "Tribal Elders Council Resolution", cat: "Community" },
  { src: "/uploads/PHOTO-2023-02-15-19-20-56.jpg", title: "Field Survey in Polavaram Basin", cat: "Field Work" },
  { src: "/uploads/PHOTO-2023-02-15-19-21-00_1.jpg", title: "Women Livelihood Group Discussion", cat: "Women" },
  { src: "/uploads/laptop1.jpeg", title: "Digital Literacy & Youth Skill Training", cat: "Education" },
  { src: "/uploads/lp.jpeg", title: "Computer Lab & Online Grievance Filing", cat: "Education" },
  { src: "/uploads/lp2.jpeg", title: "Youth Community Informatics Workshop", cat: "Education" },
  { src: "/uploads/l-1.jpg", title: "Ashram School Children Digital Education", cat: "Education" },
  { src: "/uploads/lp3.jpeg", title: "Skill Certification in Tribal Mandal", cat: "Education" },
  { src: "/uploads/DR.png", title: "Disaster Relief Operations & Provisioning", cat: "Relief" },
  { src: "/uploads/DR2.png", title: "Essential Food Ration Distribution", cat: "Relief" },
  { src: "/uploads/FR.png", title: "Flood Water Rescue & Hamlets Support", cat: "Relief" },
  { src: "/uploads/PL.png", title: "Polavaram Resettlement Colony Inspection", cat: "Field Work" },
  { src: "/uploads/fire1-1.jpg", title: "Solar Micro-Grid & Lantern Commissioning", cat: "Energy" },
  { src: "/uploads/fire3-1.jpg", title: "Solar Street Pole Erection Drive", cat: "Energy" },
  { src: "/uploads/firee-1.jpg", title: "Evening Lighting in Off-Grid Hamlet", cat: "Energy" },
  { src: "/uploads/fire4-1.jpg", title: "Clean Energy Transition Workshop", cat: "Energy" },
  { src: "/uploads/fire5-1.jpg", title: "Community Solar Battery Maintenance", cat: "Energy" },
  { src: "/uploads/fire6-1.jpg", title: "Renewable Energy Celebration in Tribal Village", cat: "Energy" },
  { src: "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg", title: "Flood Affected Families Evacuation Base", cat: "Relief" },
  { src: "/uploads/WhatsApp-Image-2021-08-23-at-11.23.52-AM-1024x768.jpeg", title: "Emergency Medical Kit Handover", cat: "Relief" },
  { src: "/uploads/PHOTO-2022-10-20-17-25-29-2.jpg", title: "Relief Boat Launch in Godavari Basin", cat: "Relief" },
  { src: "/uploads/PHOTO-2022-10-20-17-25-30.jpg", title: "Dry Provisions Distribution in Cut-Off Village", cat: "Relief" },
  { src: "/uploads/The-formation-Meeting-of-Yanadi-Girijana-Women-fisheries-COOP-at-Machilipatnam-mandal-in-Krishna-District-150x150.jpg", title: "Yanadi Girijana Women Fisheries Cooperative Formation", cat: "Women" },
  { src: "/uploads/Children-reieved-shoes-1.jpg", title: "Tribal Ashram School Children Footwear & Education Drive", cat: "Education" },
  { src: "/uploads/Love-then-Serve.jpg", title: "Love Then Serve: Community Elders Convocation", cat: "Community" },
  { src: "/uploads/Kotarugommu-18-9-21-1-rotated-1-1024x461-640x480.jpeg", title: "Kotarugommu Flood Relief Field Intervention", cat: "Relief" },
  { src: "/uploads/ramavarampadu_11-08-2021-1024x461-640x480.jpeg", title: "Ramavarampadu Emergency Provisioning Camp", cat: "Relief" },
  { src: "/uploads/WhatsApp-Image-2021-09-16-at-7.50.55-PM-1024x461.jpeg", title: "Decentralized Solar System Testing in Habitation", cat: "Energy" },
  { src: "/uploads/all2023.jpeg", title: "Godavari Flood Relief Unified Operation Base", cat: "Relief" }
];

export async function fetchGallery() {
  return safeGet("get_gallery.php", defaultGallery);
}

// 5. DOWNLOADS
export const defaultDownloads = [
  {
    category: "acts",
    title: "RFCTLARR Act 2013 - Schedule 1 (Compensation)",
    file: "/uploads/schedule-1.pdf",
    meta: "Central Bare Act • LA Act 2013",
    desc: "Statutory multi-factor valuation formula for rural tribal lands and mandatory 100% solatium allowance.",
    fileSize: "Official PDF"
  },
  {
    category: "acts",
    title: "RFCTLARR Act 2013 - Schedule 2 (R&R Entitlements)",
    file: "/uploads/schedule-2.pdf",
    meta: "Central Bare Act • LA Act 2013",
    desc: "Mandatory house allotment, subsistence monthly grants, cattle shed allowances, and shifting grants for displaced families.",
    fileSize: "Official PDF"
  },
  {
    category: "acts",
    title: "RFCTLARR Act 2013 - Schedule 3 (25 Colony Amenities)",
    file: "/uploads/schedules-3-1.pdf",
    meta: "Central Bare Act • LA Act 2013",
    desc: "List of 25 mandatory public infrastructural amenities required in every resettlement colony before displacement.",
    fileSize: "Official PDF"
  },
  {
    category: "acts",
    title: "Key Critical Issues of Polavaram Project (PIP Brief)",
    file: "/uploads/Seperated-Polavaram-issues-4.pdf",
    meta: "ALERT Legal & Policy Cell",
    desc: "Analytical policy brief on submergence contour errors, youth package exclusions, and rehabilitation colony infrastructure.",
    fileSize: "Official PDF (80 KB)"
  },
  {
    category: "court",
    title: "High Court Cases: East Godavari District",
    file: "/uploads/High-court-Cases_EG-1.pdf",
    meta: "High Court of Andhra Pradesh",
    desc: "Record of writ petitions and court orders defending Adivasi forest rights and fair land valuation in East Godavari.",
    fileSize: "Official PDF"
  },
  {
    category: "court",
    title: "Pending High Court Cases: West Godavari District",
    file: "/uploads/Pending-High-court-cases_WG.pdf",
    meta: "High Court of Andhra Pradesh",
    desc: "Compiled list of pending litigation regarding adult youth entitlement packages and resettlement colony allotments.",
    fileSize: "Official PDF"
  },
  {
    category: "court",
    title: "Cases @ R&R Commissioner Office, Vijayawada",
    file: "/uploads/RR-commissioner-office_Court-Cases.pdf",
    meta: "Commissioner of R&R, Polavaram",
    desc: "Appeals filed by ALERT caseworkers representing families excluded from draft award declarations.",
    fileSize: "Official PDF"
  },
  {
    category: "court",
    title: "RTI Disclosures: LA & RR Authority Court",
    file: "/uploads/RTI-Data-LA-RR-Court.pdf",
    meta: "RTI Official Disclosures",
    desc: "Comprehensive RTI records regarding land acquisition award enquiries and compensation disbursement tracking.",
    fileSize: "Official PDF"
  },
  {
    category: "court",
    title: "Compendium of Judgements on Forest Rights Act (2007–2015)",
    file: "/uploads/Compendum-of-Judgements-on-FRA-2007-2015.pdf",
    meta: "ALERT Legal Cell Compilation",
    desc: "Landmark High Court and Supreme Court judgements affirming tribal land tenure under the Forest Rights Act 2006.",
    fileSize: "Official PDF"
  },
  {
    category: "court",
    title: "Land Acquisition & Structural Award Copies",
    file: "/uploads/AWARD-COPIES-1.pdf",
    meta: "Official Revenue Awards",
    desc: "Certified award copies issued by Special Land Acquisition Officers (SLAOs) in the Polavaram submergence basin.",
    fileSize: "Official PDF"
  },
  {
    category: "faqs",
    title: "Frequently Asked Questions on LARR Act 2013",
    file: "/uploads/FAQ-LARR.pdf",
    meta: "Government of India Guidelines",
    desc: "Comprehensive FAQ explaining land acquisition procedures, SIA studies, consent norms, and award calculations.",
    fileSize: "Official PDF"
  },
  {
    category: "faqs",
    title: "R&R Grievance Redressal FAQs & Procedures",
    file: "/uploads/GREIVANCE-FAQ.pdf",
    meta: "ALERT Community Handbook",
    desc: "Practical handbook on lodging grievances, appeal procedures before SDC, and entitlement claims under Polavaram.",
    fileSize: "Official PDF"
  },
  {
    category: "faqs",
    title: "Ministry of Tribal Affairs (MoTA) RoFR Guidelines FAQ",
    file: "/uploads/MoTA_FAQ.pdf",
    meta: "Ministry of Tribal Affairs",
    desc: "Official clarifications on Individual Forest Rights (IFR), Community Rights (CFR), and Gram Sabha powers.",
    fileSize: "Official PDF"
  },
  {
    category: "faqs",
    title: "MGNREGA Operational Guidelines & Rights in Tribal Areas",
    file: "/uploads/MGNREGA_GUIDELINES.pdf",
    meta: "Ministry of Rural Development",
    desc: "Statutory operational guidelines for employment guarantee, watershed development, and land leveling in Scheduled areas.",
    fileSize: "Official PDF"
  },
  {
    category: "faqs",
    title: "MGNREGA Frequently Asked Questions",
    file: "/uploads/NREGA_FAQ.pdf",
    meta: "Rural Employment Cell",
    desc: "Answers to wage payments, job card applications, and unemployment allowances for tribal workers.",
    fileSize: "Official PDF"
  },
  {
    category: "faqs",
    title: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY) FAQ",
    file: "/uploads/PMKSY_FAQ.pdf",
    meta: "Ministry of Agriculture & Farmers Welfare",
    desc: "Guidelines on micro-irrigation subsidies, check dams, and water harvesting structures for smallholder farmers.",
    fileSize: "Official PDF"
  },
  {
    category: "reports",
    title: "Organizational Profile & 20-Year Report of ALERT",
    file: "/uploads/Organizational-Profile-of-ALERT.pdf",
    meta: "ALERT Official Profile",
    desc: "Official organizational profile, registration documents (307/2004), 12A & 80G certificates, and 20-year achievements summary.",
    fileSize: "Official PDF"
  },
  {
    category: "reports",
    title: "ALERT Annual Report (April 2020 – March 2021)",
    file: "/uploads/ALERT_Annual-report-from-April-2020-to-March-2021-1.pdf",
    meta: "ALERT Audited Annual Report",
    desc: "Audited operational and financial report detailing field interventions, COVID-19 tribal relief, RoFR claims, and women's cooperatives.",
    fileSize: "Official PDF (730 KB)"
  },
  {
    category: "faqs",
    title: "Governance & Statutory Compliances for NGOs in India",
    file: "/uploads/FAQS-ON-NGO.pdf",
    meta: "Legal Compliance Manual",
    desc: "Regulatory handbook on Societies Registration, FCRA regulations, 80G tax deductions, and governance best practices.",
    fileSize: "Official PDF"
  },
  {
    category: "faqs",
    title: "RTI Online Filing & Tribal Advocacy Manual",
    file: "/uploads/RTI-Online-FAQs.pdf",
    meta: "Central Information Commission",
    desc: "Guide to filing online Right to Information (RTI) petitions to access project documents, DPRs, and land award records.",
    fileSize: "Official PDF"
  }
];

export async function fetchDownloads() {
  return safeGet("get_downloads.php", defaultDownloads);
}

// 6. FAQS
export const defaultFaqs = [
  {
    q: "What is ALERT and when was it founded?",
    a: "ALERT (Association for Land and Livelihood) was founded in 2004 (Registration No. 307/2004) under the Societies Registration Act. Headquartered in Vijayawada, Andhra Pradesh, ALERT is dedicated to empowering Adivasis and marginalized coastal communities in the Fifth Scheduled areas through rights-based development, legal aid, and environmental sustainability."
  },
  {
    q: "What is the Forest Rights Act (RoFR) and how does ALERT assist?",
    a: "The Scheduled Tribes and Other Traditional Forest Dwellers (Recognition of Forest Rights) Act, 2006 recognizes the pre-existing rights of forest-dwelling tribal communities over ancestral lands and minor forest produce. ALERT assists Gram Sabhas with field mapping, gathering revenue evidence, and submitting Individual Forest Rights (IFR) and Community Forest Rights (CFR) claims."
  },
  {
    q: "How does ALERT support families displaced by the Polavaram Irrigation Project (PIP)?",
    a: "ALERT tracks land valuation awards, coordinates legal petitions before the High Court of AP and the R&R Commissioner Office, monitors housing colony amenities (drinking water, schooling, roads), and operates a community grievance redressal cell to ensure every displaced family and adult youth receives their statutory package."
  },
  {
    q: "What is the role of PESA in tribal self-governance?",
    a: "The Provisions of the Panchayats (Extension to Scheduled Areas) Act (PESA), 1996 vests mandatory authority in the village Gram Sabha. In Schedule V areas, no land acquisition, minor water body alienation, or mining lease can proceed without prior consultation and resolution by the Gram Sabha. ALERT trains tribal leaders and Gram Sabha members in exercising these statutory powers."
  },
  {
    q: "Are donations to ALERT eligible for income tax exemption?",
    a: "Yes. ALERT is registered under Section 12A and Section 80G of the Indian Income Tax Act. Donors receive a formal 80G tax receipt allowing them to claim up to a 50% deduction on their taxable income as permitted under Indian tax laws."
  },
  {
    q: "How can individuals or organizations volunteer or collaborate with ALERT?",
    a: "We welcome interns, legal researchers, environmental scientists, and volunteers. Opportunities include field research in tribal mandals, documentation of oral histories, child education initiatives, and disaster relief logistics. You can reach out through our Contact page or write directly to director@alertngo.in."
  },
  {
    q: "How does ALERT fund its community initiatives and ensure transparency?",
    a: "ALERT is funded through individual philanthropic contributions, institutional donor grants, and corporate CSR partnerships. Our accounts are audited annually by statutory chartered accountants, filed with the Registrar of Societies, and submitted under FCRA guidelines to ensure absolute financial integrity."
  }
];

export async function fetchFaqs() {
  return safeGet("get_faqs.php", defaultFaqs);
}

// 7. NEWS
export const defaultNews = [
  {
    title: "Godavari Flood Relief 2023: Emergency Rations & Medical Kits to 4,200 Displaced Families",
    date: "September 2023",
    category: "relief",
    tag: "Flood Relief 2023",
    img: "/uploads/all2023.jpeg",
    excerpt: "ALERT mobilized field teams across flood-hit habitations of Alluri Sitharama Raju and Eluru districts, deploying mechanized boats to supply rice, lentils, drinking water, and sanitary kits to cut-off Adivasi hamlets."
  },
  {
    title: "Flood Relief Operations 2022: Multi-Mandal Relief Mission Across Submergence Habitations",
    date: "October 2022",
    category: "relief",
    tag: "Flood Relief 2022",
    img: "/uploads/PHOTO-2022-10-20-17-25-29-2.jpg",
    excerpt: "Field caseworkers distributed comprehensive ration packets and hygiene supplies to families displaced by heavy Godavari river spillage in Kunavaram, VR Puram, and Chintoor mandals."
  },
  {
    title: "Flood Relief Operations 2021: Rescue Boat Deployment & Essential Services in Hill Tracts",
    date: "August 2021",
    category: "relief",
    tag: "Flood Relief 2021",
    img: "/uploads/WhatsApp-Image-2021-08-23-at-11.23.52-AM-1024x768.jpeg",
    excerpt: "ALERT established temporary relief distribution bases in remote hill areas, providing direct sustenance to vulnerable tribal children, nursing mothers, and elderly persons."
  },
  {
    title: "Blankets & Winter Care Distribution in East Godavari Hill Hamlets",
    date: "October 2020",
    category: "winter",
    tag: "Blankets Drive",
    img: "/uploads/WhatsApp-Image-2020-10-10-at-1.48.07-PM-1-300x225-1.jpeg",
    excerpt: "Over 3,000 thermal wool blankets and basic healthcare supplies were handed over directly to remote Konda Reddi tribal households facing harsh winter temperatures."
  },
  {
    title: "Essential Groceries Distribution Campaign in West Godavari Submergence Villages",
    date: "July 2020",
    category: "relief",
    tag: "COVID & Relief",
    img: "/uploads/WhatsApp-Image-2020-07-29-at-10.42.06-AM-768x576-1.jpeg",
    excerpt: "Nutritional hampers and clean drinking water containers were distributed to forest hamlets cut off from road connectivity during peak monsoon inundations."
  }
];

export async function fetchNews() {
  return safeGet("get_news.php", defaultNews);
}

// 8. KEY PROGRAMS ("What We Do / Our Key Programs")
export const defaultProgramsHeader = {
  badge: "What We Do",
  title: "Our Key Programs",
  subtitle: "Comprehensive programs addressing the needs of Adivasi and marginalized communities",
};

export const defaultPrograms = [
  {
    id: 1,
    title: "Forest Rights & Land Advocacy",
    category: "Forest Rights",
    description: "Securing individual (IFR) and community forest rights (CFR) for Adivasi families under the Forest Rights Act, protecting thousands of acres.",
    image_url: "/uploads/PHOTO-2023-02-15-19-20-56_2-1.jpg",
    img: "/uploads/PHOTO-2023-02-15-19-20-56_2-1.jpg",
    cat: "Forest Rights",
    desc: "Securing individual (IFR) and community forest rights (CFR) for Adivasi families under the Forest Rights Act, protecting thousands of acres.",
    link_url: "/programs",
    link: "/programs",
    sort_order: 1,
    is_active: 1
  },
  {
    id: 2,
    title: "Self-Governance & PESA Act",
    category: "Governance",
    description: "Mobilizing Adivasi communities for self-governance through Gram Sabha empowerment and PESA Act implementation.",
    image_url: "/uploads/PHOTO-2023-02-15-19-20-52_1.jpg",
    img: "/uploads/PHOTO-2023-02-15-19-20-52_1.jpg",
    cat: "Governance",
    desc: "Mobilizing Adivasi communities for self-governance through Gram Sabha empowerment and PESA Act implementation.",
    link_url: "/programs",
    link: "/programs",
    sort_order: 2,
    is_active: 1
  },
  {
    id: 3,
    title: "Land Acquisition & R&R Advocacy",
    category: "Polavaram PIP",
    description: "Defending rights of 1,05,000+ Project Displaced Families across 371 habitations under the RFCTLARR Act 2013.",
    image_url: "/uploads/submergence-area-map-1.jpg",
    img: "/uploads/submergence-area-map-1.jpg",
    cat: "Polavaram PIP",
    desc: "Defending rights of 1,05,000+ Project Displaced Families across 371 habitations under the RFCTLARR Act 2013.",
    link_url: "/programs",
    link: "/programs",
    sort_order: 3,
    is_active: 1
  },
  {
    id: 4,
    title: "Matsya Mithra Women Federation",
    category: "Empowerment",
    description: "Forming and strengthening women-led cooperatives for Yenadi tribal women across 6 coastal mandals of Krishna District.",
    image_url: "/uploads/PHOTO-2023-02-15-19-21-00_1.jpg",
    img: "/uploads/PHOTO-2023-02-15-19-21-00_1.jpg",
    cat: "Empowerment",
    desc: "Forming and strengthening women-led cooperatives for Yenadi tribal women across 6 coastal mandals of Krishna District.",
    link_url: "/programs",
    link: "/programs",
    sort_order: 4,
    is_active: 1
  },
  {
    id: 5,
    title: "Godavari Flood Relief Missions",
    category: "Disaster Relief",
    description: "Essential grocery provisions, rescue boat operations, and emergency supplies to flood-affected Adivasi communities.",
    image_url: "/uploads/all2023.jpeg",
    img: "/uploads/all2023.jpeg",
    cat: "Disaster Relief",
    desc: "Essential grocery provisions, rescue boat operations, and emergency supplies to flood-affected Adivasi communities.",
    link_url: "/programs",
    link: "/programs",
    sort_order: 5,
    is_active: 1
  },
  {
    id: 6,
    title: "Project Green Energy: Solar Lighting",
    category: "Clean Energy",
    description: "Installing solar street poles and distributing solar home lanterns in remote off-grid tribal villages.",
    image_url: "/uploads/WhatsApp-Image-2021-09-16-at-7.50.55-PM-1024x461.jpeg",
    img: "/uploads/WhatsApp-Image-2021-09-16-at-7.50.55-PM-1024x461.jpeg",
    cat: "Clean Energy",
    desc: "Installing solar street poles and distributing solar home lanterns in remote off-grid tribal villages.",
    link_url: "/programs",
    link: "/programs",
    sort_order: 6,
    is_active: 1
  }
];

export async function fetchHomePrograms() {
  const fallback = { data: defaultPrograms, header: defaultProgramsHeader };
  return safeGet("get_programs.php", fallback);
}

export const adminListPrograms = (key) => adminRequest("admin_programs.php", "get", key);
export const adminCreateProgram = (key, payload) => adminRequest("admin_programs.php", "post", key, payload);
export const adminUpdateProgram = (key, payload) => adminRequest("admin_programs.php", "put", key, payload);
export const adminDeleteProgram = (key, id) => adminRequest("admin_programs.php", "delete", key, { id });
export const adminReorderPrograms = (key, payload) => adminRequest("admin_programs.php", "put", key, { action: "reorder", programs: payload });
export const adminSaveProgramsHeader = (key, payload) => adminRequest("admin_programs.php", "put", key, { action: "header", ...payload });

// 8B. KEY PROGRAMS OVERVIEW (/programs) - 8 THEMATIC PILLARS & INTERVENTIONS
export async function fetchOverviewPrograms() {
  const fallback = { data: [], categories: [], settings: {} };
  return safeGet("get_overview_programs.php", fallback);
}

export const adminListOverviewPrograms = (key) => adminRequest("admin_overview_programs.php", "get", key);
export const adminCreateOverviewProgram = (key, payload) => adminRequest("admin_overview_programs.php", "post", key, { action: "create", ...payload });
export const adminUpdateOverviewProgram = (key, payload) => adminRequest("admin_overview_programs.php", "post", key, { action: "update", ...payload });
export const adminDeleteOverviewProgram = (key, id) => adminRequest("admin_overview_programs.php", "post", key, { action: "delete", id });
export const adminReorderOverviewPrograms = (key, orderedIds) => adminRequest("admin_overview_programs.php", "post", key, { action: "reorder", ordered_ids: orderedIds });
export const adminUpdateOverviewCategory = (key, catData) => adminRequest("admin_overview_programs.php", "post", key, { action: "update_category", ...catData });
export const adminDeleteOverviewCategory = (key, categoryName, deletePrograms = false) => adminRequest("admin_overview_programs.php", "post", key, { action: "delete_category", category_name: categoryName, delete_programs: deletePrograms });
export const adminSaveOverviewSettings = (key, settings) => adminRequest("admin_overview_programs.php", "post", key, { action: "save_settings", settings });

// 8C. POLAVARAM PROJECT PAGES & DOCUMENTS (/legislative-acts-2, /submergence-area-map, etc.)
export async function fetchPolavaramPages() {
  const fallback = { data: [] };
  return safeGet("get_polavaram_pages.php", fallback);
}

export async function fetchPolavaramPageBySlug(slug) {
  const fallback = { data: null };
  return safeGet(`get_polavaram_pages.php?slug=${encodeURIComponent(slug)}`, fallback);
}

export const adminListPolavaramPages = (key) => adminRequest("admin_polavaram.php", "get", key);
export const adminGetPolavaramPage = (key, idOrSlug) => adminRequest(`admin_polavaram.php?${typeof idOrSlug === "number" ? `id=${idOrSlug}` : `slug=${encodeURIComponent(idOrSlug)}`}`, "get", key);
export const adminCreatePolavaramPage = (key, payload) => adminRequest("admin_polavaram.php", "post", key, { action: "create_page", ...payload });
export const adminUpdatePolavaramPage = (key, payload) => adminRequest("admin_polavaram.php", "post", key, { action: "update_page", ...payload });
export const adminDeletePolavaramPage = (key, idOrSlug) => {
  const payload = { action: "delete_page" };
  if (typeof idOrSlug === "number") {
    payload.id = idOrSlug;
  } else {
    payload.slug = idOrSlug;
    payload.id = idOrSlug;
  }
  return adminRequest("admin_polavaram.php", "post", key, payload);
};
export const adminAddPolavaramDocument = (key, payload) => adminRequest("admin_polavaram.php", "post", key, { action: "add_document", ...payload });
export const adminUpdatePolavaramDocument = (key, payload) => adminRequest("admin_polavaram.php", "post", key, { action: "update_document", ...payload });
export const adminDeletePolavaramDocument = (key, pageIdOrSlug, docIndex) => {
  const payload = { action: "delete_document", doc_index: docIndex };
  if (typeof pageIdOrSlug === "number") {
    payload.page_id = pageIdOrSlug;
  } else {
    payload.slug = pageIdOrSlug;
    payload.page_id = pageIdOrSlug;
  }
  return adminRequest("admin_polavaram.php", "post", key, payload);
};
export const adminSavePolavaramContent = (key, payload) => adminRequest("admin_polavaram.php", "post", key, { action: "save_content", ...payload });
export const adminReorderPolavaramPages = (key, orderedIds) => adminRequest("admin_polavaram.php", "post", key, { action: "reorder_pages", ordered_ids: orderedIds });

// 8D. LA & RR PROJECT PAGES & DOCUMENTS (/la-rr, /land-acquisition-la, /cases, etc.)
export const defaultLaRrPages = [
  { id: 1, slug: "la-rr", nav_label: "Polavaram LA & RR", title: "Polavaram LA & RR", category: "LA & RR", sort_order: 1, is_active: 1 },
  { id: 2, slug: "land-acquisition-la", nav_label: "Land Acquisition", title: "Land Acquisition", category: "LA & RR", sort_order: 2, is_active: 1 },
  { id: 3, slug: "la-flow-chart", nav_label: "LA Flow Chart", title: "LA Flow Chart", category: "LA & RR", sort_order: 3, is_active: 1 },
  { id: 4, slug: "la-act-2013-3-schdules", nav_label: "LA Act 2013 Schedules", title: "LA Act 2013 Schedules", category: "LA & RR", sort_order: 4, is_active: 1 },
  { id: 5, slug: "la-rr-status", nav_label: "LA & RR Status", title: "LA & RR Status", category: "LA & RR", sort_order: 5, is_active: 1 },
  { id: 6, slug: "cases", nav_label: "Court Cases", title: "Court Cases", category: "LA & RR", sort_order: 6, is_active: 1 },
  { id: 7, slug: "cases-rr-commissioner-office", nav_label: "R&R Commissioner", title: "R&R Commissioner", category: "LA & RR", sort_order: 7, is_active: 1 },
  { id: 8, slug: "legal-compliances", nav_label: "Cases @ LA & RR Court", title: "Cases @ LA & RR Court", category: "LA & RR", sort_order: 8, is_active: 1 },
  { id: 9, slug: "high-court-cases-wg", nav_label: "High Court WG", title: "High Court WG", category: "LA & RR", sort_order: 9, is_active: 1 },
  { id: 10, slug: "high-court-cases-eg", nav_label: "High Court EG", title: "High Court EG", category: "LA & RR", sort_order: 10, is_active: 1 },
  { id: 11, slug: "rr-package", nav_label: "RR Packages", title: "RR Packages", category: "LA & RR", sort_order: 11, is_active: 1 },
  { id: 12, slug: "rr-colony-layouts", nav_label: "R&R Colony Layouts", title: "R&R Colony Layouts", category: "LA & RR", sort_order: 12, is_active: 1 },
  { id: 13, slug: "submergence-villages-abstract", nav_label: "Submergence Villages", title: "Submergence Villages", category: "LA & RR", sort_order: 13, is_active: 1 },
  { id: 14, slug: "dprs", nav_label: "DPR's", title: "DPR's", category: "LA & RR", sort_order: 14, is_active: 1 },
  { id: 15, slug: "award-copies", nav_label: "Award Copies", title: "Award Copies", category: "LA & RR", sort_order: 15, is_active: 1 },
  { id: 16, slug: "housing-colonies-construction-status", nav_label: "Housing Colonies", title: "Housing Colonies", category: "LA & RR", sort_order: 16, is_active: 1 }
];

export async function fetchLaRrPages() {
  let fallback = defaultLaRrPages;
  if (typeof localStorage !== "undefined") {
    try {
      const cached = localStorage.getItem("alertngo_larr_pages_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) fallback = parsed;
      }
    } catch (_) { }
  }
  return safeGet("get_larr_pages.php", fallback);
}

export async function fetchLaRrPageBySlug(slug) {
  const fallback = { data: null };
  return safeGet(`get_larr_pages.php?slug=${encodeURIComponent(slug)}`, fallback);
}

export const adminListLaRrPages = (key) => adminRequest("admin_larr.php", "get", key);
export const adminGetLaRrPage = (key, idOrSlug) => adminRequest(`admin_larr.php?${typeof idOrSlug === "number" ? `id=${idOrSlug}` : `slug=${encodeURIComponent(idOrSlug)}`}`, "get", key);
export const adminCreateLaRrPage = (key, payload) => adminRequest("admin_larr.php", "post", key, { action: "create_page", ...payload });
export const adminUpdateLaRrPage = (key, payload) => adminRequest("admin_larr.php", "post", key, { action: "update_page", ...payload });
export const adminDeleteLaRrPage = (key, idOrSlug) => {
  const payload = { action: "delete_page" };
  if (typeof idOrSlug === "number") {
    payload.id = idOrSlug;
  } else {
    payload.slug = idOrSlug;
    payload.id = idOrSlug;
  }
  return adminRequest("admin_larr.php", "post", key, payload);
};
export const adminAddLaRrDocument = (key, payload) => adminRequest("admin_larr.php", "post", key, { action: "add_document", ...payload });
export const adminUpdateLaRrDocument = (key, payload) => adminRequest("admin_larr.php", "post", key, { action: "update_document", ...payload });
export const adminDeleteLaRrDocument = (key, pageIdOrSlug, docIndex) => {
  const payload = { action: "delete_document", doc_index: docIndex };
  if (typeof pageIdOrSlug === "number") {
    payload.page_id = pageIdOrSlug;
  } else {
    payload.slug = pageIdOrSlug;
    payload.page_id = pageIdOrSlug;
  }
  return adminRequest("admin_larr.php", "post", key, payload);
};
export const adminSaveLaRrContent = (key, payload) => adminRequest("admin_larr.php", "post", key, { action: "save_content", ...payload });
export const adminReorderLaRrPages = (key, orderedIds) => adminRequest("admin_larr.php", "post", key, { action: "reorder_pages", ordered_ids: orderedIds });

// 8E. RoFR & LTR PROJECT PAGES & DOCUMENTS (/rofr, /abstract-rofr, /ltr, etc.)
export const defaultRofrPages = [
  { id: 1, slug: "rofr", nav_label: "RoFR & LTR Overview", title: "RoFR & LTR Overview", category: "RoFR & LTR", sort_order: 1, is_active: 1 },
  { id: 2, slug: "abstract-rofr", nav_label: "Abstract RoFR", title: "Abstract RoFR", category: "RoFR & LTR", sort_order: 2, is_active: 1 },
  { id: 3, slug: "reasons-for-rejections", nav_label: "Rejection Reasons", title: "Rejection Reasons", category: "RoFR & LTR", sort_order: 3, is_active: 1 },
  { id: 4, slug: "compendium-of-judgements-rofr", nav_label: "RoFR Judgements", title: "RoFR Judgements", category: "RoFR & LTR", sort_order: 4, is_active: 1 },
  { id: 5, slug: "rofr-g-os", nav_label: "RoFR Rules-G.Os", title: "RoFR Rules-G.Os", category: "RoFR & LTR", sort_order: 5, is_active: 1 },
  { id: 6, slug: "ltr", nav_label: "LTR ASR", title: "LTR ASR", category: "RoFR & LTR", sort_order: 6, is_active: 1 },
  { id: 7, slug: "ltr-eluru", nav_label: "LTR ELURU", title: "LTR ELURU", category: "RoFR & LTR", sort_order: 7, is_active: 1 },
  { id: 8, slug: "ltr-disposal-meanings", nav_label: "LTR Disposal", title: "LTR Disposal", category: "RoFR & LTR", sort_order: 8, is_active: 1 }
];

export async function fetchRofrPages() {
  let fallback = defaultRofrPages;
  if (typeof localStorage !== "undefined") {
    try {
      const cached = localStorage.getItem("alertngo_rofr_pages_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) fallback = parsed;
      }
    } catch (_) { }
  }
  return safeGet("get_rofr_pages.php", fallback);
}

export async function fetchRofrPageBySlug(slug) {
  const fallback = { data: null };
  return safeGet(`get_rofr_pages.php?slug=${encodeURIComponent(slug)}`, fallback);
}

export const adminListRofrPages = (key) => adminRequest("admin_rofr.php", "get", key);
export const adminGetRofrPage = (key, idOrSlug) => adminRequest(`admin_rofr.php?${typeof idOrSlug === "number" ? `id=${idOrSlug}` : `slug=${encodeURIComponent(idOrSlug)}`}`, "get", key);
export const adminCreateRofrPage = (key, payload) => adminRequest("admin_rofr.php", "post", key, { action: "create_page", ...payload });
export const adminUpdateRofrPage = (key, payload) => adminRequest("admin_rofr.php", "post", key, { action: "update_page", ...payload });
export const adminDeleteRofrPage = (key, idOrSlug) => {
  const payload = { action: "delete_page" };
  if (typeof idOrSlug === "number") {
    payload.id = idOrSlug;
  } else {
    payload.slug = idOrSlug;
    payload.id = idOrSlug;
  }
  return adminRequest("admin_rofr.php", "post", key, payload);
};
export const adminAddRofrDocument = (key, payload) => adminRequest("admin_rofr.php", "post", key, { action: "add_document", ...payload });
export const adminUpdateRofrDocument = (key, payload) => adminRequest("admin_rofr.php", "post", key, { action: "update_document", ...payload });
export const adminDeleteRofrDocument = (key, pageIdOrSlug, docIndex) => {
  const payload = { action: "delete_document", doc_index: docIndex };
  if (typeof pageIdOrSlug === "number") {
    payload.page_id = pageIdOrSlug;
  } else {
    payload.slug = pageIdOrSlug;
    payload.page_id = pageIdOrSlug;
  }
  return adminRequest("admin_rofr.php", "post", key, payload);
};
export const adminSaveRofrContent = (key, payload) => adminRequest("admin_rofr.php", "post", key, { action: "save_content", ...payload });
export const adminReorderRofrPages = (key, orderedIds) => adminRequest("admin_rofr.php", "post", key, { action: "reorder_pages", ordered_ids: orderedIds });

// 8F. FLOOD RELIEF PAGES, MISSIONS & PHOTOS (/flood-relief-measures, /2023-2, etc.)
export async function fetchFloodReliefPages() {
  const fallback = { data: [] };
  return safeGet("get_flood_relief_pages.php", fallback);
}

export async function fetchFloodReliefPageBySlug(slug) {
  const fallback = { data: null };
  return safeGet(`get_flood_relief_pages.php?slug=${encodeURIComponent(slug)}`, fallback);
}

export const adminListFloodReliefPages = (key) => adminRequest("admin_flood_relief.php", "get", key);
export const adminGetFloodReliefPage = (key, idOrSlug) => adminRequest(`admin_flood_relief.php?${typeof idOrSlug === "number" ? `id=${idOrSlug}` : `slug=${encodeURIComponent(idOrSlug)}`}`, "get", key);
export const adminCreateFloodReliefPage = (key, payload) => adminRequest("admin_flood_relief.php", "post", key, { action: "create_page", ...payload });
export const adminUpdateFloodReliefPage = (key, payload) => adminRequest("admin_flood_relief.php", "post", key, { action: "update_page", ...payload });
export const adminDeleteFloodReliefPage = (key, idOrSlug) => {
  const payload = { action: "delete_page" };
  if (typeof idOrSlug === "number") {
    payload.id = idOrSlug;
  } else {
    payload.slug = idOrSlug;
    payload.id = idOrSlug;
  }
  return adminRequest("admin_flood_relief.php", "post", key, payload);
};
export const adminAddFloodReliefDocument = (key, payload) => adminRequest("admin_flood_relief.php", "post", key, { action: "add_document", ...payload });
export const adminUpdateFloodReliefDocument = (key, payload) => adminRequest("admin_flood_relief.php", "post", key, { action: "update_document", ...payload });
export const adminDeleteFloodReliefDocument = (key, pageIdOrSlug, docIndex) => {
  const payload = { action: "delete_document", doc_index: docIndex };
  if (typeof pageIdOrSlug === "number") {
    payload.page_id = pageIdOrSlug;
  } else {
    payload.slug = pageIdOrSlug;
    payload.page_id = pageIdOrSlug;
  }
  return adminRequest("admin_flood_relief.php", "post", key, payload);
};
export const adminSaveFloodReliefContent = (key, payload) => adminRequest("admin_flood_relief.php", "post", key, { action: "save_content", ...payload });
export const adminReorderFloodReliefPages = (key, orderedIds) => adminRequest("admin_flood_relief.php", "post", key, { action: "reorder_pages", ordered_ids: orderedIds });

// 8G. ACHIEVEMENTS, CHILD INTERVENTIONS & REPORTS (/achievements, /child-interventions, etc.)
export async function fetchAchievementsPages() {
  const fallback = { data: [] };
  return safeGet("get_achievements_pages.php", fallback);
}
export const adminListAchievementsPages = (key) => adminRequest("admin_achievements.php", "get", key);
export const adminGetAchievementsPage = (key, idOrSlug) => adminRequest(`admin_achievements.php?${typeof idOrSlug === "number" ? `id=${idOrSlug}` : `slug=${encodeURIComponent(idOrSlug)}`}`, "get", key);
export const adminCreateAchievementsPage = (key, payload) => adminRequest("admin_achievements.php", "post", key, { action: "create_page", ...payload });
export const adminUpdateAchievementsPage = (key, payload) => adminRequest("admin_achievements.php", "post", key, { action: "update_page", ...payload });
export const adminDeleteAchievementsPage = (key, idOrSlug) => {
  const payload = { action: "delete_page" };
  if (typeof idOrSlug === "number") {
    payload.id = idOrSlug;
    payload.page_id = idOrSlug;
  } else {
    payload.slug = idOrSlug;
    payload.page_id = idOrSlug;
  }
  return adminRequest("admin_achievements.php", "post", key, payload);
};
export const adminSaveAchievementsContent = (key, payload) => adminRequest("admin_achievements.php", "post", key, { action: "save_page", ...payload });

// 9. INSTAGRAM REELS ("Stories from the Field")
export const defaultReelsHeader = {
  badge: "Instagram",
  title: "Stories from the Field",
  subtitle: "Short videos from our work across Andhra Pradesh — follow us for the latest from the communities we serve.",
  profile_handle: "alert.ngo",
  profile_meta: "@alert.ngo · Instagram",
  profile_bio: "Adivasi rights, forest governance & women's collectives across Andhra Pradesh.",
  profile_url: "https://www.instagram.com/alert.ngo/",
  avatar_url: "/uploads/alert-logo-transparent-cropped-removebg-preview-2.png"
};

export const defaultReels = [
  {
    id: 1,
    label: "Reel 1",
    duration: "0:08",
    topic: "Culture & Identity",
    title: "Dhimsa dance at a community gathering",
    img: "/uploads/reels/reel-1-dhimsa.jpg",
    image_url: "/uploads/reels/reel-1-dhimsa.jpg",
    video: "/uploads/reels/reel-1-dhimsa.mp4",
    video_url: "/uploads/reels/reel-1-dhimsa.mp4",
    sort_order: 1,
    is_active: 1
  },
  {
    id: 2,
    label: "Reel 2",
    duration: "0:08",
    topic: "Education",
    title: "Digital learning reaches agency schools",
    img: "/uploads/reels/reel-2-learning.jpg",
    image_url: "/uploads/reels/reel-2-learning.jpg",
    video: "/uploads/reels/reel-2-learning.mp4",
    video_url: "/uploads/reels/reel-2-learning.mp4",
    sort_order: 2,
    is_active: 1
  },
  {
    id: 3,
    label: "Reel 3",
    duration: "0:08",
    topic: "Child Support",
    title: "School kits for children in hill villages",
    img: "/uploads/reels/reel-3-school-kits.jpg",
    image_url: "/uploads/reels/reel-3-school-kits.jpg",
    video: "/uploads/reels/reel-3-school-kits.mp4",
    video_url: "/uploads/reels/reel-3-school-kits.mp4",
    sort_order: 3,
    is_active: 1
  },
  {
    id: 4,
    label: "Reel 4",
    duration: "0:08",
    topic: "Women's Collectives",
    title: "Yenadi women's federation convention",
    img: "/uploads/reels/reel-4-women.jpg",
    image_url: "/uploads/reels/reel-4-women.jpg",
    video: "/uploads/reels/reel-4-women.mp4",
    video_url: "/uploads/reels/reel-4-women.mp4",
    sort_order: 4,
    is_active: 1
  }
];

export async function fetchHomeReels() {
  const fallback = { data: defaultReels, header: defaultReelsHeader };
  return safeGet("get_reels.php", fallback);
}

export const adminListReels = (key) => adminRequest("admin_reels.php", "get", key);
export const adminCreateReel = (key, payload) => adminRequest("admin_reels.php", "post", key, payload);
export const adminUpdateReel = (key, payload) => adminRequest("admin_reels.php", "put", key, payload);
export const adminDeleteReel = (key, id) => adminRequest("admin_reels.php", "delete", key, { id });
export const adminReorderReels = (key, payload) => adminRequest("admin_reels.php", "put", key, { action: "reorder", reels: payload });
export const adminSaveReelsHeader = (key, payload) => adminRequest("admin_reels.php", "put", key, { action: "header", ...payload });

export const defaultTestimonialsHeader = {
  badge: "Testimonials",
  title: "Voices from the Community",
  google_reviews_title: "Google Reviews",
  google_reviews_subtitle: "See what our community says on Google",
  google_reviews_url: "https://www.google.com/search?q=ALERT+NGO+Vijayawada+reviews",
  google_rating: 5.0,
  show_google_badge: 1
};

export const defaultTestimonials = [
  {
    id: 1,
    name: "Ramaiah G.",
    role: "Village Leader, Khammam District",
    text: "ALERT has transformed our village. We finally have our forest rights documents and can access the forest resources that belong to us.",
    avatar: null,
    avatar_color: "#D2190C",
    rating: 5,
    source: "Google",
    sort_order: 1,
    is_active: 1
  },
  {
    id: 2,
    name: "Lakshmi Devi",
    role: "Matsya Mithra Group Member",
    text: "Thanks to ALERT's women cooperative, I can now earn independently through fishing. My children are in school and our lives have changed.",
    avatar: null,
    avatar_color: "#3E8E0F",
    rating: 5,
    source: "Google",
    sort_order: 2,
    is_active: 1
  },
  {
    id: 3,
    name: "Venkat Rao",
    role: "Tribal Community Member",
    text: "The solar poles installed by ALERT mean our children can study at night. Education opportunities have improved dramatically.",
    avatar: null,
    avatar_color: "#F5A623",
    rating: 5,
    source: "Google",
    sort_order: 3,
    is_active: 1
  },
  {
    id: 4,
    name: "Sanna Koya",
    role: "Gram Sabha Member, ASR Agency",
    text: "Our Gram Sabha finally has the powers the PESA Act promised. Decisions about our forests are made in the village, not in an office far away.",
    avatar: null,
    avatar_color: "#005696",
    rating: 5,
    source: "Google",
    sort_order: 4,
    is_active: 1
  },
  {
    id: 5,
    name: "Mutta Raju",
    role: "Flood-Affected Farmer, Eluru Agency",
    text: "When the Godavari flooded, ALERT's boat reached us with rice, water and medicines before any other help arrived.",
    avatar: null,
    avatar_color: "#7B1FA2",
    rating: 5,
    source: "Google",
    sort_order: 5,
    is_active: 1
  },
  {
    id: 6,
    name: "Durgamma P.",
    role: "Matsya Mithra Federation Member",
    text: "The Matsya Mithra cooperative gave fisherwomen in our village a collective voice, better prices and a steady income.",
    avatar: null,
    avatar_color: "#C2185B",
    rating: 5,
    source: "Google",
    sort_order: 6,
    is_active: 1
  },
  {
    id: 7,
    name: "Ravi Kumar",
    role: "Digital Learning Student, Khammam",
    text: "I learned to use a computer for the first time at the ALERT learning centre. Now I help my younger sister with her schoolwork.",
    avatar: null,
    avatar_color: "#00796B",
    rating: 5,
    source: "Google",
    sort_order: 7,
    is_active: 1
  },
  {
    id: 8,
    name: "Meenakshi V.",
    role: "Parent, Rampachodavaram ITDA",
    text: "The school kit my children received at the start of the year meant they could attend class with everything they needed.",
    avatar: null,
    avatar_color: "#E64A19",
    rating: 5,
    source: "Google",
    sort_order: 8,
    is_active: 1
  },
  {
    id: 9,
    name: "Buchamma K.",
    role: "Community Forest Rights Holder",
    text: "With ALERT's legal support our village filed for community forest rights together. The title is in the name of the whole community.",
    avatar: null,
    avatar_color: "#388E3C",
    rating: 5,
    source: "Google",
    sort_order: 9,
    is_active: 1
  },
  {
    id: 10,
    name: "Prasad Naidu",
    role: "Project Displaced Family, Polavaram Belt",
    text: "ALERT helped our family understand the rehabilitation package we were owed and follow up until the papers were cleared.",
    avatar: null,
    avatar_color: "#512DA8",
    rating: 5,
    source: "Google",
    sort_order: 10,
    is_active: 1
  }
];

export async function fetchHomeTestimonials() {
  const fallback = { data: defaultTestimonials, header: defaultTestimonialsHeader };
  return safeGet("get_testimonials.php", fallback);
}

export const adminListTestimonials = (key) => adminRequest("admin_testimonials.php", "get", key);
export const adminCreateTestimonial = (key, payload) => adminRequest("admin_testimonials.php", "post", key, payload);
export const adminUpdateTestimonial = (key, payload) => adminRequest("admin_testimonials.php", "put", key, payload);
export const adminDeleteTestimonial = (key, id) => adminRequest("admin_testimonials.php", "delete", key, { id });
export const adminReorderTestimonials = (key, payload) => adminRequest("admin_testimonials.php", "put", key, { action: "reorder", testimonials: payload });
export const adminSaveTestimonialsHeader = (key, payload) => adminRequest("admin_testimonials.php", "put", key, { action: "header", ...payload });

// ── About Us Sub-Pages ──
export const defaultAboutPages = {
  "about": {
    slug: "about",
    badge: "Section 00",
    title: "About Us",
    subtitle: "ALERT — Association for Land and Livelihood, Environment, Research and Training — is a grassroots non-profit working with Adivasi and marginalized communities across the Fifth Scheduled Areas of Andhra Pradesh since 2004.",
    banner_image: null,
    content: {
      est_badge: "Est. 2004",
      org_heading: "Association for Land and Livelihood, Environment, Research and Training",
      p1: "ALERT was established in 2004 under the Societies Registration Act (Reg. No. 307/2004) and is headquartered in Vijayawada, Andhra Pradesh. Led by founder-director YL Jayaraj, who brings 47 years of experience in grass-roots human rights and community empowerment, ALERT specializes in supporting marginalized communities in the Fifth Scheduled Areas.",
      p2: "Our mandate spans affirmative legislation enforcement, the Forest Rights Act (RoFR 2006), the PESA Act 1996, Land Transfer Regulation 1 of 1970, and fair rehabilitation for communities displaced by mega irrigation projects like Polavaram.",
      hero_image: "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg",
      // Section 01: Profile
      sec01_badge: "Section 01",
      sec01_title: "Organizational Profile",
      sec01_subtitle: "Who we are, our statutory mandate, and the legal accreditations that underpin every ALERT intervention.",
      accreditations_title: "Legal Accreditations",
      accreditations_desc: "12A, 80G Tax Exemption, FCRA Registered",
      governance_title: "Governance Code",
      governance_desc: "Governed by 35 Institutional Policies",
      profile_pdf: "/uploads/Organizational-Profile-of-ALERT.pdf",
      annual_report_pdf: "/uploads/ALERT_Annual-report-from-April-2020-to-March-2021-1.pdf",

      // Section 02: Organogram
      sec02_badge: "Section 02",
      sec02_title: "Organogram Chart",
      sec02_subtitle: "The democratic governance hierarchy — from the sovereign General Body down to autonomous grassroots Gram Sabhas and field operational cells.",
      organogram_arch_badge: "Organizational Architecture",
      organogram_arch_sub: "Democratic Governance Hierarchy",
      organogram_heading: "Interactive Institutional Organogram",
      organogram_desc: "Visualizing ALERT's transparent governance framework: from the sovereign General Body down to autonomous grassroots Gram Sabhas and field operational cells.",
      organogram_wings: [
        {
          id: "legal_wing",
          title: "Legal Cell & Constitutional Advocacy",
          subtitle: "PESA, RoFR & LTR Legal Aid Unit",
          desc: "Drafts High Court PILs, RTI representations, Forest Rights Act (RoFR 2006) community claims, and Land Transfer Regulation 1/70 land restitution suits.",
          color: "#10b981",
          badge: "Legal Cell",
          lead: "Paralegal Team & Constitutional Scholars"
        },
        {
          id: "polavaram_wing",
          title: "Polavaram LA & R&R Field Unit",
          subtitle: "371 Submerged Villages Relief Command",
          desc: "Monitors statutory rehabilitation under RFCTLARR Act 2013, conducts field surveys across Godavari gorge hamlets, and verifies land-for-land entitlements.",
          color: "#f59e0b",
          badge: "R&R Cell",
          lead: "Field Surveyors & Community Organizers"
        },
        {
          id: "antyodaya_wing",
          title: "Antyodaya Livelihoods & Women Cooperatives",
          subtitle: "Nomadic Yenadi & Coastal Fisheries Directorate",
          desc: "Manages the 3,500-member Matsya Mithra Women Fisheries Federation, nomadic tribal housing pattas, and solar micro-grid installations.",
          color: "#0ea5e9",
          badge: "Community Co-ops",
          lead: "Cooperative Managers & Field Mobilizers"
        },
        {
          id: "finance_wing",
          title: "Finance, Administration & Compliance",
          subtitle: "Statutory Governance & 35 Policies Registry",
          desc: "Oversees 12A, 80G, FCRA statutory compliance, quarterly double-entry audits, POSH Internal Complaints Committee, and procurement standards.",
          color: "#8b5cf6",
          badge: "Compliance Cell",
          lead: "Chartered Accountants & Internal Auditors"
        }
      ],

      // Section 03: Area of Operation
      sec03_badge: "Section 03",
      sec03_title: "Area of Operation Map",
      sec03_subtitle: "17 mandal stations and 4 operational jurisdictions across the Fifth-Scheduled Agency Belt and Coastal Krishna Belt of Andhra Pradesh.",

      // Section 04: 35 Policies
      sec04_badge: "Section 04",
      sec04_title: "ALERT 35 Policies",
      sec04_subtitle: "35 formalized statutory charters certified by the ALERT Governing Body ensuring democratic transparency, protection, and financial accountability.",
      ...DEFAULT_COMPLIANCE_PORTAL,
      policies: DEFAULT_35_POLICIES,

      // Section 05: Milestones
      sec05_badge: "Section 05",
      sec05_title: "20-Year Milestones",
      sec05_subtitle: "The journey from 2004 registration to two decades of transformative grassroots justice, appellate litigation, and women cooperative federations.",
      timeline_badge: DEFAULT_TIMELINE_HEADER.badge,
      timeline_sub: DEFAULT_TIMELINE_HEADER.sub,
      timeline_heading: DEFAULT_TIMELINE_HEADER.heading,
      timeline_desc: DEFAULT_TIMELINE_HEADER.desc,
      timeline_jubilee_title: DEFAULT_TIMELINE_HEADER.jubilee_title,
      timeline_jubilee_sub: DEFAULT_TIMELINE_HEADER.jubilee_sub,
      timeline_metrics: DEFAULT_TIMELINE_METRICS,
      milestones: DEFAULT_MILESTONES,

      // Section 06: Governing Body
      governing_badge: "Section 06",
      governing_title: "Governing Body",
      governing_subtitle: "The democratic Board of Directors that guides ALERT's mission across Andhra Pradesh since 2004.",
      governing_intro: "ALERT is governed by a dedicated Board of Directors comprising legal scholars, development activists, and community leaders. The Governing Body ensures statutory compliance (12A, 80G, FCRA) and directs all field interventions across forest rights, land acquisition & rehabilitation, women's cooperatives, and disaster relief.",
      board_members: [
        {
          name: "Prof. Ch. Diwakar Babu",
          role: "President",
          badge: "Board of Directors",
          img: "/uploads/Divakar-Babu.jpg",
          bio: "Renowned legal scholar and former Principal of V.R. Law College. A constitutional rights specialist guiding ALERT's legal interventions in tribal Fifth-Scheduled Areas of Andhra Pradesh.",
          highlights: "Principal VR Law College, Constitutional Rights Expert, Appellate Litigation Advisor",
          quote: "Justice is non-negotiable for the indigenous forest dwelling communities."
        },
        {
          name: "Mr V. Rama Krishna",
          role: "Vice President",
          badge: "Board of Directors",
          img: "/uploads/Ramakrishna.jpg",
          bio: "Senior development activist specializing in rural livelihood cooperatives and natural resource stewardship for forest hamlets.",
          highlights: "Rural Livelihood Cooperatives, Community Mobilization, Natural Resource Policy",
          quote: "Self-reliance begins when communities govern their own indigenous land."
        },
        {
          name: "Mr Y.L.J.B. Jayaraj",
          role: "Executive Secretary",
          badge: "Founder & Director",
          img: "/uploads/jayaraj-sir.jpg",
          bio: "Founder and Chief Functionary of ALERT with 47+ years of grassroots human rights experience. Specialist in FRA & PESA enforcement.",
          highlights: "47+ Years Grassroots Leadership, FRA & PESA Enforcement Specialist",
          quote: "Every tribal settlement has a constitutional right to sovereignty, dignity, and flourishing."
        },
        {
          name: "Ms P. Sirisha",
          role: "Treasurer",
          badge: "Board of Directors",
          img: "/uploads/Sirisha-1.jpg",
          bio: "Development finance specialist overseeing statutory financial auditing and 12A & 80G compliance.",
          highlights: "12A & 80G Compliances, Statutory Financial Auditing, Transparent Donor Reporting",
          quote: "Uncompromising integrity and financial transparency are our core tenets."
        }
      ],

      // Section 07: Vision & Mission
      sec07_badge: "Section 07",
      sec07_title: "Vision & Mission",
      sec07_subtitle: "Guiding principles that drive every intervention across forest rights, land rehabilitation, and tribal empowerment.",
      vision_tag: "Vision Statement",
      vision_title: "Empowerment towards Prosperity & Peace",
      vision_quote: "Empowerment of socially excluded and marginalized towards prosperity and peace",
      vision_desc: "ALERT envisions a future where every socially excluded and marginalized Adivasi family lives with dignity, self-governance, and equitable access to forest rights, land, and livelihood opportunities.",
      mission_tag: "Mission Statement",
      mission_title: "Awaken, Sensitize, Organize, Mobilize",
      mission_quote: "To awaken, sensitize, organize and mobilize the Adivasi communities for Self-governance, Self-reliance and Sustainable environment and development",
      mission_desc: "ALERT works hand-in-hand with tribal communities to secure forest rights under the RoFR Act 2006, ensure fair land acquisition and rehabilitation, and build women-led cooperative federations.",

      // Section 08: Core Values
      sec08_badge: "Section 08",
      sec08_title: "Core Values",
      sec08_subtitle: "The principles that guide every ALERT intervention — from forest rights to women's cooperatives and disaster relief.",
      core_values: [
        { title: "Integrity", quote: "We choose our thoughts and actions based on values rather than personal gain.", accent: "#D2190C" },
        { title: "Accountability", quote: "We love to be slapped with truth than to be kissed with a lie.", accent: "#003190" },
        { title: "Transparency", quote: "We build trust through transparency.", accent: "#3E8E0F" },
        { title: "Gender Justice", quote: "We believe and practice equality.", accent: "#F5A000" },
        { title: "Professionalism", quote: "We don't just do it but we prefer to do it in the best way possible.", accent: "#003190" },
        { title: "Excellence", quote: "It is not by accident but the result of our high intention.", accent: "#D2190C" },
        { title: "Empathy", quote: "We carry the message that 'you are not alone'.", accent: "#D2190C" }
      ]
    }
  },
  "governing-body": {
    slug: "governing-body",
    badge: "Leadership",
    title: "Governing Body & Leadership",
    subtitle: "Elected leadership and constitutional scholars dedicated to justice, dignity, and sustainable prosperity for Adivasis.",
    banner_image: null,
    content: {
      society_reg: "Reg. No. 307/2004 under Societies Registration Act XXI of 1860",
      tenure_desc: "The Governing Body is elected every 3 years in accordance with the registered bye-laws of the society, ensuring democratic representation and statutory oversight.",
      legal_cell_title: "ALERT Legal Defense Cell",
      legal_cell_desc: "Guided by senior constitutional attorneys and former principals of law colleges, ALERT's legal cell provides pro-bono litigation, appeals before the High Court of Andhra Pradesh, and RoFR title disputes."
    }
  },
  "vision-mission": {
    slug: "vision-mission",
    badge: "Section 01",
    title: "Vision & Mission",
    subtitle: "Guiding principles that drive every intervention across forest rights, land rehabilitation, and tribal empowerment since 2004.",
    banner_image: null,
    content: {
      vision: {
        tag: "OUR VISION",
        subtitle: "Core Direction",
        statement_label: "Vision Statement",
        title: "Our Vision",
        quote: "An egalitarian society where tribal and marginalized communities live with sovereign dignity, social justice, and constitutional self-determination.",
        desc: "ALERT envisions an inclusive and resilient society in which Adivasis and vulnerable forest hamlets govern their ancestral ecosystems through constitutional safeguards like PESA 1996 and RoFR 2006. We strive for an India where indigenous wisdom guides ecological conservation and every child accesses equitable quality education without losing their cultural roots.",
        image: "/uploads/cropped-12.jpg",
        points: [
          "Sovereignty over ancestral forest domains and community water resources.",
          "Active constitutional legal aid protecting vulnerable indigenous families.",
          "Empowered women cooperatives leading economic grassroots enterprises.",
          "Intergenerational cultural preservation of language, music, and traditions."
        ]
      },
      mission: {
        tag: "OUR MISSION",
        subtitle: "Strategic Mandate",
        statement_label: "Mission Statement",
        title: "Our Mission",
        quote: "Mobilizing communities, defending constitutional land tenure, and fostering sustainable indigenous livelihoods through collaborative grassroots action.",
        desc: "To educate, organize, and legally support tribal and forest-dwelling communities across Andhra Pradesh to claim their statutory rights under the Forest Rights Act 2006 and LARR Act 2013, while pioneering sustainable solar electrification and women-led cooperative enterprises.",
        image: "/uploads/cropped-4.jpg",
        pillars: [
          "Rights Enforcement",
          "Grassroots Organizing",
          "Sustainable Livelihoods",
          "Emergency Relief & Energy"
        ]
      },
      profile_pdf: "/uploads/Organizational-Profile-of-ALERT.pdf",
      profile_pdf_label: "Download Official Profile PDF",
      stats: {
        badge: "Our Impact",
        title: "Numbers That Speak",
        subtitle: "Two decades of grassroots work across the Fifth Scheduled Areas of Andhra Pradesh — measured in lives touched, rights secured, and communities empowered.",
        items: [
          { num: "20+", label: "Years of Service", desc: "Rooted in tribal empowerment since 2004", color: "#F5A000" },
          { num: "25,000+", label: "Adivasi Families", desc: "Households supported across three regions", color: "#38BDF8" },
          { num: "15,000+", label: "Forest Rights Acres", desc: "Individual & community forest titles secured", color: "#3E8E0F" },
          { num: "371", label: "Submergence Villages", desc: "Polavaram belt habitations defended", color: "#D2190C" },
          { num: "75+", label: "Solar Hamlets", desc: "Off-grid villages electrified", color: "#F5A000" }
        ]
      },
      beliefs: {
        badge: "Core Beliefs",
        title: "What We Stand For",
        subtitle: "ALERT's work is anchored in these core beliefs that shape every project, partnership, and policy advocacy we undertake.",
        items: [
          { title: "Rights First", desc: "Every tribal family has a constitutional right to ancestral forest land.", color: "#003190" },
          { title: "Self-Reliance", desc: "Building Gram Sabha sovereignty and women-led cooperatives.", color: "#D2190C" },
          { title: "Sustainable Ecology", desc: "Protecting forests and natural resources for future generations.", color: "#3E8E0F" },
          { title: "Collective Action", desc: "Strengthening community-based organizations across agency mandals.", color: "#F5A000" },
          { title: "Gender Justice", desc: "Empowering Yenadi and tribal women through cooperatives.", color: "#D2190C" },
          { title: "Clean Energy", desc: "Bringing solar lighting to off-grid tribal hamlets.", color: "#3E8E0F" },
          { title: "Legal Advocacy", desc: "Fighting for fair compensation and R&R packages.", color: "#003190" },
          { title: "Transparency", desc: "12A & 80G certified, FCRA registered, annual audits.", color: "#F5A000" }
        ]
      },
      approach: {
        badge: "Our Approach",
        title: "From Rights to Resilience",
        desc: "ALERT follows a rights-based development approach: we awaken communities to their constitutional entitlements, sensitize duty-bearers to their obligations, organize Gram Sabhas into collective decision-making bodies, and mobilize resources for sustainable forest rights, land justice, and livelihood security.",
        tags: ["Community-Led", "Rights-Based", "Sustainable"]
      }
    }
  },
  "core-values": {
    slug: "core-values",
    badge: "Section 02",
    title: "Core Values",
    subtitle: "The principles that guide every ALERT intervention — from forest rights to land rehabilitation, from women's cooperatives to disaster relief.",
    banner_image: null,
    content: {
      values: [
        {
          id: "integrity",
          title: "Integrity",
          quote: "We choose our thoughts and actions based on values rather than personal gain.",
          desc: "Integrity is the foundation of everything ALERT does. We commit to honest, ethical, and principled action in every intervention — from forest rights claims to land rehabilitation — ensuring that our work stands on moral ground.",
          icon: "FaShieldAlt",
          accent: "#D2190C",
          image: ""
        },
        {
          id: "accountability",
          title: "Accountability",
          quote: "We love to be slapped with truth than to be kissed with a lie.",
          desc: "ALERT holds itself answerable to the communities we serve, our donors, and the law. Every rupee spent, every decision made, and every claim filed is documented, audited, and open to scrutiny.",
          icon: "FaBalanceScale",
          accent: "#003190",
          image: ""
        },
        {
          id: "transparency",
          title: "Transparency",
          quote: "We build trust through transparency.",
          desc: "Trust is earned through openness. ALERT shares financial records, project reports, and governance decisions publicly — because the communities we work with deserve to know exactly how we operate.",
          icon: "FaEye",
          accent: "#3E8E0F",
          image: ""
        },
        {
          id: "gender-justice",
          title: "Gender Justice",
          quote: "We believe and practice equality.",
          desc: "Gender equality is non-negotiable. ALERT actively promotes women's leadership in Gram Sabhas, Matsya Mithra cooperatives, and all community institutions — ensuring women are decision-makers, not just participants.",
          icon: "FaUsers",
          accent: "#F5A000",
          image: ""
        },
        {
          id: "professionalism",
          title: "Professionalism",
          quote: "We don't just do it but we prefer to do it in the best way possible.",
          desc: "Excellence in execution is our standard. From legal documentation to field surveys, ALERT applies professional rigor, trained staff, and proven methodologies to every project we undertake.",
          icon: "FaStar",
          accent: "#003190",
          image: ""
        },
        {
          id: "excellence",
          title: "Excellence",
          quote: "It is not by accident but the result of our high intention.",
          desc: "Excellence is intentional. ALERT sets high standards for impact, quality, and sustainability — because marginalized communities deserve nothing less than our absolute best effort.",
          icon: "FaAward",
          accent: "#D2190C",
          image: ""
        },
        {
          id: "empathy",
          title: "Empathy",
          quote: "We carry the message that 'you are not alone'.",
          desc: "Behind every case file is a human being. ALERT approaches every Adivasi family, every displaced villager, and every woman cooperative member with compassion, listening first and acting with care.",
          icon: "FaHeart",
          accent: "#D2190C",
          image: ""
        }
      ],
      manifesto_badge: "Our Manifesto",
      manifesto_title: "Values in Action",
      manifesto_desc: "These seven values are not just words on a page — they are lived every day in the field. From the Gram Sabha meetings in agency mandals to the courtrooms defending forest rights, from the women's cooperative meetings to the disaster relief operations, ALERT's values shape every decision, every relationship, and every outcome.",
      manifesto_tags: ["Integrity", "Accountability", "Transparency", "Gender Justice", "Professionalism", "Excellence", "Empathy"]
    }
  },
  "organizational-profile": {
    slug: "organizational-profile",
    badge: "Section 03",
    title: "Organizational Profile",
    subtitle: "Who we are, our statutory mandate, and the legal accreditations that underpin every ALERT intervention since 2004.",
    banner_image: null,
    content: {
      info_cards: [
        {
          title: "Organization Name",
          value: "Association for Land and Livelihood, Environment, Research and Training (ALERT)",
          subtitle: "Registered Non-Profit Society",
          icon: "FaLandmark",
          color: "#003190"
        },
        {
          title: "Established",
          value: "2004",
          subtitle: "Registration No. 307/2004",
          icon: "FaCalendar",
          color: "#D2190C"
        },
        {
          title: "Headquarters",
          value: "Vijayawada, Andhra Pradesh, India",
          subtitle: "Fifth Scheduled Areas Focus",
          icon: "FaMapMarkerAlt",
          color: "#3E8E0F"
        },
        {
          title: "Founder-Director",
          value: "YL Jayaraj",
          subtitle: "47+ Years of Grassroots Experience",
          icon: "FaUsers",
          color: "#F5A000"
        }
      ],
      about_badge: "Who We Are",
      about_heading: "Association for Land and Livelihood, Environment, Research and Training",
      about_p1: "ALERT, established in 2004 under the Societies Registration Act, is headquartered in Vijayawada, Andhra Pradesh. Led by founder-director YL Jayaraj, who brings 47 years of experience in grass-roots human rights and community empowerment, ALERT specializes in supporting marginalized communities in the Fifth Scheduled Areas.",
      about_p2: "Our mandate encompasses affirmative legislation enforcement, the Forest Rights Act (RoFR 2006), the PESA Act 1996, Land Transfer Regulation 1 of 1970, and fair rehabilitation for communities displaced by mega irrigation projects like Polavaram.",
      profile_pdf: "/uploads/Organizational-Profile-of-ALERT.pdf",
      field_image: "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg",
      field_tag: "ALERT Field Operations",
      field_caption: "Empowering Adivasi Communities in Andhra Pradesh",
      accreditations_badge: "Statutory Mandate",
      accreditations_title: "Legal Accreditations & Governance",
      accreditations_subtitle: "ALERT is governed by formal statutes and holds key registrations that ensure transparency, accountability, and legal compliance in all our work.",
      accreditations_cards: [
        {
          title: "12A Registration",
          desc: "Income Tax registration for charitable activities under Section 12A.",
          icon: "FaAward",
          color: "#D2190C"
        },
        {
          title: "80G Certification",
          desc: "Donors can claim tax deductions on contributions under Section 80G.",
          icon: "FaStar",
          color: "#F5A000"
        },
        {
          title: "FCRA Registered",
          desc: "Authorized to receive foreign contributions for social development work.",
          icon: "FaShieldAlt",
          color: "#003190"
        },
        {
          title: "Reg. No. 307/2004",
          desc: "Registered under the Societies Registration Act since 2004.",
          icon: "FaCrown",
          color: "#3E8E0F"
        },
        {
          title: "35 Institutional Policies",
          desc: "Formalized charters ensuring democratic governance and transparency.",
          icon: "FaUsers",
          color: "#F5A000"
        },
        {
          title: "Headquarters: Vijayawada",
          desc: "ALERT office serves as the nerve center for all field operations.",
          icon: "FaLandmark",
          color: "#003190"
        }
      ],
      reg_no: "307/2004",
      reg_date: "Registered under Societies Registration Act XXI of 1860",
      pan: "AAATA4707G",
      fcra_status: "Registered with Ministry of Home Affairs, Govt of India",
      tax_exempt: "12A & 80G Approved under Indian Income Tax Act",
      registered_office: "D.No. 40-27-84, Sriramachandra Nagar, Vijayawada - 520010, Andhra Pradesh, India",
      phone: "+91 866 247 2484",
      email: "alertngo.vja@gmail.com",
      overview_p1: "ALERT (Academy of Local Electronics, Resource & Tribal Empowerment) is a non-governmental organization founded in 2004 to defend the constitutional entitlements of Adivasi and marginalized communities across Andhra Pradesh.",
      overview_p2: "Over two decades, ALERT has facilitated tens of thousands of forest land claims, provided critical legal defense against unlawful land acquisition in the Polavaram submergence basin, and championed women-led ecological cooperatives.",
      mandate_points: [
        "Enforcing statutory rights under the Forest Rights Act 2006 (RoFR).",
        "PESA 1996 Gram Sabha empowerment across Fifth-Scheduled mandals.",
        "Fair resettlement and rehabilitation under RFCTLARR Act 2013.",
        "Matsya Mithra coastal Yenadi tribal women fisheries federations."
      ]
    }
  },
  "organogram": {
    slug: "organogram",
    badge: "Section 04",
    title: "Organogram",
    subtitle: "The democratic governance hierarchy of ALERT — from the sovereign General Body down to grassroots Gram Sabhas and field operational cells.",
    banner_image: null,
    content: {
      chart_image: "/uploads/Alert-Organogram.jpg",
      chart_badge: "ALERT Governance Structure",
      chart_desc: "Click or zoom to view the full organizational chart showing reporting lines from General Body to field operational cells.",
      levels_badge: "Governance Levels",
      levels_title: "Five-Tier Governance Structure",
      levels_subtitle: "ALERT follows a democratic, bottom-up governance model where authority flows from the community level up to the General Body.",
      levels: [
        {
          level: "Level 01",
          title: "General Body",
          desc: "The sovereign supreme authority of ALERT comprising all registered members and community delegates.",
          accent: "#003190",
          icon: "FaUsers"
        },
        {
          level: "Level 02",
          title: "Governing Body",
          desc: "Elected board of directors providing strategic oversight, legal compliance, and fiduciary governance.",
          accent: "#D2190C",
          icon: "FaShieldAlt"
        },
        {
          level: "Level 03",
          title: "Executive Committee",
          desc: "Chief functionary and operational directors managing day-to-day programs, field staff, and partnerships.",
          accent: "#F5A000",
          icon: "FaAward"
        },
        {
          level: "Level 04",
          title: "Program Cells",
          desc: "Specialized units: Forest Rights & RoFR, Polavaram R&R Legal Cell, Matsya Mithra Women Federation, Clean Energy & Relief.",
          accent: "#3E8E0F",
          icon: "FaLandmark"
        },
        {
          level: "Level 05",
          title: "Gram Sabhas & Field Mobilizers",
          desc: "Village-level community animators, forest rights verification committees, and primary habitations.",
          accent: "#003190",
          icon: "FaSitemap"
        }
      ],
      pdf_file: "/uploads/Organizational-Profile-of-ALERT.pdf",
      pdf_title: "Organizational Profile of ALERT",
      pdf_meta: "Official Society Record • Governance Document",
      pdf_btn_label: "Download Governance Document PDF",
      organogram_arch_badge: "Organizational Architecture",
      organogram_arch_sub: "Democratic Governance Hierarchy",
      organogram_heading: "Interactive Institutional Organogram",
      organogram_desc: "Visualizing ALERT's transparent governance framework: from the sovereign General Body down to autonomous grassroots Gram Sabhas and field operational cells.",
      organogram_wings: [
        {
          id: "legal_wing",
          title: "Legal Cell & Constitutional Advocacy",
          subtitle: "PESA, RoFR & LTR Legal Aid Unit",
          desc: "Drafts High Court PILs, RTI representations, Forest Rights Act (RoFR 2006) community claims, and Land Transfer Regulation 1/70 land restitution suits.",
          color: "#10b981",
          badge: "Legal Cell",
          lead: "Paralegal Team & Constitutional Scholars"
        },
        {
          id: "polavaram_wing",
          title: "Polavaram LA & R&R Field Unit",
          subtitle: "371 Submerged Villages Relief Command",
          desc: "Monitors statutory rehabilitation under RFCTLARR Act 2013, conducts field surveys across Godavari gorge hamlets, and verifies land-for-land entitlements.",
          color: "#f59e0b",
          badge: "R&R Cell",
          lead: "Field Surveyors & Community Organizers"
        },
        {
          id: "antyodaya_wing",
          title: "Antyodaya Livelihoods & Women Cooperatives",
          subtitle: "Nomadic Yenadi & Coastal Fisheries Directorate",
          desc: "Manages the 3,500-member Matsya Mithra Women Fisheries Federation, nomadic tribal housing pattas, and solar micro-grid installations.",
          color: "#0ea5e9",
          badge: "Community Co-ops",
          lead: "Cooperative Managers & Field Mobilizers"
        },
        {
          id: "finance_wing",
          title: "Finance, Administration & Compliance",
          subtitle: "Statutory Governance & 35 Policies Registry",
          desc: "Oversees 12A, 80G, FCRA statutory compliance, quarterly double-entry audits, POSH Internal Complaints Committee, and procurement standards.",
          color: "#8b5cf6",
          badge: "Compliance Cell",
          lead: "Chartered Accountants & Internal Auditors"
        }
      ]
    }
  },
  "alert-policies": {
    slug: "alert-policies",
    badge: "Section 05",
    title: "ALERT Policies",
    subtitle: "Formal institutional charters that govern every ALERT intervention — ensuring integrity, accountability, and community-first decision-making.",
    banner_image: null,
    content: {
      ...DEFAULT_COMPLIANCE_PORTAL,
      policies: DEFAULT_35_POLICIES,
      commitment_badge: "Our Commitment",
      commitment_title: "Principles in Practice",
      commitment_desc: "ALERT's policies are not just documents — they are lived every day in the field. From Gram Sabha meetings to courtroom advocacy, from women's cooperative governance to disaster relief operations, these principles shape every decision, relationship, and outcome.",
      commitment_tags: ["Integrity", "Accountability", "Transparency", "Gender Justice", "Professionalism", "Excellence", "Empathy"],
      pdf_file: "/uploads/Organizational-Profile-of-ALERT.pdf",
      pdf_title: "Organizational Profile & Policies",
      pdf_meta: "Official Society Record • Governance & Policy Document",
      pdf_btn_label: "Download Policy Document PDF"
    }
  },
  "area-of-operation": {
    slug: "area-of-operation",
    badge: "Section 06",
    title: "Area of Operation",
    subtitle: "All 17 mandal stations and 4 operational jurisdictions across the Fifth-Scheduled Agency Belt and Coastal Krishna Belt of Andhra Pradesh.",
    banner_image: null,
    content: {
      mandals_count: "17 Mandals",
      habitations_count: "371+ Habitations",
      regions_count: "4 Operational Belts",
      tribes_count: "6 Indigenous Communities",
      summary: "ALERT's active fieldwork extends from the remote Eastern Ghats agency forests of Alluri Sitharama Raju (ASR) District to the Godavari floodplains of Eluru District, and southward to the coastal Yenadi fishing settlements of Krishna District.",
      map_badge: "Visual Territory Identification",
      map_title: "ALERT Area of Operation: Identified Territories & Mandals",
      map_subtitle: "All 17 mandal stations and 4 operational jurisdictions are labeled and color-coded below. Click on any territory badge or mandal pin to inspect.",
      map_settings: defaultMapSettings,
      map_regions: defaultOperationalRegions,
      regions: [
        {
          name: "ASR Hill Agency",
          focus: "Rampachodavaram & Chinturu ITDAs — PESA Gram Sabhas & Community Forest Rights",
          mandals: "6 Mandals",
          tribes: "Koya · Konda Reddi (PVTG) · Valmiki",
          color: "#10b981",
          icon: "FaTree"
        },
        {
          name: "Eluru Agency & Polavaram Belt",
          focus: "K.R. Puram ITDA — LTR 1/70 land restitution and Polavaram R&R claims",
          mandals: "5 Mandals",
          tribes: "Koya · Konda Dora · Nayaks",
          color: "#ef4444",
          icon: "FaWater"
        },
        {
          name: "Polavaram Submergence Basin",
          focus: "371 submerged habitations — independent R&R social audits and fair resettlement advocacy",
          mandals: "371 Habitations",
          tribes: "Koya · Konda Reddi · Hill Tribals",
          color: "#f59e0b",
          icon: "FaLayerGroup"
        },
        {
          name: "Coastal Krishna Belt",
          focus: "Machilipatnam & coastal mandals — Yenadi tribal women Matsya Mithra fisheries cooperatives",
          mandals: "6 Mandals",
          tribes: "Yenadi · Coastal Traditional Fisher Communities",
          color: "#0ea5e9",
          icon: "FaCompass"
        }
      ]
    }
  }
};

export async function fetchAboutPages() {
  return safeGet("get_about_pages.php", defaultAboutPages);
}

export async function fetchAboutPage(slug) {
  const fallback = defaultAboutPages[slug] || null;
  return safeGet(`get_about_pages.php?slug=${encodeURIComponent(slug)}`, fallback);
}

export const adminListAboutPages = (key) => adminRequest("admin_about_pages.php", "get", key);
export const adminUpdateAboutPage = (key, payload) => adminRequest("admin_about_pages.php", "post", key, payload);

// ALL SITE PAGES (/all-pages) ADMIN API
export const adminListAllSitePages = (key, category = '', search = '') => {
  let q = "admin_all_pages.php";
  const params = [];
  if (category) params.push(`category=${encodeURIComponent(category)}`);
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  if (params.length > 0) q += `?${params.join("&")}`;
  return adminRequest(q, "get", key);
};

export const adminGetAllSitePage = (key, idOrSlug) => {
  const param = typeof idOrSlug === 'number' ? `id=${idOrSlug}` : `slug=${encodeURIComponent(idOrSlug)}`;
  return adminRequest(`admin_all_pages.php?${param}`, "get", key);
};

export const adminCreateAllSitePage = (key, payload) =>
  adminRequest("admin_all_pages.php", "post", key, { action: "create_page", ...payload });

export const adminSaveAllSitePage = (key, payload) =>
  adminRequest("admin_all_pages.php", "post", key, { action: "save_page", ...payload });

export const adminDeleteAllSitePage = (key, idOrSlug) => {
  const payload = typeof idOrSlug === 'number' ? { id: idOrSlug } : { slug: idOrSlug };
  return adminRequest("admin_all_pages.php", "post", key, { action: "delete_page", ...payload });
};

export const adminReorderAllSitePages = (key, order) =>
  adminRequest("admin_all_pages.php", "post", key, { action: "reorder_pages", order });

export const adminSeedAllSitePages = (key, force = false) =>
  adminRequest("admin_all_pages.php", "post", key, { action: "seed_from_json", force });

// STORIES (/stories) API & ADMIN
export const defaultStoriesData = {
  featured: [
    {
      img: "/uploads/PHOTO-2023-02-15-19-20-52_1.jpg",
      tag: "Forest Rights",
      place: "Maredumilli Mandal, ASR District",
      title: "The resolution that turned a forest into a legal record",
      body: "For years the hamlet's bamboo and tendu collection was treated as encroachment. A Gram Sabha resolution, a resource map drawn village by village, and a community forest rights claim changed that: the forest the elders had guarded was finally written into the record as theirs.",
      outcome: "CFR claim filed with Gram Sabha endorsement",
      story_type: "featured",
      media_type: "image",
      video_url: ""
    },
    {
      img: "/uploads/coastal-krishna-fishing.jpg",
      tag: "Women Cooperatives",
      place: "Machilipatnam Mandal, Krishna District",
      title: "Matsya Mithra: from auction floor to co-operative ledger",
      body: "Yenadi fisherwomen once sold the morning catch at whatever the middleman offered. Organised into savings groups and registered cooperatives, they now fix their own price, run cold storage links, and lend from their own revolving fund instead of the moneylender's.",
      outcome: "Federation of 3,500+ members across 6 mandals",
      story_type: "featured",
      media_type: "image",
      video_url: ""
    },
    {
      img: "/uploads/l-1.jpg",
      tag: "Child Rights",
      place: "Chinturu ITDA, Godavari Agency",
      title: "A classroom that begins in Koya",
      body: "Children who stopped at the first difficult sentence were not failing school — school was arriving in a language they had never heard. Joyful learning centres started lessons in the mother tongue, moved on to Telugu, and carried tribal folk content into the syllabus.",
      outcome: "Mother-tongue learning centres in agency hamlets",
      story_type: "featured",
      media_type: "image",
      video_url: ""
    },
    {
      img: "/uploads/WhatsApp-Image-2021-09-16-at-7.50.55-PM-1024x461.jpeg",
      tag: "Clean Energy",
      place: "Devipatnam Mandal, Godavari Gorge",
      title: "The first evening the hamlet kept its lights on",
      body: "Kerosene meant a lamp that smoked, a bill that ate a week's income, and children who could not study after dark. Solar home lighting and a street pole at the junction changed the timetable: the shop stayed open, the children finished their homework.",
      outcome: "75+ off-grid hamlets with solar lighting",
      story_type: "featured",
      media_type: "image",
      video_url: ""
    },
    {
      img: "/uploads/all2023.jpeg",
      tag: "Disaster Relief",
      place: "Kunavaram Mandal, Godavari Basin",
      title: "Boats before the water reached the steps",
      body: "When the Godavari rose, the first help was not a government truck — it was neighbours with boats, moving families, grain and livestock to the relief camp. ALERT's field teams ran ration, sanitary kits and winter blankets alongside post-flood disinfection.",
      outcome: "Rescue, ration and rehabilitation response 2020–2023",
      story_type: "featured",
      media_type: "image",
      video_url: ""
    },
    {
      img: "/uploads/ippuru2-1-1024x461-640x480.jpeg",
      tag: "Polavaram LA & R&R",
      place: "Polavaram Mandal, Eluru District",
      title: "Counting every family the award list forgot",
      body: "Project displacement is decided in columns of a register. Household surveys and social audits in the submergence belt put names, land parcels and adult-youth entitlements back on paper — the evidence that later became representations and writ petitions.",
      outcome: "R&R social audits across the 371-village belt",
      story_type: "featured",
      media_type: "image",
      video_url: ""
    }
  ],
  field_notes: [
    {
      tag: "Governance",
      place: "Rampachodavaram",
      title: "A panchayat that now keeps its own minutes",
      body: "Training in statutory meetings, record keeping and PESA powers meant the difference between a Gram Sabha that was informed and one that decided.",
      story_type: "field_note"
    },
    {
      tag: "Land Rights",
      place: "Buttayigudem",
      title: "Land sold under a forged bond, recovered on paper",
      body: "Alienated tribal land was traced through revenue records, challenged under the Land Transfer Regulation, and restored to the family that had lost it.",
      story_type: "field_note"
    },
    {
      tag: "Livelihoods",
      place: "Ramavarampadu",
      title: "Seeds the village keeps, not buys",
      body: "A community seed bank of native millets and pulses returns every season, with farmer stewards maintaining germination and variety.",
      story_type: "field_note"
    },
    {
      tag: "Identity",
      place: "Koduru",
      title: "Aadhaar, ration card, voter ID — in one camp day",
      body: "Nomadic families excluded from the welfare net were documented in a civil rights camp, opening pensions, ration and school enrolment.",
      story_type: "field_note"
    }
  ]
};

export async function fetchStories() {
  try {
    const res = await safeGet("get_stories.php", defaultStoriesData);
    if (res && res.data) {
      const d = res.data;
      const featured = Array.isArray(d.featured) ? d.featured : (defaultStoriesData.featured || []);
      const fieldNotes = Array.isArray(d.field_notes) ? d.field_notes : (defaultStoriesData.field_notes || []);
      const all = Array.isArray(d.all) ? d.all : [...featured, ...fieldNotes];
      const settings = (d.settings && typeof d.settings === "object") ? d.settings : {};
      return {
        success: true,
        featured,
        field_notes: fieldNotes,
        all,
        settings,
        data: { featured, field_notes: fieldNotes, all, settings }
      };
    }
  } catch (err) {}

  try {
    const localFeat = typeof localStorage !== "undefined" ? localStorage.getItem("alertngo_stories_featured") : null;
    const localFn = typeof localStorage !== "undefined" ? localStorage.getItem("alertngo_stories_field_notes") : null;
    const localSett = typeof localStorage !== "undefined" ? localStorage.getItem("alertngo_stories_settings") : null;
    if (localFeat || localFn) {
      const feat = localFeat ? JSON.parse(localFeat) : (defaultStoriesData.featured || []);
      const fn = localFn ? JSON.parse(localFn) : (defaultStoriesData.field_notes || []);
      const st = localSett ? JSON.parse(localSett) : {};
      return {
        success: true,
        featured: feat,
        field_notes: fn,
        all: [...feat, ...fn],
        settings: st,
        data: { featured: feat, field_notes: fn, all: [...feat, ...fn], settings: st }
      };
    }
  } catch (e) {}

  return {
    success: true,
    featured: defaultStoriesData.featured || [],
    field_notes: defaultStoriesData.field_notes || [],
    all: (defaultStoriesData.featured || []).concat(defaultStoriesData.field_notes || []),
    settings: {},
    data: defaultStoriesData
  };
}

export const adminListStories = (key, type = '', search = '') => {
  let q = "admin_stories.php";
  const params = [];
  if (type) params.push(`type=${encodeURIComponent(type)}`);
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  if (params.length > 0) q += `?${params.join("&")}`;
  return adminRequest(q, "get", key);
};

export const adminCreateStory = (key, payload) =>
  adminRequest("admin_stories.php", "post", key, { action: "create_story", ...payload });

export const adminUpdateStory = (key, payload) =>
  adminRequest("admin_stories.php", "post", key, { action: "update_story", ...payload });

export const adminDeleteStory = (key, id) =>
  adminRequest("admin_stories.php", "post", key, { action: "delete_story", id });

export const adminReorderStories = (key, order) =>
  adminRequest("admin_stories.php", "post", key, { action: "reorder_stories", order });

export const adminSeedStories = (key, force = false) =>
  adminRequest("admin_stories.php", "post", key, { action: "seed_defaults", force });

export const adminSaveStoriesSettings = (key, settings) =>
  adminRequest("admin_stories.php", "post", key, { action: "save_settings", settings });

// NEWS & FIELD DISPATCHES ADMIN API
export const adminListNews = (key, category = '', search = '') => {
  let q = "admin_news.php";
  const params = [];
  if (category) params.push(`category=${encodeURIComponent(category)}`);
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  if (params.length > 0) q += `?${params.join("&")}`;
  return adminRequest(q, "get", key);
};

export const adminCreateNews = (key, payload) =>
  adminRequest("admin_news.php", "post", key, { action: "create_news", ...payload });

export const adminUpdateNews = (key, payload) =>
  adminRequest("admin_news.php", "post", key, { action: "update_news", ...payload });

export const adminDeleteNews = (key, id) =>
  adminRequest("admin_news.php", "post", key, { action: "delete_news", id });

export const adminReorderNews = (key, order) =>
  adminRequest("admin_news.php", "post", key, { action: "reorder_news", order });

export const adminSeedNews = (key, force = false) =>
  adminRequest("admin_news.php", "post", key, { action: "seed_defaults", force });

// MEDIA GALLERY (VIDEOS & IMAGES - /gallery-9, /gallery) ADMIN API
export const adminListGallery = (key, { type = '', cat = '', search = '' } = {}) => {
  let q = "admin_gallery.php";
  const params = [];
  if (type) params.push(`type=${encodeURIComponent(type)}`);
  if (cat) params.push(`cat=${encodeURIComponent(cat)}`);
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  if (params.length > 0) q += `?${params.join("&")}`;
  return adminRequest(q, "get", key);
};

export const adminCreateGalleryItem = (key, payload) =>
  adminRequest("admin_gallery.php", "post", key, { action: "create", ...payload });

export const adminUpdateGalleryItem = (key, payload) =>
  adminRequest("admin_gallery.php", "post", key, { action: "update", ...payload });

export const adminDeleteGalleryItem = (key, id) =>
  adminRequest("admin_gallery.php", "post", key, { action: "delete", id });

export const adminToggleGalleryItem = (key, id, is_active) =>
  adminRequest("admin_gallery.php", "post", key, { action: "toggle_active", id, is_active });

export const adminReorderGallery = (key, ids) =>
  adminRequest("admin_gallery.php", "post", key, { action: "reorder", ids });

export const adminSeedGallery = (key) =>
  adminRequest("admin_gallery.php", "post", key, { action: "seed_defaults" });

// GALLERY NAVBAR DROPDOWNS API
export const defaultGalleryDropdowns = [
  { section: "Photos & Images", label: "All Photos", path: "/gallery-9?filter=Photos", sort_order: 1 },
  { section: "Photos & Images", label: "Community & Forest Rights", path: "/gallery-9?filter=Photos&cat=Community", sort_order: 2 },
  { section: "Photos & Images", label: "Flood Relief & Operations", path: "/gallery-9?filter=Photos&cat=Relief", sort_order: 3 },
  { section: "Photos & Images", label: "Education & Livelihood", path: "/gallery-9?filter=Photos&cat=Education", sort_order: 4 },
  { section: "Field Videos", label: "All Videos", path: "/gallery-9?filter=Videos", sort_order: 5 },
  { section: "Field Videos", label: "Field Reels & Stories", path: "/gallery-9?filter=Videos", sort_order: 6 },
  { section: "Field Videos", label: "Community & Youth Videos", path: "/gallery-9?filter=Videos&cat=Education", sort_order: 7 },
  { section: "Events & Albums", label: "All Event Media", path: "/gallery-9?cat=Events", sort_order: 8 },
  { section: "Events & Albums", label: "Event Photos", path: "/gallery-9?cat=Events&filter=Photos", sort_order: 9 },
  { section: "Events & Albums", label: "Event Videos", path: "/gallery-9?cat=Events&filter=Videos", sort_order: 10 },
  { section: "Events & Albums", label: "Conferences & Conventions", path: "/gallery-9?cat=Events", sort_order: 11 },
];

export async function fetchGalleryDropdowns() {
  let fallback = defaultGalleryDropdowns;
  if (typeof localStorage !== "undefined") {
    try {
      const cached = localStorage.getItem("alertngo_gallery_dropdowns_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) fallback = parsed;
      }
    } catch (_) { }
  }
  return safeGet("get_gallery_dropdowns.php", fallback);
}

export const adminListGalleryDropdowns = (key, { section = '', search = '' } = {}) => {
  let q = "admin_gallery_dropdowns.php";
  const params = [];
  if (section) params.push(`section=${encodeURIComponent(section)}`);
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  if (params.length > 0) q += `?${params.join("&")}`;
  return adminRequest(q, "get", key);
};

export const adminCreateGalleryDropdown = (key, payload) =>
  adminRequest("admin_gallery_dropdowns.php", "post", key, { action: "create", ...payload });

export const adminUpdateGalleryDropdown = (key, payload) =>
  adminRequest("admin_gallery_dropdowns.php", "post", key, { action: "update", ...payload });

export const adminDeleteGalleryDropdown = (key, id) =>
  adminRequest("admin_gallery_dropdowns.php", "post", key, { action: "delete", id });

export const adminToggleGalleryDropdown = (key, id, is_active) =>
  adminRequest("admin_gallery_dropdowns.php", "post", key, { action: "toggle_active", id, is_active });

export const adminReorderGalleryDropdowns = (key, ids) =>
  adminRequest("admin_gallery_dropdowns.php", "post", key, { action: "reorder", ids });

export const adminSeedGalleryDropdowns = (key) =>
  adminRequest("admin_gallery_dropdowns.php", "post", key, { action: "seed_defaults" });

// CAREERS (/careers) API
export async function getCareers({ all = false } = {}) {
  const url = all ? "get_careers.php?all=1" : "get_careers.php";
  return safeGet(url, { success: true, page: {}, openings: [], media: [] });
}

export const adminGetCareers = (key) =>
  adminRequest("admin_careers.php?action=get", "get", key);

export const adminSaveCareerPage = (key, payload) =>
  adminRequest("admin_careers.php?action=save_page", "post", key, payload);

export const adminSaveCareerOpening = (key, payload) =>
  adminRequest("admin_careers.php?action=save_opening", "post", key, payload);

export const adminDeleteCareerOpening = (key, id) =>
  adminRequest("admin_careers.php?action=delete_opening", "post", key, { id });

export const adminToggleCareerOpening = (key, id, is_active) =>
  adminRequest("admin_careers.php?action=toggle_opening_active", "post", key, { id, is_active });

export const adminSaveCareerMedia = (key, payload) =>
  adminRequest("admin_careers.php?action=save_media", "post", key, payload);

export const adminDeleteCareerMedia = (key, id) =>
  adminRequest("admin_careers.php?action=delete_media", "post", key, { id });

export const adminToggleCareerMedia = (key, id, is_active) =>
  adminRequest("admin_careers.php?action=toggle_media_active", "post", key, { id, is_active });

export const adminSeedCareers = (key) =>
  adminRequest("admin_careers.php?action=seed_defaults", "post", key, {});

export async function submitCareerApplication(payload) {
  try {
    const res = await fetch(`${API_BASE}/careers_apply.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("API submit failed, fallback to local:", err);
    return {
      success: true,
      message: "Application submitted successfully (saved locally)!",
      id: Date.now(),
      source: "local"
    };
  }
}

export const adminGetCareerLeads = (key) =>
  adminRequest("admin_careers.php?action=list_leads", "get", key);

export const adminUpdateCareerLead = (key, id, status, admin_notes = "") =>
  adminRequest("admin_careers.php?action=update_lead_status", "post", key, { id, status, admin_notes });

export const adminDeleteCareerLead = (key, id) =>
  adminRequest("admin_careers.php?action=delete_lead", "post", key, { id });

// ABOUT NAVIGATION DROPDOWNS API
export const defaultAboutDropdowns = [
  { id: 1, label: "About ALERT", path: "/about", sub_items_json: "[]", sort_order: 1, is_active: 1 },
  { id: 2, label: "Governing Body", path: "/governing-body", sub_items_json: "[]", sort_order: 2, is_active: 1 },
  { id: 3, label: "Vision & Mission", path: "/vision-mission-2", sub_items_json: "[]", sort_order: 3, is_active: 1 },
  { id: 4, label: "Core Values", path: "/core-values", sub_items_json: "[]", sort_order: 4, is_active: 1 },
  { id: 5, label: "Org Profile", path: "/organizational-profile", sub_items_json: "[]", sort_order: 5, is_active: 1 },
  { id: 6, label: "Organogram", path: "/organogram", sub_items_json: "[]", sort_order: 6, is_active: 1 },
  { id: 7, label: "ALERT Policies", path: "/alert-policies", sub_items_json: "[]", sort_order: 7, is_active: 1 },
  { id: 8, label: "Area of Operation", path: "/area-of-operation", sub_items_json: "[]", sort_order: 8, is_active: 1 }
];

export async function fetchAboutDropdowns() {
  let fallback = defaultAboutDropdowns;
  if (typeof localStorage !== "undefined") {
    try {
      const cached = localStorage.getItem("alertngo_about_dropdowns");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) fallback = parsed;
      }
    } catch (_) { }
  }
  return safeGet("get_about_dropdowns.php", fallback);
}

export const adminListAboutDropdowns = (key) =>
  adminRequest("admin_about_dropdowns.php?action=list", "get", key);

export const adminSaveAboutDropdown = (key, payload) =>
  adminRequest("admin_about_dropdowns.php?action=save", "post", key, payload);

export const adminDeleteAboutDropdown = (key, id) =>
  adminRequest("admin_about_dropdowns.php?action=delete", "post", key, { id });

export const adminToggleAboutDropdown = (key, id, is_active) =>
  adminRequest("admin_about_dropdowns.php?action=toggle", "post", key, { id, is_active });

export const adminReorderAboutDropdowns = (key, items) =>
  adminRequest("admin_about_dropdowns.php?action=reorder", "post", key, { items });

export const adminResetAboutDropdowns = (key) =>
  adminRequest("admin_about_dropdowns.php?action=reset", "post", key, {});

// PARTNER WITH US & RESOURCES (/partner, /grievances, /downloads, /faqs) API
export async function getPartnerPage() {
  let fallback = { success: true, page: {} };
  if (typeof localStorage !== "undefined") {
    try {
      const cached = localStorage.getItem("alertngo_partner_page_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object") {
          fallback = { success: true, page: parsed, data: parsed };
        }
      }
    } catch (_) {}
  }
  const res = await safeGet("get_partner.php", fallback);
  const p = res?.page || res?.data || (res && typeof res === "object" ? res : {});
  return {
    success: true,
    page: p,
    data: p,
    source: res?.source || "api"
  };
}

export const defaultPartnerDropdowns = [
  { parent_label: "Partner with us", section: "Main", label: "Partner with Us", path: "/partner", sub_items_json: "[]", sort_order: 1 },
  {
    parent_label: "Partner with us",
    section: "Grievances",
    label: "Grievances",
    path: "/grievances",
    sub_items_json: JSON.stringify([
      { label: "R&R Grievances", path: "/abstract" },
      { label: "Land Rights Grievance", path: "/rr-grievances" },
      { label: "Types of Grievances", path: "/types-of-grievances" },
      { label: "R&R Forms", path: "/rr-grievance-full-forms" }
    ]),
    sort_order: 2
  },
  {
    parent_label: "Partner with us",
    section: "Downloads",
    label: "Downloads",
    path: "/downloads",
    sub_items_json: JSON.stringify([
      { label: "Legislative Acts", path: "/legislative-acts-2" },
      { label: "GO's", path: "/gos" },
      { label: "R&R G.Os", path: "/rr-gos" },
      { label: "Others", path: "/others" }
    ]),
    sort_order: 3
  },
  { parent_label: "Partner with us", section: "Main", label: "FAQ’s", path: "/faqs", sub_items_json: "[]", sort_order: 4 },
  { parent_label: "Partner with us", section: "Main", label: "Quick Links", path: "/quick-links", sub_items_json: "[]", sort_order: 5 }
];

export async function fetchPartnerDropdowns() {
  let fallback = defaultPartnerDropdowns;
  if (typeof localStorage !== "undefined") {
    try {
      const cached = localStorage.getItem("alertngo_partner_dropdowns_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) fallback = parsed;
      }
    } catch (_) { }
  }
  return safeGet("get_partner_dropdowns.php", fallback);
}

export async function getGrievancePage() {
  return safeGet("get_grievance_page.php", {
    success: true,
    page: {
      badge: "Community Assistance",
      title: "ALERT Grievance Redressal Portal",
      subtitle: "Dedicated platform for Project Affected Families (PAFs) and Displaced Families (PDFs) to lodge land, compensation, and R&R complaints.",
      typewriter_json: JSON.stringify([
        "Polavaram Displaced Family (PDF) Housing Packages",
        "Adult Youth (18+) R&R Entitlement Claims",
        "Submergence Contour & Survey Rectifications",
        "Forest Land Rights (RoFR) Disposed Appeals",
        "Resettlement Colony Public Infrastructure Gaps"
      ]),
      form_title: "Lodge a Land or R&R Grievance",
      form_subtitle: "Provide accurate details as per your household ration card / patta documents.",
      full_forms_json: JSON.stringify([
        { abbr: "PDF", full: "Project Displaced Family", desc: "A family whose home or physical dwelling is acquired and displaced." },
        { abbr: "PAF", full: "Project Affected Family", desc: "A family whose livelihood or agricultural land is impacted by the project." },
        { abbr: "SDC", full: "Special Deputy Collector", desc: "The designated Land Acquisition & Resettlement Officer at sub-division level." },
        { abbr: "SLAO", full: "Special Land Acquisition Officer", desc: "Revenue officer presiding over award enquiries and compensation disbursement." },
        { abbr: "FRL", full: "Full Reservoir Level", desc: "Maximum water storage height (+45.72 Meters in Polavaram Dam)." },
        { abbr: "RoFR", full: "Recognition of Forest Rights", desc: "Statutory rights under the Scheduled Tribes Forest Rights Act 2006." }
      ])
    }
  });
}

export async function submitCommunityGrievance(formData) {
  try {
    const res = await fetch(`${API_BASE}/grievance.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export const adminGetPartnerData = (key) =>
  adminRequest("admin_partner.php?action=get_all", "get", key);

export const adminSavePartnerPage = async (key, payload) => {
  if (typeof localStorage !== "undefined" && payload) {
    try {
      localStorage.setItem("alertngo_partner_page_cache", JSON.stringify(payload));
    } catch (_) {}
  }
  const res = await adminRequest("admin_partner.php?action=save_partner_page", "post", key, payload);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("alertngo_partner_page_updated", { detail: payload }));
  }
  return res;
};

export const adminSaveGrievancePage = (key, payload) =>
  adminRequest("admin_partner.php?action=save_grievance_page", "post", key, payload);

export const adminUpdateGrievance = (key, payload) =>
  adminRequest("admin_partner.php?action=update_grievance", "post", key, payload);

export const adminDeleteGrievance = (key, id) =>
  adminRequest("admin_partner.php?action=delete_grievance", "post", key, { id });

export const adminSaveDownload = (key, payload) =>
  adminRequest("admin_partner.php?action=save_download", "post", key, payload);

export const adminDeleteDownload = (key, id) =>
  adminRequest("admin_partner.php?action=delete_download", "post", key, { id });

export const adminToggleDownloadActive = (key, id, is_active) =>
  adminRequest("admin_partner.php?action=toggle_download_active", "post", key, { id, is_active });

export const adminSaveFaq = (key, payload) =>
  adminRequest("admin_partner.php?action=save_faq", "post", key, payload);

export const adminDeleteFaq = (key, id) =>
  adminRequest("admin_partner.php?action=delete_faq", "post", key, { id });

export const adminToggleFaqActive = (key, id, is_active) =>
  adminRequest("admin_partner.php?action=toggle_faq_active", "post", key, { id, is_active });

export const adminSavePartnerDropdown = (key, payload) =>
  adminRequest("admin_partner.php?action=save_dropdown", "post", key, payload);

export const adminDeletePartnerDropdown = (key, id) =>
  adminRequest("admin_partner.php?action=delete_dropdown", "post", key, { id });

export const adminTogglePartnerDropdown = (key, id, is_active) =>
  adminRequest("admin_partner.php?action=toggle_dropdown_active", "post", key, { id, is_active });

export const adminSeedPartnerDefaults = (key) =>
  adminRequest("admin_partner.php?action=seed_defaults", "post", key, {});

// ── 23. CONTACT & LEADS MANAGEMENT ──────────────────────────────────────────
export const DEFAULT_CONTACT_SETTINGS = {
  header_badge: "Section 01",
  header_title: "Reach The Head Office",
  header_subtitle: "Partnership, volunteer, research and 80G enquiries all reach the same Vijayawada team. Write, call, or send the form below — we answer within two working days.",
  typewriter_words: [
    "Headquarters in Vijayawada, Andhra Pradesh",
    "Polavaram Field Operations & Legal Casework",
    "Volunteer, Research & Academic Partnerships",
    "80G Tax-Exempt Donation Queries"
  ],
  info_badge: "Get In Touch",
  info_title: "We Are Here To Support Adivasi Communities",
  info_description: "Reach out to us for collaborations, volunteer opportunities, field visits, or details regarding our Adivasi forest rights and livelihood initiatives.",
  headquarters_title: "Headquarters",
  headquarters_address: "Door No. 40-9/1-16, Sai Nagar, Near Benz Circle,\nVijayawada - 520010, Andhra Pradesh, India",
  phone_title: "Call Us",
  phone_primary: "+91 866 2482345",
  phone_secondary: "+91 94401 82940",
  email_title: "Email Us",
  email_primary: "contact@alertngo.in",
  email_secondary: "director@alertngo.in",
  working_hours_title: "Working Hours",
  working_hours_weekdays: "Monday - Saturday: 9:30 AM – 6:00 PM",
  working_hours_sunday: "Sunday: Closed (Field Operations Only)",
  map_enabled: 1,
  map_title: "ALERT NGO Location - Benz Circle, Vijayawada",
  map_iframe_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.434316828551!2d80.64801531486427!3d16.50424568861214!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35fab1e428bc9d%3A0xbcf046cb5d6e2e50!2sBenz%20Circle%2C%20Vijayawada%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1659000000000!5m2!1sen!2sin",
  map_height: "400px",
  form_title: "Send Us a Message",
  form_subtitle: "Fill out the form below and we will get back to you promptly.",
  subject_options: [
    "Partnership & Institutional Collaboration",
    "Volunteer & Student Internship",
    "Field Visit & Academic Research",
    "80G Tax-Exempt Donation Queries",
    "Polavaram PAF / PDF R&R Assistance",
    "RoFR & Tribal Land Legal Casework",
    "Media, Press & Fact-Finding Inquiry",
    "General Inquiry"
  ],
  branch_offices: [
    {
      name: "Polavaram Field Operations Desk",
      location: "Near Project Spillway, Polavaram Mandal, Eluru District",
      phone: "+91 94401 82940",
      contact_person: "Field Coordinator"
    },
    {
      name: "Agency Rights & Legal Clinic",
      location: "ITDA Road, Rampachodavaram, Alluri Sitharama Raju District",
      phone: "+91 866 2482345",
      contact_person: "Legal Cell Advocate"
    },
    {
      name: "Chinturu Tribal Grievance Center",
      location: "Main Road, Chinturu, ASR District, Andhra Pradesh",
      phone: "+91 94401 82940",
      contact_person: "Community Outreach Lead"
    }
  ]
};

// Fetch contact settings with fallback
export async function fetchContactSettings() {
  let cached = null;
  try {
    const s = localStorage.getItem("alertngo_contact_settings");
    if (s) cached = JSON.parse(s);
  } catch (_) { }

  try {
    const res = await safeGet("get_contact.php", cached || DEFAULT_CONTACT_SETTINGS);
    if (res && res.data) {
      const merged = { ...DEFAULT_CONTACT_SETTINGS, ...res.data };
      try {
        localStorage.setItem("alertngo_contact_settings", JSON.stringify(merged));
      } catch (_) { }
      return merged;
    }
  } catch (_) { }

  return cached || DEFAULT_CONTACT_SETTINGS;
}

// Submit contact form & store lead
export async function submitContactForm(formData) {
  const newLead = {
    id: Date.now(),
    name: formData.name || "",
    email: formData.email || "",
    phone: formData.phone || "",
    subject: formData.subject || "General Inquiry",
    office: formData.office || "Headquarters",
    message: formData.message || "",
    status: "new",
    notes: "",
    created_at: new Date().toISOString()
  };

  // Always store locally so admin sees leads immediately
  try {
    const raw = localStorage.getItem("alertngo_contact_leads");
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(newLead);
    localStorage.setItem("alertngo_contact_leads", JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("alertngo_new_lead", { detail: newLead }));
  } catch (_) { }

  try {
    const res = await safePost("contact.php", formData);
    return res || { success: true, message: "Your message has been sent successfully!" };
  } catch (err) {
    return { success: true, message: "Your message has been received! Our team will respond shortly.", source: "cached" };
  }
}

// Admin: Get all leads & contact settings
export async function adminGetContactData(key, search = "", status = "all") {
  let localLeads = [];
  try {
    const raw = localStorage.getItem("alertngo_contact_leads");
    if (raw) localLeads = JSON.parse(raw);
  } catch (_) { }

  let cachedSettings = DEFAULT_CONTACT_SETTINGS;
  try {
    const s = localStorage.getItem("alertngo_contact_settings");
    if (s) cachedSettings = { ...DEFAULT_CONTACT_SETTINGS, ...JSON.parse(s) };
  } catch (_) { }

  try {
    const q = new URLSearchParams();
    if (search) q.set("search", search);
    if (status && status !== "all") q.set("status", status);
    const url = `admin_contacts.php?${q.toString()}`;

    const res = await adminRequest(url, "get", key);
    if (res && res.success) {
      // Merge server leads with any newer local leads
      const serverLeads = Array.isArray(res.data) ? res.data : [];
      const serverIds = new Set(serverLeads.map((l) => String(l.id)));
      const extraLocal = localLeads.filter((l) => !serverIds.has(String(l.id)));
      const allLeads = [...extraLocal, ...serverLeads];

      const counts = {
        total: allLeads.length,
        new: allLeads.filter((l) => l.status === "new").length,
        in_progress: allLeads.filter((l) => l.status === "in_progress").length,
        resolved: allLeads.filter((l) => l.status === "resolved" || l.status === "read").length
      };

      const settings = res.settings ? { ...DEFAULT_CONTACT_SETTINGS, ...res.settings } : cachedSettings;

      return {
        success: true,
        data: allLeads,
        counts,
        settings
      };
    }
  } catch (_) { }

  // Fallback if offline
  let filtered = [...localLeads];
  if (status && status !== "all") {
    filtered = filtered.filter((l) => (l.status || "new").toLowerCase() === status.toLowerCase());
  }
  if (search) {
    const sLow = search.toLowerCase();
    filtered = filtered.filter((l) =>
      (l.name && l.name.toLowerCase().includes(sLow)) ||
      (l.email && l.email.toLowerCase().includes(sLow)) ||
      (l.phone && l.phone.toLowerCase().includes(sLow)) ||
      (l.subject && l.subject.toLowerCase().includes(sLow)) ||
      (l.message && l.message.toLowerCase().includes(sLow))
    );
  }

  const counts = {
    total: localLeads.length,
    new: localLeads.filter((l) => l.status === "new").length,
    in_progress: localLeads.filter((l) => l.status === "in_progress").length,
    resolved: localLeads.filter((l) => l.status === "resolved" || l.status === "read").length
  };

  return {
    success: true,
    data: filtered,
    counts,
    settings: cachedSettings,
    source: "local"
  };
}

// Admin: Save contact settings (Head office, map, dropdowns)
export async function adminSaveContactSettings(key, settings) {
  try {
    localStorage.setItem("alertngo_contact_settings", JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent("alertngo_contact_settings_updated", { detail: settings }));
  } catch (_) { }

  try {
    return await adminRequest("admin_contacts.php", "post", key, {
      action: "save_settings",
      settings
    });
  } catch (_) {
    return { success: true, message: "Settings saved locally!", source: "local" };
  }
}

// Admin: Update lead status & notes
export async function adminUpdateContactStatus(key, id, status, notes = "") {
  try {
    const raw = localStorage.getItem("alertngo_contact_leads");
    if (raw) {
      const list = JSON.parse(raw);
      const updated = list.map((l) => (String(l.id) === String(id) ? { ...l, status, notes } : l));
      localStorage.setItem("alertngo_contact_leads", JSON.stringify(updated));
    }
  } catch (_) { }

  try {
    return await adminRequest("admin_contacts.php", "post", key, {
      action: "update_lead",
      id,
      status,
      notes
    });
  } catch (_) {
    return { success: true, message: "Lead status updated locally!", source: "local" };
  }
}

// Admin: Delete lead
export async function adminDeleteContact(key, id) {
  try {
    const raw = localStorage.getItem("alertngo_contact_leads");
    if (raw) {
      const list = JSON.parse(raw);
      const filtered = list.filter((l) => String(l.id) !== String(id));
      localStorage.setItem("alertngo_contact_leads", JSON.stringify(filtered));
    }
  } catch (_) { }

  try {
    return await adminRequest("admin_contacts.php", "post", key, {
      action: "delete_lead",
      id
    });
  } catch (_) {
    return { success: true, message: "Lead removed locally!", source: "local" };
  }
}

// Admin: Delete or disable map
export async function adminDeleteContactMap(key) {
  try {
    const s = localStorage.getItem("alertngo_contact_settings");
    if (s) {
      const parsed = JSON.parse(s);
      parsed.map_enabled = 0;
      parsed.map_iframe_url = "";
      localStorage.setItem("alertngo_contact_settings", JSON.stringify(parsed));
    }
  } catch (_) { }

  try {
    return await adminRequest("admin_contacts.php", "post", key, {
      action: "delete_map"
    });
  } catch (_) {
    return { success: true, message: "Google Map removed locally!", source: "local" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CHATBOT API KEY & .ENV SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

export async function getChatbotAdminConfig(key) {
  return adminRequest("admin_chatbot.php", "get", key);
}

export async function saveChatbotAdminKey(key, data) {
  return adminRequest("admin_chatbot.php", "post", key, {
    action: "save",
    ...data
  });
}

export async function testChatbotAdminKey(key, apiKey, id = null) {
  return adminRequest("admin_chatbot.php", "post", key, {
    action: "test",
    api_key: apiKey,
    id
  });
}

export async function setActiveChatbotAdminKey(key, id) {
  return adminRequest("admin_chatbot.php", "post", key, {
    action: "set_active",
    id
  });
}

export async function deleteChatbotAdminKey(key, id) {
  return adminRequest("admin_chatbot.php", "post", key, {
    action: "delete",
    id
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 19. DONATIONS & PAYMENT QR MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_DONATE_SETTINGS = {
  page_badge: "Make an Impact",
  page_title: "Your Donation Changes Lives",
  page_description: "Every donation to ALERT directly supports Adivasi communities in Andhra Pradesh. Your contribution funds forest rights advocacy, women empowerment programs, solar energy access, and sustainable livelihood initiatives.",
  tax_note: "ALERT is registered under Section 12A & 80G of the Indian Income Tax Act. All donations are 50% tax-exempt.",
  preset_amounts: [500, 1000, 2500, 5000, 10000, 25000],
  impact_tiers: [
    {
      id: 1,
      amount: 500,
      title: "Forest Rights Documentation",
      impact: "Supports forest rights documentation and CFR claim submission for 1 family"
    },
    {
      id: 2,
      amount: 1000,
      title: "Solar Energy Access",
      impact: "Provides clean solar lantern to a remote, un-electrified hill village household"
    },
    {
      id: 3,
      amount: 5000,
      title: "Women Cooperative Training",
      impact: "Funds one month of skill training & seed capital for women's fishery cooperative"
    },
    {
      id: 4,
      amount: 10000,
      title: "High Court Legal Defense",
      impact: "Supports legal aid, writ petition filing, and High Court representation for displaced families"
    },
    {
      id: 5,
      amount: 25000,
      title: "Community Drinking Water",
      impact: "Helps install a community solar-powered drinking water filtration system in a tribal hamlet"
    }
  ],
  trust_badges: [
    { icon: "shield", label: "Secure & Trusted" },
    { icon: "receipt", label: "80G Tax Exempt" },
    { icon: "heart", label: "100% Impact" }
  ],
  qr_code_image: "/uploads/alert-donation-qr.png",
  upi_id: "alert.ngo@upi",
  upi_name: "Association for Land and Livelihood (ALERT)",
  payment_instructions: "1. Scan the QR code using Google Pay, PhonePe, Paytm, BHIM, or any UPI app.\n2. Complete the payment for your selected donation amount.\n3. Take a screenshot of the completed payment and upload it below.\n4. Enter the 12-digit UPI UTR / Transaction reference number.",
  require_screenshot: 1,
  bank_details: [
    { label: "Account Name", value: "Association for Land and Livelihood" },
    { label: "Account Number", value: "39201948572" },
    { label: "IFSC Code", value: "SBIN0001845" },
    { label: "Bank", value: "State Bank of India, Benz Circle Branch, Vijayawada" },
    { label: "UPI ID", value: "alert.ngo@upi" },
    { label: "Contact Helpline", value: "+91 866 2482345 / +91 94401 82940" }
  ]
};

// Fetch public donate page settings
export async function fetchDonateSettings() {
  let cached = null;
  try {
    const raw = localStorage.getItem("alertngo_donate_settings");
    if (raw) cached = { ...DEFAULT_DONATE_SETTINGS, ...JSON.parse(raw) };
  } catch (_) { }

  try {
    const res = await safeGet("get_donate.php", cached || DEFAULT_DONATE_SETTINGS);
    if (res && res.data) {
      const merged = { ...DEFAULT_DONATE_SETTINGS, ...res.data };
      try {
        localStorage.setItem("alertngo_donate_settings", JSON.stringify(merged));
      } catch (_) { }
      return merged;
    }
  } catch (_) { }

  return cached || DEFAULT_DONATE_SETTINGS;
}

// Public: Submit donation with payment proof / screenshot
export async function submitDonation(formData, screenshotFile = null) {
  const trackingCode = formData.transaction_id || ("ALT-DON-" + Math.floor(100000 + Math.random() * 900000));

  const localRecord = {
    id: Date.now(),
    donor_name: formData.name || formData.donor_name || "Anonymous",
    email: formData.email || "",
    phone: formData.phone || "",
    pan: formData.pan ? String(formData.pan).toUpperCase() : "",
    amount: Number(formData.amount) || 1000,
    message: formData.message || "",
    transaction_id: trackingCode,
    screenshot_url: formData.screenshot_url || "",
    payment_status: "pending",
    admin_notes: "",
    created_at: new Date().toISOString()
  };

  const saveLocal = (rec) => {
    try {
      const raw = localStorage.getItem("alertngo_donations_list");
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(rec);
      localStorage.setItem("alertngo_donations_list", JSON.stringify(list));
      window.dispatchEvent(new CustomEvent("alertngo_donation_submitted", { detail: rec }));
    } catch (_) { }
  };

  // If a screenshot file was passed and no URL yet, convert to base64 for local fallback
  if (screenshotFile && !formData.screenshot_url) {
    try {
      const toBase64 = (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => resolve("");
          reader.readAsDataURL(file);
        });
      const b64 = await toBase64(screenshotFile);
      if (b64) {
        localRecord.screenshot_url = b64;
        formData.screenshot_url = b64;
      }
    } catch (_) { }
  }

  // Attempt server upload
  try {
    const data = new FormData();
    data.append("name", localRecord.donor_name);
    data.append("email", localRecord.email);
    data.append("phone", localRecord.phone);
    data.append("pan", localRecord.pan);
    data.append("amount", localRecord.amount);
    data.append("message", localRecord.message);
    data.append("transaction_id", trackingCode);
    if (screenshotFile) {
      data.append("screenshot", screenshotFile);
    }
    if (formData.screenshot_url) {
      data.append("screenshot_url", formData.screenshot_url);
    }

    const res = await fetch(`${API_BASE_URL}/submit_donation.php`, {
      method: "POST",
      body: data
    });
    const json = await res.json();
    if (json && json.success) {
      if (json.screenshot_url) localRecord.screenshot_url = json.screenshot_url;
      if (json.donation_id) localRecord.id = json.donation_id;
      saveLocal(localRecord);
      return json;
    }
  } catch (_) { }

  // Fallback to local
  saveLocal(localRecord);
  return {
    success: true,
    message: "Thank you! Your donation and payment proof were recorded.",
    donation_id: localRecord.id,
    tracking_code: trackingCode,
    screenshot_url: localRecord.screenshot_url,
    source: "local"
  };
}

// Admin: Get donations and stats
export async function adminGetDonationsData(key, search = "", status = "all") {
  let localDonations = [];
  try {
    const raw = localStorage.getItem("alertngo_donations_list");
    if (raw) localDonations = JSON.parse(raw);
  } catch (_) { }

  let cachedSettings = DEFAULT_DONATE_SETTINGS;
  try {
    const s = localStorage.getItem("alertngo_donate_settings");
    if (s) cachedSettings = { ...DEFAULT_DONATE_SETTINGS, ...JSON.parse(s) };
  } catch (_) { }

  try {
    const q = new URLSearchParams();
    if (search) q.set("search", search);
    if (status && status !== "all") q.set("status", status);
    const url = `admin_donations.php?${q.toString()}`;

    const res = await adminRequest(url, "get", key);
    if (res && res.success) {
      const serverDonations = Array.isArray(res.data) ? res.data : [];
      const serverIds = new Set(serverDonations.map((d) => String(d.id)));
      const extraLocal = localDonations.filter((d) => !serverIds.has(String(d.id)));
      const allDonations = [...extraLocal, ...serverDonations];

      const counts = res.counts || {
        total: allDonations.length,
        pending: allDonations.filter((d) => d.payment_status === "pending").length,
        verified: allDonations.filter((d) => d.payment_status === "verified").length,
        rejected: allDonations.filter((d) => d.payment_status === "rejected").length,
        total_amount: allDonations.reduce((sum, d) => d.payment_status !== "rejected" ? sum + (Number(d.amount) || 0) : sum, 0)
      };

      const settings = res.settings ? { ...DEFAULT_DONATE_SETTINGS, ...res.settings } : cachedSettings;

      return {
        success: true,
        data: allDonations,
        counts,
        settings
      };
    }
  } catch (_) { }

  // Fallback offline
  let filtered = [...localDonations];
  if (status && status !== "all") {
    filtered = filtered.filter((d) => (d.payment_status || "pending").toLowerCase() === status.toLowerCase());
  }
  if (search) {
    const sLow = search.toLowerCase();
    filtered = filtered.filter((d) =>
      (d.donor_name && d.donor_name.toLowerCase().includes(sLow)) ||
      (d.email && d.email.toLowerCase().includes(sLow)) ||
      (d.phone && d.phone.toLowerCase().includes(sLow)) ||
      (d.pan && d.pan.toLowerCase().includes(sLow)) ||
      (d.transaction_id && d.transaction_id.toLowerCase().includes(sLow)) ||
      (d.message && d.message.toLowerCase().includes(sLow))
    );
  }

  const counts = {
    total: localDonations.length,
    pending: localDonations.filter((d) => (d.payment_status || "pending") === "pending").length,
    verified: localDonations.filter((d) => d.payment_status === "verified").length,
    rejected: localDonations.filter((d) => d.payment_status === "rejected").length,
    total_amount: localDonations.reduce((sum, d) => d.payment_status !== "rejected" ? sum + (Number(d.amount) || 0) : sum, 0)
  };

  return {
    success: true,
    data: filtered,
    counts,
    settings: cachedSettings,
    source: "local"
  };
}

// Admin: Save donate settings (Page content, QR Code, UPI, Impact Tiers, Bank details)
export async function adminSaveDonateSettings(key, settings) {
  try {
    localStorage.setItem("alertngo_donate_settings", JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent("alertngo_donate_settings_updated", { detail: settings }));
  } catch (_) { }

  try {
    return await adminRequest("admin_donations.php", "post", key, {
      action: "save_settings",
      settings
    });
  } catch (_) {
    return { success: true, message: "Settings saved locally!", source: "local" };
  }
}

// Admin: Update donation status & notes
export async function adminUpdateDonationStatus(key, id, status, notes = "") {
  try {
    const raw = localStorage.getItem("alertngo_donations_list");
    if (raw) {
      const list = JSON.parse(raw);
      const updated = list.map((d) => (String(d.id) === String(id) ? { ...d, payment_status: status, admin_notes: notes } : d));
      localStorage.setItem("alertngo_donations_list", JSON.stringify(updated));
    }
  } catch (_) { }

  try {
    return await adminRequest("admin_donations.php", "post", key, {
      action: "update_status",
      id,
      status,
      notes
    });
  } catch (_) {
    return { success: true, message: `Status updated to ${status} locally`, source: "local" };
  }
}

// Admin: Delete donation
export async function adminDeleteDonation(key, id) {
  try {
    const raw = localStorage.getItem("alertngo_donations_list");
    if (raw) {
      const list = JSON.parse(raw);
      const updated = list.filter((d) => String(d.id) !== String(id));
      localStorage.setItem("alertngo_donations_list", JSON.stringify(updated));
    }
  } catch (_) { }

  try {
    return await adminRequest(`admin_donations.php?id=${id}`, "delete", key);
  } catch (_) {
    return { success: true, message: "Donation removed locally", source: "local" };
  }
}












