import { useState, useEffect } from "react";
import { resolveUploadUrl } from "../utils/resolveUploadUrl";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaDownload,
  FaExternalLinkAlt,
  FaFilePdf,
  FaSearchPlus,
  FaSearchMinus,
  FaExpand,
  FaCompress
} from "react-icons/fa";

const KNOWN_LOCAL_PDFS = [
  { match: ["mota", "tribal affairs", "guidelines faq"], file: "/uploads/MoTA_FAQ.pdf" },
  { match: ["compendium", "judgements on fra", "compendum"], file: "/uploads/Compendum-of-Judgements-on-FRA-2007-2015.pdf" },
  { match: ["annual report"], file: "/uploads/ALERT_Annual-report-from-April-2020-to-March-2021-1.pdf" },
  { match: ["award copies"], file: "/uploads/AWARD-COPIES-1.pdf" },
  { match: ["faq-larr", "faq larr"], file: "/uploads/FAQ-LARR.pdf" },
  { match: ["faqs on ngo", "faqs-on-ngo"], file: "/uploads/FAQS-ON-NGO.pdf" },
  { match: ["greivance", "grievance faq"], file: "/uploads/GREIVANCE-FAQ.pdf" },
  { match: ["high-court-cases_eg", "high court cases eg"], file: "/uploads/High-court-Cases_EG-1.pdf" },
  { match: ["mgnrega", "mgnrega guidelines"], file: "/uploads/MGNREGA_GUIDELINES.pdf" },
  { match: ["nrega_faq", "nrega faq"], file: "/uploads/NREGA_FAQ.pdf" },
  { match: ["organizational profile", "profile of alert"], file: "/uploads/Organizational-Profile-of-ALERT.pdf" },
  { match: ["pending-high-court", "pending high court"], file: "/uploads/Pending-High-court-cases_WG.pdf" },
  { match: ["pmksy"], file: "/uploads/PMKSY_FAQ.pdf" },
  { match: ["rr commissioner", "rr-commissioner"], file: "/uploads/RR-commissioner-office_Court-Cases.pdf" },
  { match: ["rti data", "rti-data"], file: "/uploads/RTI-Data-LA-RR-Court.pdf" },
  { match: ["rti online", "rti-online"], file: "/uploads/RTI-Online-FAQs.pdf" }
];

