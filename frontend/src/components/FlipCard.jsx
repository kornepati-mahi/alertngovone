import { useState } from "react";
import { motion } from "framer-motion";
import { FaSyncAlt, FaAward, FaQuoteLeft, FaCheckCircle } from "react-icons/fa";

export default function FlipCard({
  img,
  name,
  role,
  bio,
  badge = "Board of Directors",
  highlights = ["Constitutional Rights", "Tribal Advocacy"],
  quote
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`flip-card-wrapper ${flipped ? "is-flipped" : ""}`}
      onClick={() => setFlipped(!flipped)}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div className="flip-card-inner">
        {/* FRONT OF CARD */}
        <div className="flip-card-front">
          <div className="flip-card-image-box">
            <img
              src={img || "/uploads/Divakar-Babu.jpg"}
              alt={name}
              className="flip-card-img"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                if (e.target.src && !e.target.dataset.retried && !e.target.src.startsWith("data:") && !e.target.src.includes("Divakar")) {
                  e.target.dataset.retried = "1";
                  setTimeout(() => {
                    if (e.target) e.target.src = e.target.src.split("?")[0] + "?t=" + Date.now();
                  }, 600);
                } else {
                  e.target.onerror = null;
                  e.target.src = "/uploads/Divakar-Babu.jpg";
                }
              }}
            />
          </div>

          <div className="flip-card-front-content">
            <h3 className="flip-card-name">{name}</h3>
            <span className="flip-card-role">{role}</span>
            <p className="flip-card-preview">{bio ? bio.slice(0, 110) + "..." : ""}</p>

            <div className="flip-prompt">
              <FaSyncAlt className="flip-prompt-icon" />
              <span>Hover or tap to flip for profile</span>
            </div>
          </div>
        </div>

        {/* BACK OF CARD */}
        <div className="flip-card-back">
          <div className="flip-card-back-header">
            <div className="flip-avatar-mini">
              <img
                src={img || "/uploads/Divakar-Babu.jpg"}
                alt={name}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/uploads/Divakar-Babu.jpg";
                }}
              />
            </div>
            <div>
              <h4 className="flip-back-name">{name}</h4>
              <span className="flip-back-role">{role}</span>
            </div>
          </div>

          <div className="flip-card-back-body">
            {quote && (
              <div className="flip-back-quote">
                <FaQuoteLeft size={10} style={{ opacity: 0.6, marginRight: 6 }} />
                <span>{quote}</span>
              </div>
            )}
            <p className="flip-back-bio">{bio}</p>

            {highlights && highlights.length > 0 && (
              <div className="flip-highlights">
                {highlights.map((h, i) => (
                  <span key={i} className="flip-highlight-pill">
                    <FaCheckCircle size={9} style={{ color: "var(--color-primary)" }} /> {h}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flip-card-back-footer">
            <span className="flip-back-return">
              <FaSyncAlt size={11} /> Flip Back
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
