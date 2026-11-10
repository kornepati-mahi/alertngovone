import { useState, useEffect, lazy, Suspense } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSearch, FaFileAlt, FaArrowRight, FaTable, FaImages, FaDownload, FaFilter, FaMapMarkedAlt, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { fetchAllPages } from "../api/client";

const PolavaramLaRr = lazy(() => import("./PolavaramLaRr"));

export default function AllPages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const catFromQuery = searchParams.get("category") || "All";
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState(catFromQuery);
  const [laRrExpanded, setLaRrExpanded] = useState(true);

  const isPolavaramCat = selectedCat === "Polavaram LA & R&R";

  useEffect(() => {
    const qCat = searchParams.get("category");
    if (qCat) {
      setSelectedCat(qCat);
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    fetchAllPages().then((res) => {
      if (isMounted) {
        if (res && Array.isArray(res.data)) {
          const seen = new Set();
          const unique = res.data.filter((p) => {
            const s = (p?.slug || "").trim();
            if (!s || seen.has(s)) return false;
            seen.add(s);
            return true;
          });
          setPages(unique);
        }
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);



  const categories = ["All", "Polavaram LA & R&R", "Forest Rights & LTR", "Disaster Relief", "Governance & Institutional", "Programs & Livelihood", "Legal & Downloads", "Community & Archive"];

  const filtered = pages.filter(p => {
    const matchesCat = selectedCat === "All" || p.category === selectedCat;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <>
      <section className="section-pad" style={{ background: "var(--color-bg)", paddingTop: 140 }}>
        <div className="container">
          {/* SEARCH & FILTER CONTROLS */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 36 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCat(c)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 20,
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: selectedCat === c ? "none" : "1px solid #cbd5e1",
                    background: selectedCat === c ? "var(--color-primary)" : "white",
                    color: selectedCat === c ? "white" : "var(--color-dark)",
                    transition: "all 0.2s"
                  }}
                >
                  {c}
                </button>
              ))}
            </div>

            <div style={{ position: "relative", minWidth: 280 }}>
              <input
                type="text"
                placeholder="Search across all documentation & records..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 16px 10px 38px",
                  borderRadius: 25,
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxShadow: "var(--shadow-sm)"
                }}
              />
              <FaSearch style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            </div>
          </div>

          <div style={{ fontSize: "0.9rem", color: "var(--color-text-light)", marginBottom: 20 }}>
            Showing <strong>{filtered.length}</strong> of <strong>{pages.length}</strong> total pages.
          </div>

          {/* ── POLAVARAM LA & R&R EMBEDDED SECTION ── */}
          {isPolavaramCat && (
            <div style={{ marginBottom: 48 }}>
              {/* Banner linking to /la-rr */}
              <div
                style={{
                  background: "linear-gradient(135deg, #D2190C 0%, #003190 100%)",
                  borderRadius: 18,
                  padding: "22px 28px",
                  marginBottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 14,
                  boxShadow: "0 8px 32px rgba(210,25,12,0.25)",
                  cursor: "pointer",
                }}
                onClick={() => setLaRrExpanded(v => !v)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.3rem",
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    <FaMapMarkedAlt />
                  </span>
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
                      Full Page Preview
                    </div>
                    <div style={{ color: "#fff", fontWeight: 800, fontSize: "clamp(1rem,2.5vw,1.25rem)", lineHeight: 1.2 }}>
                      Polavaram Land Acquisition &amp; R&amp;R
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.82rem", marginTop: 3 }}>
                      Sections 01–07 · Documents · Court Cases · Submergence Maps
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Link
                    to="/la-rr"
                    onClick={e => e.stopPropagation()}
                    style={{
                      background: "rgba(255,255,255,0.18)",
                      color: "#fff",
                      border: "1.5px solid rgba(255,255,255,0.35)",
                      borderRadius: 10,
                      padding: "8px 18px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      textDecoration: "none",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    Open Full Page <FaArrowRight size={11} />
                  </Link>
                  <span style={{ color: "#fff", fontSize: "1.2rem" }}>
                    {laRrExpanded ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </div>
              </div>

              {/* Embedded PolavaramLaRr content */}
              {laRrExpanded && (
                <div
                  style={{
                    border: "2px solid #e2e8f0",
                    borderTop: "none",
                    borderRadius: "0 0 18px 18px",
                    overflow: "hidden",
                    background: "var(--color-bg)",
                  }}
                >
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "8px 20px",
                      borderBottom: "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      📄 Embedded from
                    </span>
                    <Link to="/la-rr" style={{ fontSize: "0.75rem", color: "#D2190C", fontWeight: 700, textDecoration: "underline" }}>
                      alertngo.in/la-rr
                    </Link>
                  </div>
                  <Suspense fallback={
                    <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-light)" }}>
                      <div style={{ marginTop: 12 }}>Loading Polavaram LA &amp; R&amp;R content…</div>
                    </div>
                  }>
                    <PolavaramLaRr />
                  </Suspense>
                </div>
              )}
            </div>
          )}

          {/* PAGES GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {filtered.map((item, idx) => (
              <motion.div
                key={`${item.slug}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                whileHover={{ y: -4, boxShadow: "var(--shadow-md)" }}
                style={{
                  background: "white",
                  borderRadius: 14,
                  padding: 22,
                  boxShadow: "var(--shadow-sm)",
                  border: "1px solid #f1f5f9",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "4px 10px", borderRadius: 12, background: "rgba(255,137,0,0.1)", color: "var(--color-primary)", textTransform: "uppercase" }}>
                      {item.category}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      /{item.slug}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-dark)", marginBottom: 12, lineHeight: 1.4 }}>
                    {item.title}
                  </h3>
                  <div style={{ display: "flex", gap: 14, fontSize: "0.78rem", color: "var(--color-text-light)", marginBottom: 18 }}>
                    {item.tables_count > 0 && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><FaTable color="var(--color-primary)" /> {item.tables_count} Tables</span>}
                    {item.images_count > 0 && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><FaImages color="var(--color-secondary)" /> {item.images_count} Media</span>}
                    {item.downloads_count > 0 && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><FaDownload color="#ef4444" /> {item.downloads_count} PDFs</span>}
                  </div>
                </div>

                <Link
                  to={`/page/${item.slug}`}
                  className="btn-primary"
                  style={{ padding: "8px 16px", fontSize: "0.84rem", justifyContent: "center" }}
                >
                  View Full Page Data <FaArrowRight size={11} />
                </Link>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "56px 20px", background: "white", borderRadius: 14, border: "1px solid #f1f5f9", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--color-dark)", marginBottom: 8 }}>No pages found</div>
                <p style={{ color: "var(--color-text-light)", fontSize: "0.9rem", margin: 0 }}>
                  {pages.length === 0
                    ? "The page directory is empty right now. Please check back shortly."
                    : "Nothing matches this search or category. Try a different keyword or pick another category."}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