export default function PdfViewerModal({ isOpen, file, fileUrl, url, title, meta, onClose }) {
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);

  // Safely resolve file path whether passed as a string or an object
  let rawFile = resolveUploadUrl(
  typeof file === "string"
    ? file
    : (file?.file || file?.fileUrl || file?.url || fileUrl || url || "")
);

  const cleanFilenameTitle = (filePath) => {
    if (!filePath || typeof filePath !== "string") return "";
    const base = filePath.split("/").pop().split("?")[0].replace(/\.pdf$/i, "");
    if (!base) return "";
    return base
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const actualTitle =
    title ||
    (typeof file === "object" ? (file?.title || file?.text || file?.name || file?.filename) : null) ||
    cleanFilenameTitle(rawFile) ||
    "Official Document";

  const actualMeta = meta || (typeof file === "object" ? (file?.meta || file?.category) : null);

  // Check if this document corresponds to a local uploaded PDF for reliable preview
  let localPdfMatch = null;
  const searchKey = `${actualTitle} ${rawFile}`.toLowerCase();
  for (const item of KNOWN_LOCAL_PDFS) {
    if (item.match.some((m) => searchKey.includes(m))) {
      localPdfMatch = item.file;
      break;
    }
  }

  // If a local copy exists and rawFile was a Google Drive link, use local copy for instant, reliable embed
  const actualFile = (rawFile.includes("drive.google.com") && localPdfMatch)
    ? localPdfMatch
    : rawFile;

  // Convert Google Drive view URLs to preview format for iframe embedding
  const driveMatch = actualFile.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/);

  const safeEncodePdfUrl = (urlStr) => {
    if (!urlStr || typeof urlStr !== "string") return "";
    if (urlStr.startsWith("http://") || urlStr.startsWith("https://") || urlStr.startsWith("blob:") || urlStr.startsWith("data:")) {
      return urlStr;
    }
    const [pathPart, hashPart] = urlStr.split("#");
    const segments = pathPart.split("/").map((seg) => {
      try {
        return encodeURIComponent(decodeURIComponent(seg));
      } catch (_) {
        return encodeURIComponent(seg);
      }
    });
    const encoded = segments.join("/");
    return hashPart ? `${encoded}#${hashPart}` : encoded;
  };

  const cleanPdfUrl = safeEncodePdfUrl(actualFile);

  const driveDownloadUrl = driveMatch
    ? `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`
    : cleanPdfUrl;

  const driveViewUrl = driveMatch
    ? `https://drive.google.com/file/d/${driveMatch[1]}/view?usp=sharing`
    : cleanPdfUrl;

  // For Google Drive links, embed Google Drive's preview.
  // For local files and standard PDFs, embed directly with #toolbar=0&navpanes=0
  // so they load reliably, instantly, without "No preview available" errors.
  const currentIframeSrc = driveMatch
    ? `https://drive.google.com/file/d/${driveMatch[1]}/preview`
    : `${cleanPdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    if (actualFile && (isOpen === undefined || isOpen === true)) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onClose, actualFile, isOpen]);

  if (isOpen === false || !actualFile) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="pdf-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`pdf-modal-container ${fullscreen ? "fullscreen" : ""}`}
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* TOP TOOLBAR */}
          <div className="pdf-modal-header">
            <div className="pdf-modal-info">
              <div className="pdf-icon-badge">
                <FaFilePdf />
              </div>
              <div>
                <h3 className="pdf-modal-title">{actualTitle}</h3>
                {actualMeta && <span className="pdf-modal-meta">{actualMeta}</span>}
              </div>
            </div>

            <div className="pdf-modal-actions">
              {/* ZOOM CONTROLS */}
              <div className="pdf-zoom-group">
                <button
                  type="button"
                  title="Zoom Out"
                  onClick={() => setZoom((z) => Math.max(70, z - 15))}
                  className="pdf-btn"
                >
                  <FaSearchMinus size={13} />
                </button>
                <span className="pdf-zoom-label">{zoom}%</span>
                <button
                  type="button"
                  title="Zoom In"
                  onClick={() => setZoom((z) => Math.min(160, z + 15))}
                  className="pdf-btn"
                >
                  <FaSearchPlus size={13} />
                </button>
              </div>

              {/* FULLSCREEN TOGGLE */}
              <button
                type="button"
                title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
                onClick={() => setFullscreen(!fullscreen)}
                className="pdf-btn"
              >
                {fullscreen ? <FaCompress size={13} /> : <FaExpand size={13} />}
              </button>

              {/* OPEN IN NEW TAB (failsafe) */}
              <a
                href={driveViewUrl}
                target="_blank"
                rel="noreferrer"
                title="Open PDF in new tab"
                className="pdf-btn"
              >
                <FaExternalLinkAlt size={13} /> <span>Open</span>
              </a>

              {/* DIRECT DOWNLOAD (failsafe) */}
              <a
                href={driveDownloadUrl}
                download
                target="_blank"
                rel="noreferrer"
                title="Download PDF"
                className="pdf-btn-primary"
              >
                <FaDownload size={13} /> <span>Download</span>
              </a>

              {/* CLOSE BUTTON */}
              <button
                type="button"
                onClick={onClose}
                title="Close Viewer (Esc)"
                className="pdf-btn-close"
              >
                <FaTimes size={16} />
              </button>
            </div>
          </div>

          {/* VIEWER BODY */}
          <div className="pdf-modal-body" style={{ position: "relative", background: "#ffffff" }}>
            <div
              className="pdf-frame-wrapper"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
                transition: "transform 0.2s ease",
                background: "#ffffff"
              }}
            >
              <iframe
                src={currentIframeSrc}
                title={actualTitle || "PDF Document"}
                className="pdf-iframe"
                style={{ background: "#ffffff", border: "none" }}
              />
            </div>

            {/* BLOCK / HIDE GOOGLE DRIVE EMBEDDED POPOUT / SHARE ICON WITH ALERT BADGE (for Google Drive only) */}
            {driveMatch && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 76,
                  height: 56,
                  background: "#0E2B66",
                  borderBottomLeftRadius: 10,
                  zIndex: 30,
                  pointerEvents: "auto",
                  cursor: "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderLeft: "1px solid rgba(255, 255, 255, 0.15)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                }}
                aria-hidden="true"
              >
                <span
                  style={{
                    color: "#93c5fd",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    userSelect: "none"
                  }}
                >
                  ALERT
                </span>
              </div>
            )}
          </div>

          {/* FOOTER BAR */}
          <div className="pdf-modal-footer">
            <span>Official Repository Record • Association for Land and Livelihood (ALERT)</span>
            <span className="pdf-badge-tag">Statutory Document</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
