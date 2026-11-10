import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaQuoteLeft } from "react-icons/fa";
import FlipCard from "../components/FlipCard";
import { fetchTeamMembers, defaultTeamMembers } from "../api/client";


const sectionHeading = (badgeText, title, sub) => (
  <div style={{ textAlign: "center", maxWidth: 820, margin: "0 auto 44px" }}>
    <span className="badge" style={{ marginBottom: 12, display: "inline-block" }}>{badgeText}</span>
    <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 3.2vw, 2rem)", color: "var(--color-dark)", marginBottom: 12, lineHeight: 1.3 }}>
      {title}
    </h2>
    <p style={{ color: "var(--color-text-light)", lineHeight: 1.7, fontSize: "0.95rem" }}>{sub}</p>
  </div>
);

const governingBodyMembers = [
  {
    name: "Prof. Ch. Diwakar Babu",
    role: "President",
    img: "/uploads/Divakar-Babu.jpg",
    badge: "Board of Directors",
    bio: "Renowned legal scholar and former Principal of V.R. Law College. A constitutional rights specialist guiding ALERT's legal interventions in tribal Fifth-Scheduled Areas of Andhra Pradesh. With decades of appellate litigation experience, he provides strategic direction to ALERT's governance and legal cell.",
    highlights: ["Principal VR Law College", "Constitutional Rights Expert", "Appellate Litigation Advisor"],
    quote: "Justice is non-negotiable for the indigenous forest dwelling communities."
  },
  {
    name: "Mr V. Rama Krishna",
    role: "Vice President",
    img: "/uploads/Ramakrishna.jpg",
    badge: "Board of Directors",
    bio: "Senior development activist specializing in rural livelihood cooperatives, grassroots agrarian sustainability, and natural resource stewardship for forest hamlets. He leads ALERT's community mobilization initiatives across the agency mandals of Andhra Pradesh.",
    highlights: ["Rural Livelihood Cooperatives", "Community Mobilization", "Natural Resource Policy"],
    quote: "Self-reliance begins when communities govern their own indigenous land."
  },
  {
    name: "Mr Y.L.J.B. Jayaraj",
    role: "Executive Secretary",
    img: "/uploads/jayaraj-sir.jpg",
    badge: "Founder & Director",
    bio: "Founder and Chief Functionary of ALERT with 47+ years of grassroots human rights experience. A specialist in affirmative tribal advocacy, Forest Rights Act (RoFR 2006) enforcement, and institutional leadership. He has led ALERT since its registration in 2004 (Reg. No. 307/2004).",
    highlights: ["47+ Years Grassroots Leadership", "FRA & PESA Enforcement Specialist", "Disaster Relief Coordinator"],
    quote: "Every tribal settlement has a constitutional right to sovereignty, dignity, and flourishing."
  },
  {
    name: "Ms P. Sirisha",
    role: "Treasurer",
    img: "/uploads/Sirisha-1.jpg",
    badge: "Board of Directors",
    bio: "Development finance specialist overseeing statutory financial auditing, reporting, and regulatory compliances under FCRA and Indian Income Tax regulations. She ensures 12A & 80G compliance and transparent donor reporting for all ALERT initiatives.",
    highlights: ["12A & 80G Compliances", "Statutory Financial Auditing", "Transparent Donor Reporting"],
    quote: "Uncompromising integrity and financial transparency are our core tenets."
  },
  {
    name: "Mr J. Prasad",
    role: "Executive Member",
    img: "/uploads/Jillela-Prasad-1-3.png",
    badge: "Board of Directors",
    bio: "Community organizer actively directing field campaigns on Forest Rights (RoFR 2006), GPS boundary demarcation, and Gram Sabha empowerment across Godavari agency mandals. He leads youth leadership training and community forest rights documentation.",
    highlights: ["RoFR Patta Verification", "Gram Sabha Mobilizer", "Youth Leadership Training"],
    quote: "The Gram Sabha is the true sovereign custodian of our ancestral forests."
  },
  {
    name: "Ms K.L. Nancharamma",
    role: "Executive Member",
    img: "/uploads/Nancharamma-1-1.png",
    badge: "Board of Directors",
    bio: "Indigenous community leader championing Yenadi women rights, healthcare access, and the Antyodaya Matsya Mithra fisheries cooperative federation. She leads women's economic empowerment across coastal mandals of Krishna District.",
    highlights: ["Antyodaya Women Leader", "Fisheries Cooperative Builder", "Indigenous Gender Rights"],
    quote: "When women lead economic cooperatives, entire tribal habitations rise."
  },
  {
    name: "Ms N. Silpa",
    role: "Executive Member",
    img: "/uploads/silpa-1.png",
    badge: "Board of Directors",
    bio: "Field intervention coordinator focusing on tribal youth digital informatics, ashram school education equity, and flood disaster relief logistical operations. She coordinates emergency relief and digital literacy programs for tribal youth.",
    highlights: ["Tribal Youth Informatics", "Ashram School Advocacy", "Emergency Relief Operations"],
    quote: "Education and digital access are the strongest equalizers for tribal youth."
  }
];

export default function GoverningBody() {
  const [members, setMembers] = useState(() => {
    try {
      const local = localStorage.getItem("alertngo_team_members");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultTeamMembers;
  });

  useEffect(() => {
    let active = true;
    fetchTeamMembers().then((res) => {
      if (active && res && Array.isArray(res.data) && res.data.length > 0) {
        try {
          const local = localStorage.getItem("alertngo_team_members");
          if (local) {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setMembers(parsed);
              return;
            }
          }
        } catch {}
        setMembers(res.data);
      }
    });

    const updateTeam = () => {
      try {
        const local = localStorage.getItem("alertngo_team_members");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) setMembers(parsed);
        }
      } catch {}
    };

    window.addEventListener("alertngo_team_updated", updateTeam);
    window.addEventListener("storage", updateTeam);

    return () => {
      active = false;
      window.removeEventListener("alertngo_team_updated", updateTeam);
      window.removeEventListener("storage", updateTeam);
    };
  }, []);

  return (
    <>
      <section className="section-pad" id="governing-body" style={{ paddingTop: 150 }}>
        <div className="container">
          {sectionHeading(
            "Section 01",
            "Governing Body – ALERT",
            "The democratic leadership that guides ALERT's mission to empower Adivasi and marginalized communities across Andhra Pradesh since 2004."
          )}

          <p style={{ textAlign: "center", color: "var(--color-text-light)", maxWidth: 700, margin: "0 auto 48px", fontSize: "0.98rem", lineHeight: 1.7 }}>
            ALERT is governed by a dedicated Board of Directors comprising legal scholars, development activists, and community leaders. The Governing Body provides strategic oversight, ensures statutory compliance (12A, 80G, FCRA), and directs all field interventions across forest rights, land acquisition & rehabilitation, women's cooperatives, and disaster relief.
          </p>

          {/* GOVERNING BODY TEAM GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 24 }}>
            {members.map((member, idx) => (
              <motion.div
                key={member.id || idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
              >
                <FlipCard
                  img={member.image_url || member.img}
                  name={member.name}
                  role={member.role}
                  bio={member.bio}
                  badge={member.badge || "Board of Directors"}
                  highlights={member.highlights || []}
                  quote={member.quote}
                />
              </motion.div>
            ))}
          </div>




        </div>
      </section>

    </>
  );
}
