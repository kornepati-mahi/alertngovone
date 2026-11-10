import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaLinkedin, FaMapMarkerAlt, FaPhone, FaEnvelope, FaHeart, FaArrowRight } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="footer-logo-badge">
                  <img src="/alert-logo.png" alt="ALERT logo" />
                </div>
              </div>
              <p className="footer-desc">
                Association for Land and Livelihood, Environment, Research and Training.
                Empowering Adivasi and coastal fishing communities in Andhra Pradesh since 2004 towards prosperity and peace.
              </p>
              <div className="footer-social">
                <a href="https://www.facebook.com/share/1CKPiocND8/" target="_blank" rel="noreferrer" className="social-btn" title="Facebook"><FaFacebook /></a>
                <a href="https://x.com/AlertapIn" target="_blank" rel="noreferrer" className="social-btn" title="X (Twitter)"><FaTwitter /></a>
                <a href="https://www.instagram.com/alertngo/" target="_blank" rel="noreferrer" className="social-btn" title="Instagram"><FaInstagram /></a>
                <a href="https://www.youtube.com/@alertvja" target="_blank" rel="noreferrer" className="social-btn" title="YouTube"><FaYoutube /></a>
                <a href="https://www.linkedin.com/company/107938041/" target="_blank" rel="noreferrer" className="social-btn" title="LinkedIn"><FaLinkedin /></a>
              </div>
            </div>

            <div className="footer-col">
              <h4>Organization</h4>
              <div className="footer-links">
                <Link to="/" className="footer-link">Home</Link>
                <Link to="/about" className="footer-link">About ALERT</Link>
                <Link to="/governing-body" className="footer-link">Governing Body</Link>
                <Link to="/vision-mission-2" className="footer-link">Vision &amp; Mission</Link>
                <Link to="/core-values" className="footer-link">Core Values</Link>
                <Link to="/organizational-profile" className="footer-link">Organizational Profile</Link>
                <Link to="/organogram" className="footer-link">Organogram</Link>
                <Link to="/alert-policies" className="footer-link">ALERT Policies</Link>
                <Link to="/area-of-operation" className="footer-link">Area of Operation</Link>
              </div>
            </div>

            <div className="footer-col">
              <h4>Polavaram &amp; Land Rights</h4>
              <div className="footer-links">
                <Link to="/legislative-acts-2" className="footer-link">Polavaram Irrigation Project</Link>
                <Link to="/submergence-area-map" className="footer-link">Submergence Area Map</Link>
                <Link to="/chronological-order-of-pip-progress" className="footer-link">PIP Progress Timeline</Link>
                <Link to="/issues-of-pip" className="footer-link">Issues in PIP</Link>
                <Link to="/la-rr" className="footer-link">LA &amp; RR</Link>
                <Link to="/land-acquisition-la" className="footer-link">Land Acquisition</Link>
                <Link to="/cases" className="footer-link">Court Cases</Link>
                <Link to="/rr-package" className="footer-link">RR Packages</Link>
                <Link to="/dprs" className="footer-link">DPR's</Link>
                <Link to="/award-copies" className="footer-link">Award Copies</Link>
              </div>
            </div>

            <div className="footer-col">
              <h4>Forest Rights &amp; Grievance</h4>
              <div className="footer-links">
                <Link to="/rofr" className="footer-link">RoFR &amp; LTR</Link>
                <Link to="/abstract-rofr" className="footer-link">Abstract RoFR</Link>
                <Link to="/reasons-for-rejections" className="footer-link">Reasons for Rejections</Link>
                <Link to="/grievances" className="footer-link">Grievance Redressal</Link>
                <Link to="/rr-grievances" className="footer-link">Land Rights Grievance</Link>
                <Link to="/types-of-grievances" className="footer-link">Types of Grievances</Link>
                <Link to="/downloads" className="footer-link">Legal Downloads &amp; Acts</Link>
                <Link to="/all-pages" className="footer-link" style={{ color: "var(--color-primary-light)", fontWeight: 600 }}>All 90 Pages Repository</Link>
              </div>
            </div>

            <div className="footer-col">
              <h4>Relief &amp; Support</h4>
              <div className="footer-links">
                <Link to="/flood-relief-measures-2021" className="footer-link">Flood Relief Measures</Link>
                <Link to="/2023-2" className="footer-link">Flood Relief 2023</Link>
                <Link to="/blankets-distribution-in-east-godavari" className="footer-link">Blankets East Godavari</Link>
                <Link to="/groceries-distribution-in-west-godavari" className="footer-link">Groceries West Godavari</Link>
                <Link to="/achievements" className="footer-link">Achievements</Link>
                <Link to="/child-interventions" className="footer-link">Child Interventions</Link>
                <Link to="/child-bare-acts" className="footer-link">Child Bare Acts</Link>
                <Link to="/news" className="footer-link">News &amp; Views</Link>
                <Link to="/faqs" className="footer-link">FAQs</Link>
                <Link to="/quick-links" className="footer-link">Quick Links</Link>
              </div>
            </div>

            <div className="footer-col">
              <h4>Head Office</h4>
              <div className="footer-links">
                <span className="footer-link" style={{ lineHeight: 1.5 }}>
                  <FaMapMarkerAlt style={{ color: "var(--color-primary)", flexShrink: 0, marginTop: 4 }} />
                  Door No. 40-9/1-16, Sai Nagar, Near Benz Circle, Vijayawada - 520010, AP
                </span>
                <a href="tel:+919391234444" className="footer-link">
                  <FaPhone style={{ color: "var(--color-primary)" }} /> 9391234444
                </a>
                <a href="mailto:alertap.in@gmail.com" className="footer-link">
                  <FaEnvelope style={{ color: "var(--color-primary)" }} /> alertap.in@gmail.com
                </a>
              </div>
              <div style={{ marginTop: 20 }}>
                <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Reg. No: 307/2004</p>
                <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>12A &amp; 80G Certified • FCRA Approved</p>
              </div>
              <div style={{ marginTop: 20 }}>
                <Link to="/donate" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", fontSize: "0.85rem", width: "auto" }}>
                  <FaHeart size={11} /> Donate Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} ALERT – Towards Prosperity and Peace. Empowering Fifth Scheduled Communities.
          </p>
          <div className="footer-legal">
            <Link to="/downloads">Bare Acts</Link>
            <Link to="/faqs">Tax Exemption</Link>
            <Link to="/contact">Support</Link>
            <Link to="/admin">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
