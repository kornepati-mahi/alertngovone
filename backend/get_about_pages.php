<?php
require_once __DIR__ . '/config.php';

$defaultAboutPages = [
    "about" => [
        "slug" => "about",
        "badge" => "Section 00",
        "title" => "About Us",
        "subtitle" => "ALERT — Association for Land and Livelihood, Environment, Research and Training — is a grassroots non-profit working with Adivasi and marginalized communities across the Fifth Scheduled Areas of Andhra Pradesh since 2004.",
        "content" => [
            "est_badge" => "Est. 2004",
            "org_heading" => "Association for Land and Livelihood, Environment, Research and Training",
            "p1" => "ALERT was established in 2004 under the Societies Registration Act (Reg. No. 307/2004) and is headquartered in Vijayawada, Andhra Pradesh. Led by founder-director YL Jayaraj, who brings 47 years of experience in grass-roots human rights and community empowerment, ALERT specializes in supporting marginalized communities in the Fifth Scheduled Areas.",
            "p2" => "Our mandate spans affirmative legislation enforcement, the Forest Rights Act (RoFR 2006), the PESA Act 1996, Land Transfer Regulation 1 of 1970, and fair rehabilitation for communities displaced by mega irrigation projects like Polavaram.",
            "hero_image" => "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg",
            "accreditations_title" => "Legal Accreditations",
            "accreditations_desc" => "12A, 80G Tax Exemption, FCRA Registered",
            "governance_title" => "Governance Code",
            "governance_desc" => "Governed by 35 Institutional Policies",
            "profile_pdf" => "/uploads/Organizational-Profile-of-ALERT.pdf",
            "annual_report_pdf" => "/uploads/ALERT_Annual-report-from-April-2020-to-March-2021-1.pdf",
            "governing_badge" => "Section 06",
            "governing_title" => "Governing Body",
            "governing_subtitle" => "The democratic Board of Directors that guides ALERT's mission across Andhra Pradesh since 2004.",
            "governing_intro" => "ALERT is governed by a dedicated Board of Directors comprising legal scholars, development activists, and community leaders. The Governing Body ensures statutory compliance (12A, 80G, FCRA) and directs all field interventions across forest rights, land acquisition & rehabilitation, women's cooperatives, and disaster relief.",
            "board_members" => [
                [
                    "name" => "Prof. Ch. Diwakar Babu",
                    "role" => "President",
                    "badge" => "Board of Directors",
                    "img" => "/uploads/Divakar-Babu.jpg",
                    "bio" => "Renowned legal scholar and former Principal of V.R. Law College. A constitutional rights specialist guiding ALERT's legal interventions in tribal Fifth-Scheduled Areas of Andhra Pradesh.",
                    "highlights" => "Principal VR Law College, Constitutional Rights Expert, Appellate Litigation Advisor",
                    "quote" => "Justice is non-negotiable for the indigenous forest dwelling communities."
                ],
                [
                    "name" => "Mr V. Rama Krishna",
                    "role" => "Vice President",
                    "badge" => "Board of Directors",
                    "img" => "/uploads/Ramakrishna.jpg",
                    "bio" => "Senior development activist specializing in rural livelihood cooperatives and natural resource stewardship for forest hamlets.",
                    "highlights" => "Rural Livelihood Cooperatives, Community Mobilization, Natural Resource Policy",
                    "quote" => "Self-reliance begins when communities govern their own indigenous land."
                ],
                [
                    "name" => "Mr Y.L.J.B. Jayaraj",
                    "role" => "Executive Secretary",
                    "badge" => "Founder & Director",
                    "img" => "/uploads/jayaraj-sir.jpg",
                    "bio" => "Founder and Chief Functionary of ALERT with 47+ years of grassroots human rights experience. Specialist in FRA & PESA enforcement.",
                    "highlights" => "47+ Years Grassroots Leadership, FRA & PESA Enforcement Specialist",
                    "quote" => "Every tribal settlement has a constitutional right to sovereignty, dignity, and flourishing."
                ],
                [
                    "name" => "Ms P. Sirisha",
                    "role" => "Treasurer",
                    "badge" => "Board of Directors",
                    "img" => "/uploads/Sirisha-1.jpg",
                    "bio" => "Development finance specialist overseeing statutory financial auditing and 12A & 80G compliance.",
                    "highlights" => "12A & 80G Compliances, Statutory Financial Auditing, Transparent Donor Reporting",
                    "quote" => "Uncompromising integrity and financial transparency are our core tenets."
                ]
            ],
            "sec05_badge" => "Section 05",
            "sec05_title" => "20-Year Milestones",
            "sec05_subtitle" => "The journey from 2004 registration to two decades of transformative grassroots justice, appellate litigation, and women cooperative federations.",
            "timeline_badge" => "Historical Journey",
            "timeline_sub" => "2004 — 2024 • Two Decades of Impact",
            "timeline_heading" => "Two Decades of Transformative Milestones",
            "timeline_desc" => "Trace the evolution of ALERT from its foundational registration in 2004 to landmark appellate High Court litigation, securing 15,000+ forest acres, and building indigenous women cooperative federations.",
            "timeline_jubilee_title" => "20 Years of Advocacy",
            "timeline_jubilee_sub" => "2004 — 2024 Jubilee",
            "timeline_metrics" => [
                ["label" => "Active Field Tenure", "val" => "20+ Years", "desc" => "Continuous Grassroots Work", "color" => "#F5A000", "icon" => "FaHistory"],
                ["label" => "Forest Rights Secured", "val" => "15,000+ Ac.", "desc" => "RoFR 2006 Patta Titles", "color" => "#10b981", "icon" => "FaTree"],
                ["label" => "Federated Women", "val" => "3,500+", "desc" => "Matsya Mithra Cooperatives", "color" => "#8b5cf6", "icon" => "FaUsers"],
                ["label" => "Off-Grid Solar Hamlets", "val" => "75+", "desc" => "Clean Energy Micro-Grids", "color" => "#f59e0b", "icon" => "FaSun"]
            ],
            "milestones" => [
                [
                    "year" => "2004",
                    "title" => "ALERT Founded & Registered",
                    "phase" => "FOUNDATION & STATUTORY MANDATE",
                    "category" => "Legal & Rights",
                    "color" => "#1e3a8a",
                    "icon" => "FaLandmark",
                    "stat" => "Registration No. 307/2004",
                    "desc" => "ALERT was formally established in Vijayawada under the Societies Registration Act, 1860. Guided by founder-director Y.L.J.B. Jayaraj with 47 years of grassroots advocacy, ALERT dedicated its statutory mission to protecting marginalized communities across Andhra Pradesh's Fifth Scheduled Areas."
                ],
                [
                    "year" => "2008",
                    "title" => "Forest Rights Act (RoFR 2006) Movement",
                    "phase" => "INDIGENOUS LAND RIGHTS",
                    "category" => "Land & Energy",
                    "color" => "#10b981",
                    "icon" => "FaTree",
                    "stat" => "Gram Sabha Community Mapping",
                    "desc" => "Pioneered intensive legal literacy, GPS boundary demarcation, and Community Forest Rights (CFR) claim campaigns across the Godavari agency forest tracts, mobilizing Gram Sabhas to claim their ancestral homeland under the landmark RoFR Act 2006."
                ],
                [
                    "year" => "2012",
                    "title" => "Historic Polavaram Displacement PILs",
                    "phase" => "APPELLATE CONSTITUTIONAL LITIGATION",
                    "category" => "Legal & Rights",
                    "color" => "#ef4444",
                    "icon" => "FaGavel",
                    "stat" => "High Court & Supreme Court Writs",
                    "desc" => "Filed landmark Public Interest Litigations (PILs) challenging arbitrary compensation norms and forced evictions for the Polavaram Multi-Purpose Irrigation Project, demanding comprehensive land-for-land rehabilitation under constitutional guarantees."
                ],
                [
                    "year" => "2016",
                    "title" => "Antyodaya Project for Nomadic Yenadis",
                    "phase" => "NOMADIC COMMUNITY RESILIENCE",
                    "category" => "Community & Women",
                    "color" => "#0ea5e9",
                    "icon" => "FaHandHoldingHeart",
                    "stat" => "6 Coastal Mandals • BftW Partnership",
                    "desc" => "Launched the flagship Antyodaya Project across 6 coastal mandals of Krishna District with Bread for the World (BftW, Germany) partnership, securing permanent house-site pattas, civil documentation, and clean drinking water for excluded nomadic Yenadi families."
                ],
                [
                    "year" => "2019",
                    "title" => "15,000+ Forest Acres Legally Secured",
                    "phase" => "FOREST TENURE TRIUMPH",
                    "category" => "Land & Energy",
                    "color" => "#16a34a",
                    "icon" => "FaCheckCircle",
                    "stat" => "15,000+ Acres Certified Pattas",
                    "desc" => "Crossed a historic milestone: successfully securing individual and Community Forest Resource (CFR) titles over 15,000+ acres for Adivasi habitations, ending decades of eviction threats by forest authorities."
                ],
                [
                    "year" => "2021",
                    "title" => "Solar Micro-Grids in 75+ Off-Grid Hamlets",
                    "phase" => "DECENTRALIZED CLEAN ENERGY",
                    "category" => "Land & Energy",
                    "color" => "#f59e0b",
                    "icon" => "FaSun",
                    "stat" => "75+ Remote Hamlets Electrified",
                    "desc" => "Brought clean decentralized solar home lighting and solar water purification units to 75+ remote, off-grid tribal hamlets deep inside the Godavari river gorges cut off from conventional power grids."
                ],
                [
                    "year" => "2023",
                    "title" => "Matsya Mithra Women Fisheries Crosses 3,500 Members",
                    "phase" => "WOMEN COOPERATIVE FEDERATION",
                    "category" => "Community & Women",
                    "color" => "#8b5cf6",
                    "icon" => "FaUsers",
                    "stat" => "3,500+ Indigenous Women Leaders",
                    "desc" => "The Antyodaya Matsya Mithra Women Fisheries Federation expanded to over 3,500 active indigenous fisherwomen members, generating sustainable livelihood micro-enterprises and eliminating exploitation by predatory moneylenders."
                ],
                [
                    "year" => "2024",
                    "title" => "Celebrating 20 Years of Grassroots Justice",
                    "phase" => "TWO DECADES JUBILEE (2004–2024)",
                    "category" => "Legal & Rights",
                    "color" => "#D2190C",
                    "icon" => "FaAward",
                    "stat" => "20 Years of Unbroken Integrity",
                    "desc" => "Two continuous decades of relentless constitutional advocacy, empowering Adivasis in Scheduled V agency mandals, securing land sovereignty, and setting high benchmarks in voluntary governance."
                ]
            ]
        ]
    ],
    "vision-mission" => [
        "slug" => "vision-mission",
        "badge" => "Section 01",
        "title" => "Vision & Mission",
        "subtitle" => "Guiding principles that drive every intervention across forest rights, land rehabilitation, and tribal empowerment since 2004.",
        "content" => [
            "vision" => [
                "tag" => "OUR VISION",
                "subtitle" => "Core Direction",
                "statement_label" => "Vision Statement",
                "title" => "Our Vision",
                "quote" => "An egalitarian society where tribal and marginalized communities live with sovereign dignity, social justice, and constitutional self-determination.",
                "desc" => "ALERT envisions an inclusive and resilient society in which Adivasis and vulnerable forest hamlets govern their ancestral ecosystems through constitutional safeguards like PESA 1996 and RoFR 2006. We strive for an India where indigenous wisdom guides ecological conservation and every child accesses equitable quality education without losing their cultural roots.",
                "image" => "/uploads/cropped-12.jpg",
                "points" => [
                    "Sovereignty over ancestral forest domains and community water resources.",
                    "Active constitutional legal aid protecting vulnerable indigenous families.",
                    "Empowered women cooperatives leading economic grassroots enterprises.",
                    "Intergenerational cultural preservation of language, music, and traditions."
                ]
            ],
            "mission" => [
                "tag" => "OUR MISSION",
                "subtitle" => "Strategic Mandate",
                "statement_label" => "Mission Statement",
                "title" => "Our Mission",
                "quote" => "Mobilizing communities, defending constitutional land tenure, and fostering sustainable indigenous livelihoods through collaborative grassroots action.",
                "desc" => "To educate, organize, and legally support tribal and forest-dwelling communities across Andhra Pradesh to claim their statutory rights under the Forest Rights Act 2006 and LARR Act 2013, while pioneering sustainable solar electrification and women-led cooperative enterprises.",
                "image" => "/uploads/cropped-4.jpg",
                "pillars" => [
                    "Rights Enforcement",
                    "Grassroots Organizing",
                    "Sustainable Livelihoods",
                    "Emergency Relief & Energy"
                ]
            ],
            "profile_pdf" => "/uploads/Organizational-Profile-of-ALERT.pdf",
            "profile_pdf_label" => "Download Official Profile PDF",
            "stats" => [
                "badge" => "Our Impact",
                "title" => "Numbers That Speak",
                "subtitle" => "Two decades of grassroots work across the Fifth Scheduled Areas of Andhra Pradesh — measured in lives touched, rights secured, and communities empowered.",
                "items" => [
                    ["num" => "20+", "label" => "Years of Service", "desc" => "Rooted in tribal empowerment since 2004", "color" => "#F5A000"],
                    ["num" => "25,000+", "label" => "Adivasi Families", "desc" => "Households supported across three regions", "color" => "#38BDF8"],
                    ["num" => "15,000+", "label" => "Forest Rights Acres", "desc" => "Individual & community forest titles secured", "color" => "#3E8E0F"],
                    ["num" => "371", "label" => "Submergence Villages", "desc" => "Polavaram belt habitations defended", "color" => "#D2190C"],
                    ["num" => "75+", "label" => "Solar Hamlets", "desc" => "Off-grid villages electrified", "color" => "#F5A000"]
                ]
            ],
            "beliefs" => [
                "badge" => "Core Beliefs",
                "title" => "What We Stand For",
                "subtitle" => "ALERT's work is anchored in these core beliefs that shape every project, partnership, and policy advocacy we undertake.",
                "items" => [
                    ["title" => "Rights First", "desc" => "Every tribal family has a constitutional right to ancestral forest land.", "color" => "#003190"],
                    ["title" => "Self-Reliance", "desc" => "Building Gram Sabha sovereignty and women-led cooperatives.", "color" => "#D2190C"],
                    ["title" => "Sustainable Ecology", "desc" => "Protecting forests and natural resources for future generations.", "color" => "#3E8E0F"],
                    ["title" => "Collective Action", "desc" => "Strengthening community-based organizations across agency mandals.", "color" => "#F5A000"],
                    ["title" => "Gender Justice", "desc" => "Empowering Yenadi and tribal women through cooperatives.", "color" => "#D2190C"],
                    ["title" => "Clean Energy", "desc" => "Bringing solar lighting to off-grid tribal hamlets.", "color" => "#3E8E0F"],
                    ["title" => "Legal Advocacy", "desc" => "Fighting for fair compensation and R&R packages.", "color" => "#003190"],
                    ["title" => "Transparency", "desc" => "12A & 80G certified, FCRA registered, annual audits.", "color" => "#F5A000"]
                ]
            ],
            "approach" => [
                "badge" => "Our Approach",
                "title" => "From Rights to Resilience",
                "desc" => "ALERT follows a rights-based development approach: we awaken communities to their constitutional entitlements, sensitize duty-bearers to their obligations, organize Gram Sabhas into collective decision-making bodies, and mobilize resources for sustainable forest rights, land justice, and livelihood security.",
                "tags" => ["Community-Led", "Rights-Based", "Sustainable"]
            ]
        ]
    ],
    "core-values" => [
        "slug" => "core-values",
        "badge" => "Section 02",
        "title" => "Core Values",
        "subtitle" => "The principles that guide every ALERT intervention — from forest rights to land rehabilitation, from women's cooperatives to disaster relief.",
        "content" => [
            "values" => [
                [
                    "id" => "integrity",
                    "title" => "Integrity",
                    "quote" => "We choose our thoughts and actions based on values rather than personal gain.",
                    "desc" => "Integrity is the foundation of everything ALERT does. We commit to honest, ethical, and principled action in every intervention — from forest rights claims to land rehabilitation — ensuring that our work stands on moral ground.",
                    "icon" => "FaShieldAlt",
                    "accent" => "#D2190C",
                    "image" => ""
                ],
                [
                    "id" => "accountability",
                    "title" => "Accountability",
                    "quote" => "We love to be slapped with truth than to be kissed with a lie.",
                    "desc" => "ALERT holds itself answerable to the communities we serve, our donors, and the law. Every rupee spent, every decision made, and every claim filed is documented, audited, and open to scrutiny.",
                    "icon" => "FaBalanceScale",
                    "accent" => "#003190",
                    "image" => ""
                ],
                [
                    "id" => "transparency",
                    "title" => "Transparency",
                    "quote" => "We build trust through transparency.",
                    "desc" => "Trust is earned through openness. ALERT shares financial records, project reports, and governance decisions publicly — because the communities we work with deserve to know exactly how we operate.",
                    "icon" => "FaEye",
                    "accent" => "#3E8E0F",
                    "image" => ""
                ],
                [
                    "id" => "gender-justice",
                    "title" => "Gender Justice",
                    "quote" => "We believe and practice equality.",
                    "desc" => "Gender equality is non-negotiable. ALERT actively promotes women's leadership in Gram Sabhas, Matsya Mithra cooperatives, and all community institutions — ensuring women are decision-makers, not just participants.",
                    "icon" => "FaUsers",
                    "accent" => "#F5A000",
                    "image" => ""
                ],
                [
                    "id" => "professionalism",
                    "title" => "Professionalism",
                    "quote" => "We don't just do it but we prefer to do it in the best way possible.",
                    "desc" => "Excellence in execution is our standard. From legal documentation to field surveys, ALERT applies professional rigor, trained staff, and proven methodologies to every project we undertake.",
                    "icon" => "FaStar",
                    "accent" => "#003190",
                    "image" => ""
                ],
                [
                    "id" => "excellence",
                    "title" => "Excellence",
                    "quote" => "It is not by accident but the result of our high intention.",
                    "desc" => "Excellence is intentional. ALERT sets high standards for impact, quality, and sustainability — because marginalized communities deserve nothing less than our absolute best effort.",
                    "icon" => "FaAward",
                    "accent" => "#D2190C",
                    "image" => ""
                ],
                [
                    "id" => "empathy",
                    "title" => "Empathy",
                    "quote" => "We carry the message that 'you are not alone'.",
                    "desc" => "Behind every case file is a human being. ALERT approaches every Adivasi family, every displaced villager, and every woman cooperative member with compassion, listening first and acting with care.",
                    "icon" => "FaHeart",
                    "accent" => "#D2190C",
                    "image" => ""
                ]
            ],
            "manifesto_badge" => "Our Manifesto",
            "manifesto_title" => "Values in Action",
            "manifesto_desc" => "These seven values are not just words on a page — they are lived every day in the field. From the Gram Sabha meetings in agency mandals to the courtrooms defending forest rights, from the women's cooperative meetings to the disaster relief operations, ALERT's values shape every decision, every relationship, and every outcome.",
            "manifesto_tags" => ["Integrity", "Accountability", "Transparency", "Gender Justice", "Professionalism", "Excellence", "Empathy"]
        ]
    ],
    "organizational-profile" => [
        "slug" => "organizational-profile",
        "badge" => "Section 03",
        "title" => "Organizational Profile",
        "subtitle" => "Who we are, our statutory mandate, and the legal accreditations that underpin every ALERT intervention since 2004.",
        "content" => [
            "info_cards" => [
                [
                    "title" => "Organization Name",
                    "value" => "Association for Land and Livelihood, Environment, Research and Training (ALERT)",
                    "subtitle" => "Registered Non-Profit Society",
                    "icon" => "FaLandmark",
                    "color" => "#003190"
                ],
                [
                    "title" => "Established",
                    "value" => "2004",
                    "subtitle" => "Registration No. 307/2004",
                    "icon" => "FaCalendar",
                    "color" => "#D2190C"
                ],
                [
                    "title" => "Headquarters",
                    "value" => "Vijayawada, Andhra Pradesh, India",
                    "subtitle" => "Fifth Scheduled Areas Focus",
                    "icon" => "FaMapMarkerAlt",
                    "color" => "#3E8E0F"
                ],
                [
                    "title" => "Founder-Director",
                    "value" => "YL Jayaraj",
                    "subtitle" => "47+ Years of Grassroots Experience",
                    "icon" => "FaUsers",
                    "color" => "#F5A000"
                ]
            ],
            "about_badge" => "Who We Are",
            "about_heading" => "Association for Land and Livelihood, Environment, Research and Training",
            "about_p1" => "ALERT, established in 2004 under the Societies Registration Act, is headquartered in Vijayawada, Andhra Pradesh. Led by founder-director YL Jayaraj, who brings 47 years of experience in grass-roots human rights and community empowerment, ALERT specializes in supporting marginalized communities in the Fifth Scheduled Areas.",
            "about_p2" => "Our mandate encompasses affirmative legislation enforcement, the Forest Rights Act (RoFR 2006), the PESA Act 1996, Land Transfer Regulation 1 of 1970, and fair rehabilitation for communities displaced by mega irrigation projects like Polavaram.",
            "profile_pdf" => "/uploads/Organizational-Profile-of-ALERT.pdf",
            "field_image" => "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg",
            "field_tag" => "ALERT Field Operations",
            "field_caption" => "Empowering Adivasi Communities in Andhra Pradesh",
            "accreditations_badge" => "Statutory Mandate",
            "accreditations_title" => "Legal Accreditations & Governance",
            "accreditations_subtitle" => "ALERT is governed by formal statutes and holds key registrations that ensure transparency, accountability, and legal compliance in all our work.",
            "accreditations_cards" => [
                [
                    "title" => "12A Registration",
                    "desc" => "Income Tax registration for charitable activities under Section 12A.",
                    "icon" => "FaAward",
                    "color" => "#D2190C"
                ],
                [
                    "title" => "80G Certification",
                    "desc" => "Donors can claim tax deductions on contributions under Section 80G.",
                    "icon" => "FaStar",
                    "color" => "#F5A000"
                ],
                [
                    "title" => "FCRA Registered",
                    "desc" => "Authorized to receive foreign contributions for social development work.",
                    "icon" => "FaShieldAlt",
                    "color" => "#003190"
                ],
                [
                    "title" => "Reg. No. 307/2004",
                    "desc" => "Registered under the Societies Registration Act since 2004.",
                    "icon" => "FaCrown",
                    "color" => "#3E8E0F"
                ],
                [
                    "title" => "35 Institutional Policies",
                    "desc" => "Formalized charters ensuring democratic governance and transparency.",
                    "icon" => "FaUsers",
                    "color" => "#F5A000"
                ],
                [
                    "title" => "Headquarters: Vijayawada",
                    "desc" => "ALERT office serves as the nerve center for all field operations.",
                    "icon" => "FaLandmark",
                    "color" => "#003190"
                ]
            ],
            "reg_no" => "307/2004",
            "reg_date" => "Registered under Societies Registration Act XXI of 1860",
            "pan" => "AAATA4707G",
            "fcra_status" => "Registered with Ministry of Home Affairs, Govt of India",
            "tax_exempt" => "12A & 80G Approved under Indian Income Tax Act",
            "registered_office" => "D.No. 40-27-84, Sriramachandra Nagar, Vijayawada - 520010, Andhra Pradesh, India",
            "phone" => "+91 866 247 2484",
            "email" => "alertngo.vja@gmail.com",
            "overview_p1" => "ALERT (Academy of Local Electronics, Resource & Tribal Empowerment) is a non-governmental organization founded in 2004 to defend the constitutional entitlements of Adivasi and marginalized communities across Andhra Pradesh.",
            "overview_p2" => "Over two decades, ALERT has facilitated tens of thousands of forest land claims, provided critical legal defense against unlawful land acquisition in the Polavaram submergence basin, and championed women-led ecological cooperatives.",
            "mandate_points" => [
                "Enforcing statutory rights under the Forest Rights Act 2006 (RoFR).",
                "PESA 1996 Gram Sabha empowerment across Fifth-Scheduled mandals.",
                "Fair resettlement and rehabilitation under RFCTLARR Act 2013.",
                "Matsya Mithra coastal Yenadi tribal women fisheries federations."
            ]
        ]
    ],
    "organogram" => [
        "slug" => "organogram",
        "badge" => "Section 04",
        "title" => "Organogram",
        "subtitle" => "The democratic governance hierarchy of ALERT — from the sovereign General Body down to grassroots Gram Sabhas and field operational cells.",
        "content" => [
            "chart_image" => "/uploads/Alert-Organogram.jpg",
            "chart_badge" => "ALERT Governance Structure",
            "chart_desc" => "Click or zoom to view the full organizational chart showing reporting lines from General Body to field operational cells.",
            "levels_badge" => "Governance Levels",
            "levels_title" => "Five-Tier Governance Structure",
            "levels_subtitle" => "ALERT follows a democratic, bottom-up governance model where authority flows from the community level up to the General Body.",
            "levels" => [
                [
                    "level" => "Level 01",
                    "title" => "General Body",
                    "desc" => "The sovereign supreme authority of ALERT comprising all registered members and community delegates.",
                    "accent" => "#003190",
                    "icon" => "FaUsers"
                ],
                [
                    "level" => "Level 02",
                    "title" => "Governing Body",
                    "desc" => "Elected board of directors providing strategic oversight, legal compliance, and fiduciary governance.",
                    "accent" => "#D2190C",
                    "icon" => "FaShieldAlt"
                ],
                [
                    "level" => "Level 03",
                    "title" => "Executive Committee",
                    "desc" => "Chief functionary and operational directors managing day-to-day programs, field staff, and partnerships.",
                    "accent" => "#F5A000",
                    "icon" => "FaAward"
                ],
                [
                    "level" => "Level 04",
                    "title" => "Program Cells",
                    "desc" => "Specialized units: Forest Rights & RoFR, Polavaram R&R Legal Cell, Matsya Mithra Women Federation, Clean Energy & Relief.",
                    "accent" => "#3E8E0F",
                    "icon" => "FaLandmark"
                ],
                [
                    "level" => "Level 05",
                    "title" => "Gram Sabhas & Field Mobilizers",
                    "desc" => "Village-level community animators, forest rights verification committees, and primary habitations.",
                    "accent" => "#003190",
                    "icon" => "FaSitemap"
                ]
            ],
            "pdf_file" => "/uploads/Organizational-Profile-of-ALERT.pdf",
            "pdf_title" => "Organizational Profile of ALERT",
            "pdf_meta" => "Official Society Record • Governance Document",
            "pdf_btn_label" => "Download Governance Document PDF",
            "organogram_arch_badge" => "Organizational Architecture",
            "organogram_arch_sub" => "Democratic Governance Hierarchy",
            "organogram_heading" => "Interactive Institutional Organogram",
            "organogram_desc" => "Visualizing ALERT's transparent governance framework: from the sovereign General Body down to autonomous grassroots Gram Sabhas and field operational cells.",
            "organogram_wings" => [
                [
                    "id" => "legal_wing",
                    "title" => "Legal Cell & Constitutional Advocacy",
                    "subtitle" => "PESA, RoFR & LTR Legal Aid Unit",
                    "desc" => "Drafts High Court PILs, RTI representations, Forest Rights Act (RoFR 2006) community claims, and Land Transfer Regulation 1/70 land restitution suits.",
                    "color" => "#10b981",
                    "badge" => "Legal Cell",
                    "lead" => "Paralegal Team & Constitutional Scholars"
                ],
                [
                    "id" => "polavaram_wing",
                    "title" => "Polavaram LA & R&R Field Unit",
                    "subtitle" => "371 Submerged Villages Relief Command",
                    "desc" => "Monitors statutory rehabilitation under RFCTLARR Act 2013, conducts field surveys across Godavari gorge hamlets, and verifies land-for-land entitlements.",
                    "color" => "#f59e0b",
                    "badge" => "R&R Cell",
                    "lead" => "Field Surveyors & Community Organizers"
                ],
                [
                    "id" => "antyodaya_wing",
                    "title" => "Antyodaya Livelihoods & Women Cooperatives",
                    "subtitle" => "Nomadic Yenadi & Coastal Fisheries Directorate",
                    "desc" => "Manages the 3,500-member Matsya Mithra Women Fisheries Federation, nomadic tribal housing pattas, and solar micro-grid installations.",
                    "color" => "#0ea5e9",
                    "badge" => "Community Co-ops",
                    "lead" => "Cooperative Managers & Field Mobilizers"
                ],
                [
                    "id" => "finance_wing",
                    "title" => "Finance, Administration & Compliance",
                    "subtitle" => "Statutory Governance & 35 Policies Registry",
                    "desc" => "Oversees 12A, 80G, FCRA statutory compliance, quarterly double-entry audits, POSH Internal Complaints Committee, and procurement standards.",
                    "color" => "#8b5cf6",
                    "badge" => "Compliance Cell",
                    "lead" => "Chartered Accountants & Internal Auditors"
                ]
            ]
        ]
    ],
    "alert-policies" => [
        "slug" => "alert-policies",
        "badge" => "Section 05",
        "title" => "ALERT Policies",
        "subtitle" => "Institutional governing policies ensuring statutory transparency, child safeguarding, gender equality, and ethical rigor.",
        "content" => [
            "portal_badge" => "Interactive Compliance Portal",
            "portal_cert" => "Certified by ALERT Governing Body",
            "portal_title" => "The 35 Institutional Governance Policies",
            "portal_desc" => "ALERT operations are strictly governed by 35 formalized statutory charters ensuring democratic transparency, child protection, financial accountability, and indigenous community rights.",
            "portal_status_badge" => "100% Ratified & Audited",
            "portal_status_sub" => "Active Statutory Compliance",
            "portal_metrics" => [
                [
                    "label" => "Active Policies",
                    "val" => "35 / 35",
                    "color" => "#10b981"
                ],
                [
                    "label" => "POSH Compliant",
                    "val" => "100%",
                    "color" => "#D2190C"
                ],
                [
                    "label" => "Audited Charters",
                    "val" => "Certified",
                    "color" => "#8b5cf6"
                ],
                [
                    "label" => "Regulatory Status",
                    "val" => "12A • 80G • FCRA",
                    "color" => "#0ea5e9"
                ]
            ],
            "policies" => [
                [
                    "id" => 1,
                    "title" => "Common Cost Policy",
                    "category" => "Financial & Operational",
                    "statutoryBasis" => "Societies Registration Act 1860 & Multi-Donor Financial Accounting Standards",
                    "committee" => "Board Finance & Logistical Oversight Committee",
                    "scope" => "Standardized equitable cost-sharing framework for multi-donor logistics, vehicle fleet utilization, and central administrative expenses.",
                    "desc" => "Standardized equitable cost-sharing framework for multi-donor logistics, vehicle fleet utilization, and central administrative expenses.",
                    "principles" => [
                        "Activity-based proportional expense allocation across active grants",
                        "Quarterly reconciliation with third-party project audits",
                        "Strict ban on double-charging administrative overheads"
                    ],
                    "highlights" => [
                        "Activity-based cost allocation",
                        "Quarterly reconciliation",
                        "No double-charging overheads"
                    ],
                    "badge" => "Statutory",
                    "icon" => "FaBuilding",
                    "accent" => "#0ea5e9"
                ],
                [
                    "id" => 2,
                    "title" => "Finance Policy",
                    "category" => "Financial & Operational",
                    "statutoryBasis" => "Foreign Contribution Regulation Act (FCRA 2010) & Indian Income Tax Act Sec 12A/80G",
                    "committee" => "Statutory Financial Audit & Internal Control Cell",
                    "scope" => "Statutory fiscal compliance, double-entry ledger bookkeeping, dual-signatory bank controls, and FCRA expenditure regulations.",
                    "desc" => "Statutory fiscal compliance, double-entry ledger bookkeeping, dual-signatory bank controls, and FCRA expenditure regulations.",
                    "principles" => [
                        "Dual signatory authorization for transactions exceeding ₹25,000",
                        "Mandatory quarterly internal audit & annual statutory CA audit",
                        "100% digital electronic fund transfers (NEFT/RTGS/PFMS)"
                    ],
                    "highlights" => [
                        "Dual signatory authorization > ₹25,000",
                        "Quarterly internal & annual CA audits",
                        "100% digital electronic fund transfers"
                    ],
                    "badge" => "Statutory",
                    "icon" => "FaLock",
                    "accent" => "#10b981"
                ],
                [
                    "id" => 3,
                    "title" => "HIV/AIDS Workplace Policy",
                    "category" => "Protection & Rights",
                    "scope" => "Strict non-discrimination charter, medical confidentiality, health insurance access, and grassroots sensitization across tribal hamlets.",
                    "desc" => "Strict non-discrimination charter, medical confidentiality, health insurance access, and grassroots sensitization across tribal hamlets.",
                    "statutoryBasis" => "Human Immunodeficiency Virus and Acquired Immune Deficiency Syndrome (Prevention and Control) Act 2017",
                    "committee" => "Employee Health & Community Well-being Cell",
                    "principles" => [
                        "Zero tolerance for workplace discrimination or dismissal based on health status",
                        "Confidential medical counseling and anti-retroviral treatment assistance",
                        "Regular health & hygiene camps across remote Adivasi habitations"
                    ],
                    "highlights" => [
                        "Zero health discrimination",
                        "Confidential medical counseling",
                        "Regular health & hygiene camps"
                    ],
                    "badge" => "Human Rights",
                    "icon" => "FaHandHoldingHeart",
                    "accent" => "#ef4444"
                ],
                [
                    "id" => 4,
                    "title" => "Human Resource Policy",
                    "category" => "Governance & Ethics",
                    "scope" => "Merit-based recruitment, tribal youth employment affirmative action, transparent salary grids, and employee grievance pathways.",
                    "desc" => "Merit-based recruitment, tribal youth employment affirmative action, transparent salary grids, and employee grievance pathways.",
                    "statutoryBasis" => "Employees' Provident Funds & Miscellaneous Provisions Act 1952 & State Labor Codes",
                    "committee" => "Institutional Human Resources & Grievance Council",
                    "principles" => [
                        "Affirmative recruitment quota prioritizing local indigenous tribal youth",
                        "Transparent annual performance evaluations and skill-upgrade sabbaticals",
                        "Equitable health, maternity, and emergency compassionate leave entitlements"
                    ],
                    "highlights" => [
                        "Affirmative tribal youth quota",
                        "Transparent salary grids",
                        "Equitable leave entitlements"
                    ],
                    "badge" => "Institutional",
                    "icon" => "FaShieldAlt",
                    "accent" => "#6366f1"
                ],
                [
                    "id" => 5,
                    "title" => "Procurement Policy",
                    "category" => "Financial & Operational",
                    "scope" => "Three-quotation competitive tender threshold, vendor vetting, anti-collusion bidding protocols, and physical asset tagging.",
                    "desc" => "Three-quotation competitive tender threshold, vendor vetting, anti-collusion bidding protocols, and physical asset tagging.",
                    "statutoryBasis" => "General Financial Rules (GFR) & Donor Compliance Guidelines",
                    "committee" => "Central Procurement & Purchase Committee",
                    "principles" => [
                        "Minimum 3 sealed competitive quotations for all asset purchases > ₹10,000",
                        "Mandatory non-relationship affidavit from prospective vendors",
                        "Annual physical inventory verification and asset barcode tagging"
                    ],
                    "highlights" => [
                        "3 competitive sealed quotations",
                        "Vendor anti-collusion vetting",
                        "Annual inventory barcode tagging"
                    ],
                    "badge" => "Statutory",
                    "icon" => "FaBuilding",
                    "accent" => "#f59e0b"
                ],
                [
                    "id" => 6,
                    "title" => "ALERT Gender Policy",
                    "category" => "Protection & Rights",
                    "scope" => "50% representation of women in grassroots decision-making, equal remuneration for equal work, and zero toleration of gender disparity.",
                    "desc" => "50% representation of women in grassroots decision-making, equal remuneration for equal work, and zero toleration of gender disparity.",
                    "statutoryBasis" => "Equal Remuneration Act 1976 & CEDAW International Protocols",
                    "committee" => "Gender Equality & Women Empowerment Council",
                    "principles" => [
                        "Minimum 50% women representation across all Gram Sabha executive committees",
                        "Zero gender wage gap across field coordinators and administrative staff",
                        "Priority leadership grooming for Yenadi & Koya indigenous women"
                    ],
                    "highlights" => [
                        "50% women in Gram Sabhas",
                        "Zero gender wage disparity",
                        "Indigenous women leadership grooming"
                    ],
                    "badge" => "Human Rights",
                    "icon" => "FaHandHoldingHeart",
                    "accent" => "#ec4899"
                ],
                [
                    "id" => 7,
                    "title" => "ALERT Conflict of Interest Policy",
                    "category" => "Governance & Ethics",
                    "scope" => "Mandatory annual disclosures of personal, commercial, or family ties for Governing Body members and senior programmatic staff.",
                    "desc" => "Mandatory annual disclosures of personal, commercial, or family ties for Governing Body members and senior programmatic staff.",
                    "statutoryBasis" => "Societies Registration Act 1860 & Institutional Ethics Standards",
                    "committee" => "Independent Ethics & Disclosures Tribunal",
                    "principles" => [
                        "Annual written declaration of financial or familial interests",
                        "Automatic recusal from voting on contracts involving affiliated entities",
                        "Immediate disciplinary dismissal for undisclosed pecuniary gains"
                    ],
                    "highlights" => [
                        "Mandatory annual written disclosure",
                        "Automatic contract voting recusal",
                        "Zero tolerance for undisclosed gain"
                    ],
                    "badge" => "Integrity",
                    "icon" => "FaBalanceScale",
                    "accent" => "#8b5cf6"
                ],
                [
                    "id" => 8,
                    "title" => "Children Joyful Learning Policy",
                    "category" => "Protection & Rights",
                    "scope" => "Mother-tongue pedagogy (Koya/Telugu), cultural tribal folk curricula, zero corporal punishment, and inclusive village learning centers.",
                    "desc" => "Mother-tongue pedagogy (Koya/Telugu), cultural tribal folk curricula, zero corporal punishment, and inclusive village learning centers.",
                    "statutoryBasis" => "Right to Education Act (RTE 2009) & National Early Childhood Care Framework",
                    "committee" => "Tribal Education & Child Development Directorate",
                    "principles" => [
                        "Mother-tongue primary instruction in Koya and local tribal dialects",
                        "Strict ban on psychological pressure, humiliation, or physical corporal punishment",
                        "Community Gram Sabha oversight of village joyful learning centers"
                    ],
                    "highlights" => [
                        "Koya & Telugu mother-tongue pedagogy",
                        "Zero corporal punishment",
                        "Gram Sabha education oversight"
                    ],
                    "badge" => "Child Rights",
                    "icon" => "FaHandHoldingHeart",
                    "accent" => "#10b981"
                ],
                [
                    "id" => 9,
                    "title" => "Sexual Harassment Policy (POSH)",
                    "category" => "Protection & Rights",
                    "scope" => "Full statutory compliance under the POSH Act 2013 with an active, autonomous Internal Complaints Committee (ICC) chaired by senior women leaders.",
                    "desc" => "Full statutory compliance under the POSH Act 2013 with an active, autonomous Internal Complaints Committee (ICC) chaired by senior women leaders.",
                    "statutoryBasis" => "Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act 2013",
                    "committee" => "Autonomous Internal Complaints Committee (ICC)",
                    "principles" => [
                        "Independent ICC chaired by senior external woman jurist / social activist",
                        "Confidential 90-day time-bound formal inquiry and protection from retaliation",
                        "Mandatory annual POSH sensitization workshops for all field staff"
                    ],
                    "highlights" => [
                        "Autonomous ICC chaired by woman jurist",
                        "Strict 90-day time-bound inquiry",
                        "Mandatory annual POSH workshops"
                    ],
                    "badge" => "Mandatory",
                    "icon" => "FaShieldAlt",
                    "accent" => "#D2190C"
                ],
                [
                    "id" => 10,
                    "title" => "Environmental Policy",
                    "category" => "Community & Field",
                    "scope" => "Zero ecological footprint in forest sanctuaries, protection of sacred tribal groves (Punya Vanalu), and coastal mangrove regeneration.",
                    "desc" => "Zero ecological footprint in forest sanctuaries, protection of sacred tribal groves (Punya Vanalu), and coastal mangrove regeneration.",
                    "statutoryBasis" => "Biological Diversity Act 2002 & Forest Conservation Rules",
                    "committee" => "Ecological Conservation & Biodiversity Unit",
                    "principles" => [
                        "Zero plastic tolerance in all ALERT agency field offices and tribal events",
                        "Strict preservation of indigenous sacred groves and rare medicinal herbs",
                        "Community-led mangrove regeneration along the Krishna estuary"
                    ],
                    "highlights" => [
                        "Zero plastic in forest hamlets",
                        "Sacred groves preservation",
                        "Mangrove estuarine restoration"
                    ],
                    "badge" => "Ecological",
                    "icon" => "FaFolderOpen",
                    "accent" => "#15803d"
                ],
                [
                    "id" => 11,
                    "title" => "Health and Safety Policy",
                    "category" => "Community & Field",
                    "scope" => "Mandatory life jackets during Godavari river flood rescue, emergency medical supplies, and anti-venom protocols for agency fieldworkers.",
                    "desc" => "Mandatory life jackets during Godavari river flood rescue, emergency medical supplies, and anti-venom protocols for agency fieldworkers.",
                    "statutoryBasis" => "Disaster Management Act 2005 & Occupational Safety Norms",
                    "committee" => "Disaster Response & Safety Taskforce",
                    "principles" => [
                        "Certified life jackets and GPS satellite beacons for monsoon river travel",
                        "Stocked first-aid kits and anti-snake venom vials at all agency field camps",
                        "Comprehensive accidental health insurance for all frontline mobilizers"
                    ],
                    "highlights" => [
                        "Certified life jackets & GPS beacons",
                        "Anti-venom stocked in agency camps",
                        "Field staff accident insurance"
                    ],
                    "badge" => "Field Safety",
                    "icon" => "FaShieldAlt",
                    "accent" => "#0284c7"
                ],
                [
                    "id" => 12,
                    "title" => "Code of Ethics and Conduct Policy",
                    "category" => "Governance & Ethics",
                    "scope" => "Highest standards of personal integrity, honesty, respect for indigenous tribal elders, and dedication to grassroots social justice.",
                    "desc" => "Highest standards of personal integrity, honesty, respect for indigenous tribal elders, and dedication to grassroots social justice.",
                    "statutoryBasis" => "ALERT Constitutional Bylaws & NGO Code of Public Ethics",
                    "committee" => "Board Ethics & Governance Bench",
                    "principles" => [
                        "Unwavering reverence for Adivasi customs, democratic Gram Sabhas, and tribal lore",
                        "Zero tolerance for harassment, discrimination, intoxication, or malfeasance",
                        "Full transparency in handling community grievances and public petitions"
                    ],
                    "highlights" => [
                        "Reverence for Adivasi customs",
                        "Zero harassment tolerance",
                        "Transparent grievance redressal"
                    ],
                    "badge" => "Integrity",
                    "icon" => "FaBalanceScale",
                    "accent" => "#4f46e5"
                ],
                [
                    "id" => 13,
                    "title" => "Data Protection and Privacy Policy",
                    "category" => "Governance & Ethics",
                    "scope" => "Secure encryption and anonymization of indigenous household land records, biometric voter surveys, and legal claimant case notes.",
                    "desc" => "Secure encryption and anonymization of indigenous household land records, biometric voter surveys, and legal claimant case notes.",
                    "statutoryBasis" => "Digital Personal Data Protection Act 2023 & Indian IT Act 2000",
                    "committee" => "Informatics & Data Governance Cell",
                    "principles" => [
                        "End-to-end encrypted storage of land claim genealogies and GPS boundary points",
                        "Informed community consent prior to recording any household demographic data",
                        "Strict prohibition on selling or sharing beneficiary databases with commercial entities"
                    ],
                    "highlights" => [
                        "Encrypted land claim coordinates",
                        "Informed prior household consent",
                        "Ban on commercial data sharing"
                    ],
                    "badge" => "Security",
                    "icon" => "FaLock",
                    "accent" => "#334155"
                ],
                [
                    "id" => 14,
                    "title" => "Social Inclusion Policy",
                    "category" => "Protection & Rights",
                    "scope" => "Special programmatic priority for Particularly Vulnerable Tribal Groups (PVTGs), nomadic Yenadi families, and disabled rural citizens.",
                    "desc" => "Special programmatic priority for Particularly Vulnerable Tribal Groups (PVTGs), nomadic Yenadi families, and disabled rural citizens.",
                    "statutoryBasis" => "Article 46 & Fifth Schedule of the Constitution of India",
                    "committee" => "Affirmative Action & Social Inclusion Council",
                    "principles" => [
                        "Direct prioritization of Konda Reddi PVTGs and nomadic Yenadi forest dwellers",
                        "100% saturation of social security pensions and ration cards for marginalized elders",
                        "Democratic inclusion of nomadic women in coastal fisheries federations"
                    ],
                    "highlights" => [
                        "Konda Reddi PVTG prioritization",
                        "100% pension & ration card saturation",
                        "Nomadic women inclusion"
                    ],
                    "badge" => "Inclusion",
                    "icon" => "FaHandHoldingHeart",
                    "accent" => "#d97706"
                ],
                [
                    "id" => 15,
                    "title" => "Do No Harm Policy",
                    "category" => "Governance & Ethics",
                    "scope" => "Conflict-sensitive community interaction avoiding local political polarization, cultural disruption, or long-term institutional dependency.",
                    "desc" => "Conflict-sensitive community interaction avoiding local political polarization, cultural disruption, or long-term institutional dependency.",
                    "statutoryBasis" => "International Humanitarian Standards & Core Humanitarian Standard (CHS)",
                    "committee" => "Community Safeguards & Conflict Assessment Unit",
                    "principles" => [
                        "Comprehensive socio-cultural risk assessment prior to launching any field project",
                        "Non-partisan engagement with local political factions and panchayat bodies",
                        "Sustainable capacity transfer ensuring Gram Sabhas become fully self-reliant"
                    ],
                    "highlights" => [
                        "Socio-cultural risk assessments",
                        "Strict political non-partisanship",
                        "Long-term Gram Sabha self-reliance"
                    ],
                    "badge" => "Principle",
                    "icon" => "FaShieldAlt",
                    "accent" => "#64748b"
                ],
                [
                    "id" => 16,
                    "title" => "Anti-Corruption & Anti-Bribery Policy",
                    "category" => "Governance & Ethics",
                    "scope" => "Absolute prohibition on bribes, kickbacks, or gifts to public authorities during land patta processing, RTI follow-ups, or legal representation.",
                    "desc" => "Absolute prohibition on bribes, kickbacks, or gifts to public authorities during land patta processing, RTI follow-ups, or legal representation.",
                    "statutoryBasis" => "Prevention of Corruption Act 1988 & UN Convention against Corruption",
                    "committee" => "Vigilance & Anti-Corruption Bureau",
                    "principles" => [
                        "Zero tolerance for facilitating payments, kickbacks, or bureaucratic bribes",
                        "Immediate reporting of public extortion attempts to State Vigilance Commission",
                        "Strict gift policy: Staff prohibited from accepting personal commercial gifts"
                    ],
                    "highlights" => [
                        "Zero tolerance for bribe facilitation",
                        "Vigilance Commission reporting",
                        "Strict commercial gift ban"
                    ],
                    "badge" => "Zero Tolerance",
                    "icon" => "FaBalanceScale",
                    "accent" => "#b91c1c"
                ],
                [
                    "id" => 17,
                    "title" => "Child Protection & Safeguarding Policy",
                    "category" => "Protection & Rights",
                    "scope" => "Rigorous background checks for staff, strict ban on child labor, abuse reporting hotline, and informed parental consent for media/photos.",
                    "desc" => "Rigorous background checks for staff, strict ban on child labor, abuse reporting hotline, and informed parental consent for media/photos.",
                    "statutoryBasis" => "Protection of Children from Sexual Offences (POCSO Act 2012) & JJ Act",
                    "committee" => "Autonomous Child Protection Cell",
                    "principles" => [
                        "Mandatory police verification and child protection signing for all staff/volunteers",
                        "Strict ban on individual unmonitored visits with children in remote hamlets",
                        "Explicit parental written consent required before capturing photographs or media"
                    ],
                    "highlights" => [
                        "Mandatory police background checks",
                        "Zero unmonitored visits with minors",
                        "Parental media photo consent"
                    ],
                    "badge" => "Child Rights",
                    "icon" => "FaHandHoldingHeart",
                    "accent" => "#e11d48"
                ],
                [
                    "id" => 18,
                    "title" => "Whistleblower Protection Policy",
                    "category" => "Governance & Ethics",
                    "scope" => "Direct, confidential escalation channel to the Board President with complete statutory protection from retaliation or termination.",
                    "desc" => "Direct, confidential escalation channel to the Board President with complete statutory protection from retaliation or termination.",
                    "statutoryBasis" => "Whistle Blowers Protection Act 2014 & Corporate Governance Norms",
                    "committee" => "Independent Whistleblower Review Board",
                    "principles" => [
                        "Encrypted anonymous email & postal reporting box directly to the President",
                        "Guaranteed protection from retaliatory transfers, harassment, or dismissal",
                        "Mandatory investigation completed within 30 days of formal report"
                    ],
                    "highlights" => [
                        "Direct encrypted President channel",
                        "Total protection from retaliation",
                        "30-day investigation completion"
                    ],
                    "badge" => "Whistleblower",
                    "icon" => "FaShieldAlt",
                    "accent" => "#7c3aed"
                ],
                [
                    "id" => 19,
                    "title" => "Risk Management Framework",
                    "category" => "Financial & Operational",
                    "scope" => "Comprehensive risk registers evaluating legal challenges, monsoon river flooding contingencies, and regulatory compliance changes.",
                    "desc" => "Comprehensive risk registers evaluating legal challenges, monsoon river flooding contingencies, and regulatory compliance changes.",
                    "statutoryBasis" => "Enterprise Risk Management (ERM) Framework & Disaster Guidelines",
                    "committee" => "Risk Assessment & Audit Steering Group",
                    "principles" => [
                        "Biannual review of the Institutional Risk Matrix by the Governing Body",
                        "Contingency reserves for sudden natural flood emergencies in Godavari basin",
                        "Immediate legal response protocol for unlawful arrests or FIRs against community leaders"
                    ],
                    "highlights" => [
                        "Biannual institutional risk review",
                        "Basin flood contingency reserves",
                        "Community legal defense protocol"
                    ],
                    "badge" => "Operational",
                    "icon" => "FaLock",
                    "accent" => "#d97706"
                ],
                [
                    "id" => 20,
                    "title" => "Livelihood Cooperative Governance Policy",
                    "category" => "Community & Field",
                    "scope" => "Democratic rules for Matsya Mithra Women Fisheries collectives and NTFP cooperative societies ensuring 100% member dividend return.",
                    "desc" => "Democratic rules for Matsya Mithra Women Fisheries collectives and NTFP cooperative societies ensuring 100% member dividend return.",
                    "statutoryBasis" => "Andhra Pradesh Mutually Aided Cooperative Societies (MACS) Act 1995",
                    "committee" => "Cooperative Enterprise Development Directorate",
                    "principles" => [
                        "100% member ownership with one-member-one-vote cooperative democracy",
                        "Transparent annual dividend distribution directly into tribal women's bank accounts",
                        "Revolving micro-credit fund capped at statutory non-usurious interest rates"
                    ],
                    "highlights" => [
                        "100% tribal member ownership",
                        "Direct bank dividend distribution",
                        "Non-usurious micro-credit cap"
                    ],
                    "badge" => "Cooperative",
                    "icon" => "FaBuilding",
                    "accent" => "#059669"
                ],
                [
                    "id" => 21,
                    "title" => "Disability Rights & Universal Accessibility",
                    "category" => "Protection & Rights",
                    "scope" => "Physical ramp accessibility, assistive hearing/mobility aid distribution, and affirmative employment quotas for persons with disabilities.",
                    "desc" => "Physical ramp accessibility, assistive hearing/mobility aid distribution, and affirmative employment quotas for persons with disabilities.",
                    "statutoryBasis" => "Rights of Persons with Disabilities (RPwD) Act 2016",
                    "committee" => "Disability Inclusion & Equal Opportunities Wing",
                    "principles" => [
                        "Universal design ramps and accessible facilities across all ALERT centers",
                        "Active identification and pension saturation for disabled indigenous citizens",
                        "Specialized legal counseling for land entitlement protection of disabled persons"
                    ],
                    "highlights" => [
                        "Universal barrier-free ramps",
                        "Assistive device distribution",
                        "Disability land rights defense"
                    ],
                    "badge" => "Inclusion",
                    "icon" => "FaHandHoldingHeart",
                    "accent" => "#0284c7"
                ],
                [
                    "id" => 22,
                    "title" => "Forest Rights Advocacy Ethics Policy",
                    "category" => "Community & Field",
                    "scope" => "Uncompromising loyalty to Gram Sabha decisions under RoFR 2006, free legal counseling, and refusal of commercial compensation cuts.",
                    "desc" => "Uncompromising loyalty to Gram Sabha decisions under RoFR 2006, free legal counseling, and refusal of commercial compensation cuts.",
                    "statutoryBasis" => "Scheduled Tribes and Other Traditional Forest Dwellers (FRA 2006)",
                    "committee" => "Forest Rights Legal Cell & Paralegal Directorate",
                    "principles" => [
                        "Complete refusal of any contingency fee or cut from land compensation awards",
                        "Exclusively pro-bono paralegal and high court legal representation for Gram Sabhas",
                        "Respect for traditional village boundary demarcation using participatory GPS mapping"
                    ],
                    "highlights" => [
                        "Zero compensation contingency cuts",
                        "100% pro-bono litigation",
                        "Participatory GPS village mapping"
                    ],
                    "badge" => "Legal Aid",
                    "icon" => "FaBalanceScale",
                    "accent" => "#16a34a"
                ],
                [
                    "id" => 23,
                    "title" => "Polavaram Displacement Assistance Protocol",
                    "category" => "Community & Field",
                    "scope" => "Statutory monitoring of RFCTLARR Act 2013 entitlements: house-for-house, land-for-land, and one-time rehabilitation grant compliance.",
                    "desc" => "Statutory monitoring of RFCTLARR Act 2013 entitlements: house-for-house, land-for-land, and one-time rehabilitation grant compliance.",
                    "statutoryBasis" => "Right to Fair Compensation and Transparency in Land Acquisition (RFCTLARR 2013)",
                    "committee" => "Polavaram Rehabilitation Monitoring Council",
                    "principles" => [
                        "Independent social audit of 371 submerged villages against official R&R packages",
                        "Enforcing the mandatory land-for-land compensation clause for displaced tribals",
                        "Monitoring construction quality and civil amenities at resettlement colonies"
                    ],
                    "highlights" => [
                        "Independent 371 villages audit",
                        "Land-for-land statutory clause",
                        "Resettlement colony quality checks"
                    ],
                    "badge" => "Statutory",
                    "icon" => "FaShieldAlt",
                    "accent" => "#ea580c"
                ],
                [
                    "id" => 24,
                    "title" => "Field Disaster Response Protocol",
                    "category" => "Community & Field",
                    "scope" => "Standard Operating Procedures for annual Godavari flood rescue, supply drops, boat logistics, and rapid health emergency response.",
                    "desc" => "Standard Operating Procedures for annual Godavari flood rescue, supply drops, boat logistics, and rapid health emergency response.",
                    "statutoryBasis" => "National Disaster Management Authority (NDMA) Guidelines",
                    "committee" => "Emergency Flood Relief Operational Cell",
                    "principles" => [
                        "Rapid deployment within 6 hours of flood warning across Godavari Agency tracts",
                        "Pre-positioned motorboats and dry food rations in flood-prone cut-off hamlets",
                        "Transparent beneficiary manifests verified and signed by local Gram Sabhas"
                    ],
                    "highlights" => [
                        "6-hour rapid response protocol",
                        "Pre-positioned boat logistics",
                        "Gram Sabha verified manifests"
                    ],
                    "badge" => "Emergency",
                    "icon" => "FaFolderOpen",
                    "accent" => "#dc2626"
                ],
                [
                    "id" => 25,
                    "title" => "Legal Aid & RTI Proactive Disclosure",
                    "category" => "Community & Field",
                    "scope" => "Drafting pro-bono High Court and Supreme Court writ petitions, public information requests under RTI Act 2005, and legal literacy camps.",
                    "desc" => "Drafting pro-bono High Court and Supreme Court writ petitions, public information requests under RTI Act 2005, and legal literacy camps.",
                    "statutoryBasis" => "Right to Information Act 2005 & Legal Services Authorities Act 1987",
                    "committee" => "Public Interest Litigation & RTI Cell",
                    "principles" => [
                        "Free drafting of RTI applications and first/second appeals for illiterate tribals",
                        "Proactive public dissemination of government circulars on tribal entitlements",
                        "Paralegal training for tribal youth to independently file village claims"
                    ],
                    "highlights" => [
                        "Pro-bono High Court PILs",
                        "Free RTI drafting & appeals",
                        "Youth paralegal literacy camps"
                    ],
                    "badge" => "Justice",
                    "icon" => "FaBalanceScale",
                    "accent" => "#2563eb"
                ],
                [
                    "id" => 26,
                    "title" => "Board & Executive Succession Policy",
                    "category" => "Governance & Ethics",
                    "scope" => "Democratic 3-year board election cycles, term limits, leadership grooming pipeline, and grass-roots tribal leader induction.",
                    "desc" => "Democratic 3-year board election cycles, term limits, leadership grooming pipeline, and grass-roots tribal leader induction.",
                    "statutoryBasis" => "ALERT Registered Constitution & Society Rules",
                    "committee" => "Nomination & Board Governance Council",
                    "principles" => [
                        "Democratic 3-year election cycles with secret ballot if contested",
                        "Mandatory representation of indigenous women on the Governing Body",
                        "Continuous youth leadership mentorship to ensure generational continuity"
                    ],
                    "highlights" => [
                        "3-year democratic elections",
                        "Mandatory women board members",
                        "Grassroots youth succession pipeline"
                    ],
                    "badge" => "Democracy",
                    "icon" => "FaBuilding",
                    "accent" => "#475569"
                ],
                [
                    "id" => 27,
                    "title" => "Donor Accountability & Transparency Charter",
                    "category" => "Financial & Operational",
                    "scope" => "Unrestricted access to project accounts, milestone audits by independent chartered accountants, and public annual expenditure disclosures.",
                    "desc" => "Unrestricted access to project accounts, milestone audits by independent chartered accountants, and public annual expenditure disclosures.",
                    "statutoryBasis" => "Credibility Alliance Minimum Norms & FCRA Statutory Standards",
                    "committee" => "Audit & Donor Accountability Bench",
                    "principles" => [
                        "Public publishing of audited balance sheets, utilization certificates, and FCRA filings",
                        "Open-door policy for institutional donors conducting field verification visits",
                        "Zero diversion of dedicated project funds to unauthorized overheads"
                    ],
                    "highlights" => [
                        "Public annual balance sheets",
                        "Zero project fund diversion",
                        "Open-door field audit policy"
                    ],
                    "badge" => "Transparency",
                    "icon" => "FaLock",
                    "accent" => "#0891b2"
                ],
                [
                    "id" => 28,
                    "title" => "Volunteer & Intern Professional Code",
                    "category" => "Governance & Ethics",
                    "scope" => "Cultural sensitivity guidelines for university researchers and volunteers working inside Fifth Scheduled Adivasi habitations.",
                    "desc" => "Cultural sensitivity guidelines for university researchers and volunteers working inside Fifth Scheduled Adivasi habitations.",
                    "statutoryBasis" => "ALERT Field Research Ethics Guidelines",
                    "committee" => "Volunteer Coordination & Cultural Ethics Unit",
                    "principles" => [
                        "Mandatory cultural orientation before entering sensitive tribal agency areas",
                        "Strict ban on commercializing indigenous photographs or traditional knowledge",
                        "Mandatory debriefing and sharing of research findings with the community Gram Sabha"
                    ],
                    "highlights" => [
                        "Mandatory cultural orientation",
                        "Ban on commercial photo exploitation",
                        "Research sharing with Gram Sabha"
                    ],
                    "badge" => "Field Conduct",
                    "icon" => "FaShieldAlt",
                    "accent" => "#6b7280"
                ],
                [
                    "id" => 29,
                    "title" => "Coastal Marine & Mangrove Stewardship",
                    "category" => "Community & Field",
                    "scope" => "Banning destructive fine-mesh estuarine trawling, safeguarding fish breeding zones, and planting mangrove tidal barriers.",
                    "desc" => "Banning destructive fine-mesh estuarine trawling, safeguarding fish breeding zones, and planting mangrove tidal barriers.",
                    "statutoryBasis" => "Coastal Regulation Zone (CRZ) Notification & Wildlife Protection Act",
                    "committee" => "Marine Ecosystem & Coastal Livelihoods Wing",
                    "principles" => [
                        "Community ban on juvenile crab and shrimp seed poaching in mangrove roots",
                        "Planting 50,000+ Rhizophora mangrove seedlings along tidal estuaries annually",
                        "Artisanal fisherwomen empowerment through non-destructive sustainable gear"
                    ],
                    "highlights" => [
                        "Estuarine fish breeding protection",
                        "50,000 mangrove seedlings/year",
                        "Sustainable artisanal gear"
                    ],
                    "badge" => "Ecology",
                    "icon" => "FaFolderOpen",
                    "accent" => "#0d9488"
                ],
                [
                    "id" => 30,
                    "title" => "Indigenous Knowledge & Heritage Protocol",
                    "category" => "Community & Field",
                    "scope" => "Protecting tribal traditional medicinal herb knowledge and oral folklore against unauthorized commercial biopiracy.",
                    "desc" => "Protecting tribal traditional medicinal herb knowledge and oral folklore against unauthorized commercial biopiracy.",
                    "statutoryBasis" => "Biological Diversity Act 2002 & Traditional Knowledge Digital Library (TKDL)",
                    "committee" => "Indigenous Heritage & Ethnobotany Cell",
                    "principles" => [
                        "Documentation of herbal medicine exclusively with prior informed Gram Sabha consent",
                        "Zero transfer of indigenous botanical recipes to commercial pharmaceutical firms",
                        "Community ownership of traditional folklore, songs, and cultural biodiversity"
                    ],
                    "highlights" => [
                        "Prior informed Gram Sabha consent",
                        "Strict ban on commercial biopiracy",
                        "Community folklore ownership"
                    ],
                    "badge" => "Heritage",
                    "icon" => "FaHandHoldingHeart",
                    "accent" => "#ca8a04"
                ],
                [
                    "id" => 31,
                    "title" => "Information Disclosure Charter",
                    "category" => "Financial & Operational",
                    "scope" => "Mandatory public hosting of ALERT Society Registration, 12A, 80G, FCRA certificates, and annual audited balances on the web portal.",
                    "desc" => "Mandatory public hosting of ALERT Society Registration, 12A, 80G, FCRA certificates, and annual audited balances on the web portal.",
                    "statutoryBasis" => "Voluntary Guidelines on Transparency & Public Record Act",
                    "committee" => "Public Information Disclosure Desk",
                    "principles" => [
                        "All statutory registration certificates freely downloadable by the general public",
                        "Annual audited reports archived and publicly accessible for 20 continuous years",
                        "Transparent disclosure of board member identities, tenures, and affiliations"
                    ],
                    "highlights" => [
                        "12A, 80G & FCRA public certificates",
                        "20-year audited report archive",
                        "Transparent board disclosure"
                    ],
                    "badge" => "Public Record",
                    "icon" => "FaLock",
                    "accent" => "#0284c7"
                ],
                [
                    "id" => 32,
                    "title" => "Grievance Redressal Mechanism Policy",
                    "category" => "Governance & Ethics",
                    "scope" => "Guaranteed 15-day resolution pathway for community complaints, village petitions, worker grievances, and institutional feedback.",
                    "desc" => "Guaranteed 15-day resolution pathway for community complaints, village petitions, worker grievances, and institutional feedback.",
                    "statutoryBasis" => "Public Grievance Redressal Standards & CHS Alliance Norms",
                    "committee" => "Ombudsperson & Grievance Redressal Committee",
                    "principles" => [
                        "Time-bound 15-day mandatory written resolution for all lodged grievances",
                        "Confidential toll-free helpline and physical drop-boxes at agency field camps",
                        "Right of direct appeal to the Board President if resolution is unsatisfactory"
                    ],
                    "highlights" => [
                        "15-day guaranteed written resolution",
                        "Toll-free hotline & agency dropboxes",
                        "Direct Board President appeal"
                    ],
                    "badge" => "Accountability",
                    "icon" => "FaBalanceScale",
                    "accent" => "#4338ca"
                ],
                [
                    "id" => 33,
                    "title" => "Travel, Logistics & Field Per Diem Policy",
                    "category" => "Financial & Operational",
                    "scope" => "Standardized rural travel mileage reimbursements, hazardous country-boat crossing allowances, and transparent receipt settlement.",
                    "desc" => "Standardized rural travel mileage reimbursements, hazardous country-boat crossing allowances, and transparent receipt settlement.",
                    "statutoryBasis" => "ALERT Operational Financial Manual",
                    "committee" => "Administrative & Field Logistics Desk",
                    "principles" => [
                        "Standard mileage per diem based on prevailing state transport rates",
                        "Special hazard allowance for difficult monsoon boat journeys across flooded rivers",
                        "Zero cash disbursements without digital or physical verified vouchers"
                    ],
                    "highlights" => [
                        "Standard state mileage rates",
                        "Monsoon boat hazard allowance",
                        "Verified voucher settlement"
                    ],
                    "badge" => "Operational",
                    "icon" => "FaBuilding",
                    "accent" => "#0369a1"
                ],
                [
                    "id" => 34,
                    "title" => "Asset & Depreciation Control Policy",
                    "category" => "Financial & Operational",
                    "scope" => "Physical inventory barcode verification, annual depreciation calculations, and environmentally safe e-waste disposal protocols.",
                    "desc" => "Physical inventory barcode verification, annual depreciation calculations, and environmentally safe e-waste disposal protocols.",
                    "statutoryBasis" => "Accounting Standard (AS) 10 on Property, Plant and Equipment",
                    "committee" => "Asset Management & Verification Board",
                    "principles" => [
                        "Unique identification barcode on all computers, vehicles, and office assets",
                        "Standard straight-line depreciation calculated annually by statutory auditors",
                        "Safe, environmentally certified e-waste recycling of obsolete hardware"
                    ],
                    "highlights" => [
                        "Barcode tagging on all fixed assets",
                        "Statutory annual depreciation",
                        "Certified eco-friendly e-waste disposal"
                    ],
                    "badge" => "Asset Control",
                    "icon" => "FaBuilding",
                    "accent" => "#374151"
                ],
                [
                    "id" => 35,
                    "title" => "Monitoring, Evaluation & Learning (MEL)",
                    "category" => "Financial & Operational",
                    "scope" => "Quantitative and qualitative outcome harvesting, longitudinal beneficiary surveys, and peer-reviewed programmatic impact assessments.",
                    "desc" => "Quantitative and qualitative outcome harvesting, longitudinal beneficiary surveys, and peer-reviewed programmatic impact assessments.",
                    "statutoryBasis" => "Results-Based Management (RBM) & Logical Framework Analysis (LFA)",
                    "committee" => "Monitoring, Evaluation & Impact Research Cell",
                    "principles" => [
                        "Longitudinal impact surveys measuring tribal household income and land security",
                        "Quarterly milestone tracking against board-approved multi-year strategic plans",
                        "Participatory rural appraisal (PRA) with Gram Sabhas to validate project outcomes"
                    ],
                    "highlights" => [
                        "Longitudinal income & land surveys",
                        "Quarterly board milestone reviews",
                        "Participatory Gram Sabha appraisal"
                    ],
                    "badge" => "MEL Framework",
                    "icon" => "FaLock",
                    "accent" => "#047857"
                ]
            ],
            "commitment_badge" => "Our Commitment",
            "commitment_title" => "Principles in Practice",
            "commitment_desc" => "ALERT's policies are not just documents — they are lived every day in the field. From Gram Sabha meetings to courtroom advocacy, from women's cooperative governance to disaster relief operations, these principles shape every decision, relationship, and outcome.",
            "commitment_tags" => ["Integrity", "Accountability", "Transparency", "Gender Justice", "Professionalism", "Excellence", "Empathy"],
            "pdf_file" => "/uploads/Organizational-Profile-of-ALERT.pdf",
            "pdf_title" => "Organizational Profile & Policies",
            "pdf_meta" => "Official Society Record • Governance & Policy Document",
            "pdf_btn_label" => "Download Policy Document PDF"
        ]
    ],
    "area-of-operation" => [
        "slug" => "area-of-operation",
        "badge" => "Section 06",
        "title" => "Area of Operation",
        "subtitle" => "All 17 mandal stations and 4 operational jurisdictions across the Fifth-Scheduled Agency Belt and Coastal Krishna Belt of Andhra Pradesh.",
        "content" => [
            "mandals_count" => "17 Mandals",
            "habitations_count" => "371+ Habitations",
            "regions_count" => "4 Operational Belts",
            "tribes_count" => "6 Indigenous Communities",
            "summary" => "ALERT's active fieldwork extends from the remote Eastern Ghats agency forests of Alluri Sitharama Raju (ASR) District to the Godavari floodplains of Eluru District, and southward to the coastal Yenadi fishing settlements of Krishna District.",
            "map_badge" => "Visual Territory Identification",
            "map_title" => "ALERT Area of Operation: Identified Territories & Mandals",
            "map_subtitle" => "All 17 mandal stations and 4 operational jurisdictions are labeled and color-coded below. Click on any territory badge or mandal pin to inspect.",
            "map_settings" => [
                "map_tile_url" => "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                "map_center_lat" => "17.1",
                "map_center_lng" => "81.45",
                "map_zoom" => "8.5"
            ],
            "map_regions" => [
                [
                    "id" => "asr",
                    "name" => "ASR District (Alluri Sitharama Raju)",
                    "shortName" => "ASR District",
                    "badgeColor" => "#10b981",
                    "itda" => ["Rampachodavaram ITDA", "Chinturu ITDA"],
                    "focus" => "PESA Gram Sabha sovereignty, RoFR Community Forest Rights (CFR), and forest dwelling tribal land titles.",
                    "tribes" => ["Koya", "Konda Reddi (PVTG)", "Valmiki"],
                    "center" => [17.55, 81.55],
                    "zoom" => 9.5,
                    "polygonCoords" => [
                        [17.85, 81.25], [17.82, 81.55], [17.65, 81.85], [17.35, 81.88], [17.25, 81.65], [17.48, 81.35], [17.75, 81.25]
                    ],
                    "mandals" => [
                        ["id" => "chinturu", "name" => "1. Chinturu", "fullName" => "Chinturu Mandal", "itda" => "Chinturu ITDA", "lat" => 17.747, "lng" => 81.393, "river" => "Sabari & Godavari Basin", "activities" => "Gram Sabha Patta titling under RoFR 2006, flash flood warning system, emergency relief distribution."],
                        ["id" => "devipatnam", "name" => "2. Devipatnam", "fullName" => "Devipatnam Mandal", "itda" => "Rampachodavaram ITDA", "lat" => 17.291, "lng" => 81.673, "river" => "Godavari Gorge Area", "activities" => "Polavaram submergence R&R package entitlement verification, youth cooperative training."],
                        ["id" => "kunavaram", "name" => "3. Kunavaram", "fullName" => "Kunavaram Mandal", "itda" => "Chinturu ITDA", "lat" => 17.585, "lng" => 81.272, "river" => "Sabari-Godavari Confluence", "activities" => "Monsoon disaster risk reduction, tribal healthcare camps, forest produce value addition."],
                        ["id" => "maredumilli", "name" => "4. Maredumilli", "fullName" => "Maredumilli Mandal", "itda" => "Rampachodavaram ITDA", "lat" => 17.595, "lng" => 81.713, "river" => "Eastern Ghats Forest Reserve", "activities" => "Community Forest Resource rights mapping, sustainable bamboo & NTFP harvest stewardship."],
                        ["id" => "rcvaram", "name" => "5. R.C. Varam", "fullName" => "Rampachodavaram Mandal", "itda" => "Rampachodavaram ITDA", "lat" => 17.447, "lng" => 81.776, "river" => "Agency Administrative Center", "activities" => "Regional legal aid cell, high court writ petition documentation, human rights paralegal clinic."],
                        ["id" => "vrpuram", "name" => "6. V.R. Puram", "fullName" => "Vararamachandrapuram Mandal", "itda" => "Chinturu ITDA", "lat" => 17.545, "lng" => 81.332, "river" => "Deep Agency Riverine Belt", "activities" => "Solar micro-grid home electrification, tribal nutrition & ashram school quality monitoring."]
                    ]
                ],
                [
                    "id" => "eluru",
                    "name" => "Eluru Agency District",
                    "shortName" => "Eluru District",
                    "badgeColor" => "#ef4444",
                    "itda" => ["K.R. Puram ITDA"],
                    "focus" => "Land Transfer Regulation (LTR 1/70) enforcement, agricultural cooperatives, and fair Polavaram displacement compensation.",
                    "tribes" => ["Koya", "Konda Dora", "Nayaks"],
                    "center" => [17.3, 81.3],
                    "zoom" => 9.5,
                    "polygonCoords" => [
                        [17.65, 81.1], [17.55, 81.3], [17.32, 81.65], [17.18, 81.6], [17.1, 81.25], [17.25, 81.08]
                    ],
                    "mandals" => [
                        ["id" => "buttayigudem", "name" => "1. Buttayigudem", "fullName" => "Buttayigudem Mandal", "itda" => "K.R. Puram ITDA", "lat" => 17.151, "lng" => 81.298, "river" => "Jalleru Reservoir Belt", "activities" => "Land Transfer Regulation 1 of 1970 restitution litigation, organic millets & turmeric collective farming."],
                        ["id" => "jeelugumilli", "name" => "2. Jeelugumilli", "fullName" => "Jeelugumilli Mandal", "itda" => "K.R. Puram ITDA", "lat" => 17.185, "lng" => 81.161, "river" => "Agency Foothill Plains", "activities" => "Forest rights claim dispute resolution, women self-help microfinance cooperatives."],
                        ["id" => "kukkunuru", "name" => "3. Kukkunuru", "fullName" => "Kukkunuru Mandal", "itda" => "K.R. Puram ITDA", "lat" => 17.575, "lng" => 81.196, "river" => "Godavari Riverine Basin", "activities" => "Polavaram displacement rehabilitation survey, youth vocational rights advocacy."],
                        ["id" => "velerpadu", "name" => "4. Velerpadu", "fullName" => "Velerpadu Mandal", "itda" => "K.R. Puram ITDA", "lat" => 17.485, "lng" => 81.171, "river" => "Godavari Upstream Belt", "activities" => "Resettlement housing quality audits, potable drinking water filter installation."],
                        ["id" => "polavaram", "name" => "5. Polavaram", "fullName" => "Polavaram Mandal", "itda" => "K.R. Puram ITDA", "lat" => 17.251, "lng" => 81.642, "river" => "Project Dam Site Epicenter", "activities" => "Statutory RFCTLARR Act 2013 compliance monitoring, grievance redressal for displaced families."]
                    ]
                ],
                [
                    "id" => "submergence",
                    "name" => "Polavaram Submergence Area",
                    "shortName" => "371 Villages Zone",
                    "badgeColor" => "#f59e0b",
                    "itda" => ["Tri-ITDA Jurisdiction"],
                    "focus" => "Comprehensive entitlement monitoring for 371 tribal habitations facing total submergence under the Polavaram Mega Dam reservoir.",
                    "tribes" => ["Koya", "Konda Reddi", "Hill Tribals"],
                    "center" => [17.38, 81.52],
                    "zoom" => 10.5,
                    "polygonCoords" => [
                        [17.48, 81.45], [17.45, 81.65], [17.25, 81.66], [17.28, 81.42]
                    ],
                    "mandals" => [
                        ["id" => "submerged_habitations", "name" => "371 Villages Submergence Zone", "fullName" => "371 Submerged Villages Zone", "itda" => "Tri-ITDA Jurisdiction", "lat" => 17.38, "lng" => 81.52, "river" => "Contour 41.15m & 45.72m Flood Levels", "activities" => "Independent social audit of R&R housing, land-for-land entitlement verification, and legal representation in Supreme Court / High Court."]
                    ]
                ],
                [
                    "id" => "coastal",
                    "name" => "Coastal Krishna Belt",
                    "shortName" => "Coastal Krishna",
                    "badgeColor" => "#0ea5e9",
                    "itda" => ["Non-Scheduled Nomad Cell"],
                    "focus" => "Nomadic Yenadi tribal land rights, housing entitlement, Matsya Mithra Women Fisheries Federation, and coastal mangrove resilience.",
                    "tribes" => ["Yenadi (Nomadic Primitive Tribe)", "Traditional Fishermen Communities"],
                    "center" => [16.15, 81.1],
                    "zoom" => 9.5,
                    "polygonCoords" => [
                        [16.48, 81.25], [16.45, 81.45], [16.15, 81.25], [15.88, 80.95], [16.05, 80.85], [16.35, 81.15]
                    ],
                    "mandals" => [
                        ["id" => "machilipatnam", "name" => "1. Machilipatnam", "fullName" => "Machilipatnam Mandal", "itda" => "Coastal Cell", "lat" => 16.187, "lng" => 81.138, "river" => "Bay of Bengal Shoreline", "activities" => "Federation headquarters of 3,500+ Matsya Mithra tribal fisherwomen, revolving micro-capital loans."],
                        ["id" => "bantumilli", "name" => "2. Bantumilli", "fullName" => "Bantumilli Mandal", "itda" => "Coastal Cell", "lat" => 16.358, "lng" => 81.273, "river" => "Coastal Estuary Belt", "activities" => "Securing permanent house-site pattas and social identity documentation for nomadic Yenadi hamlets."],
                        ["id" => "kruthivennu", "name" => "3. Kruthivennu", "fullName" => "Kruthivennu Mandal", "itda" => "Coastal Cell", "lat" => 16.425, "lng" => 81.385, "river" => "Mangrove Tidal Creeks", "activities" => "Community-led mangrove ecological restoration, cyclone emergency shelter management."],
                        ["id" => "nagayalanka", "name" => "4. Nagayalanka", "fullName" => "Nagayalanka Mandal", "itda" => "Coastal Cell", "lat" => 15.945, "lng" => 80.916, "river" => "Krishna River Estuary Mouth", "activities" => "Estuarine artisanal fishing rights protection, child joyful learning centers."],
                        ["id" => "koduru", "name" => "5. Koduru", "fullName" => "Koduru Mandal", "itda" => "Coastal Cell", "lat" => 15.914, "lng" => 80.898, "river" => "Hamsaladeevi Beach Zone", "activities" => "Civil rights camps: securing Aadhaar, Voter IDs, and Ration cards for excluded nomadic families."],
                        ["id" => "mopidevi", "name" => "6. Mopidevi", "fullName" => "Mopidevi Mandal", "itda" => "Coastal Cell", "lat" => 16.082, "lng" => 80.932, "river" => "Krishna River Irrigation Tract", "activities" => "Safe clean drinking water systems, self-help health collectives, youth literacy support."]
                    ]
                ]
            ],
            "regions" => [
                [
                    "name" => "ASR Hill Agency",
                    "focus" => "Rampachodavaram & Chinturu ITDAs — PESA Gram Sabhas & Community Forest Rights",
                    "mandals" => "6 Mandals",
                    "tribes" => "Koya · Konda Reddi (PVTG) · Valmiki",
                    "color" => "#10b981",
                    "icon" => "FaTree"
                ],
                [
                    "name" => "Eluru Agency & Polavaram Belt",
                    "focus" => "K.R. Puram ITDA — LTR 1/70 land restitution and Polavaram R&R claims",
                    "mandals" => "5 Mandals",
                    "tribes" => "Koya · Konda Dora · Nayaks",
                    "color" => "#ef4444",
                    "icon" => "FaWater"
                ],
                [
                    "name" => "Polavaram Submergence Basin",
                    "focus" => "371 submerged habitations — independent R&R social audits and fair resettlement advocacy",
                    "mandals" => "371 Habitations",
                    "tribes" => "Koya · Konda Reddi · Hill Tribals",
                    "color" => "#f59e0b",
                    "icon" => "FaLayerGroup"
                ],
                [
                    "name" => "Coastal Krishna Belt",
                    "focus" => "Machilipatnam & coastal mandals — Yenadi tribal women Matsya Mithra fisheries cooperatives",
                    "mandals" => "6 Mandals",
                    "tribes" => "Yenadi · Coastal Traditional Fisher Communities",
                    "color" => "#0ea5e9",
                    "icon" => "FaCompass"
                ]
            ]
        ]
    ],
    "governing-body" => [
        "slug" => "governing-body",
        "badge" => "Leadership",
        "title" => "Governing Body & Leadership",
        "subtitle" => "Elected leadership and constitutional scholars dedicated to justice, dignity, and sustainable prosperity for Adivasis.",
        "content" => [
            "society_reg" => "Reg. No. 307/2004 under Societies Registration Act XXI of 1860",
            "tenure_desc" => "The Governing Body is elected every 3 years in accordance with the registered bye-laws of the society, ensuring democratic representation and statutory oversight.",
            "legal_cell_title" => "ALERT Legal Defense Cell",
            "legal_cell_desc" => "Guided by senior constitutional attorneys and former principals of law colleges, ALERT's legal cell provides pro-bono litigation, appeals before the High Court of Andhra Pradesh, and RoFR title disputes."
        ]
    ]
];

if ($conn) {
    try {
        $conn->exec("CREATE TABLE IF NOT EXISTS about_pages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            slug VARCHAR(100) UNIQUE NOT NULL,
            badge VARCHAR(100) DEFAULT 'About Us',
            title VARCHAR(255) NOT NULL,
            subtitle TEXT,
            content_json LONGTEXT NOT NULL,
            banner_image VARCHAR(500) NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        // Ensure all default pages exist in the table (including newly added slugs like 'about')
        $stmtCheck = $conn->prepare("SELECT COUNT(*) FROM about_pages WHERE slug = ?");
        $stmtInsert = $conn->prepare("INSERT INTO about_pages (slug, badge, title, subtitle, content_json) VALUES (?, ?, ?, ?, ?)");
        foreach ($defaultAboutPages as $slug => $p) {
            $stmtCheck->execute([$slug]);
            if ((int)$stmtCheck->fetchColumn() === 0) {
                $stmtInsert->execute([
                    $slug,
                    $p['badge'],
                    $p['title'],
                    $p['subtitle'],
                    json_encode($p['content'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
                ]);
            }
        }

        $slugParam = trim($_GET['slug'] ?? '');
        if ($slugParam !== '') {
            $stmt = $conn->prepare("SELECT slug, badge, title, subtitle, content_json, banner_image, updated_at FROM about_pages WHERE slug = ?");
            $stmt->execute([$slugParam]);
            $row = $stmt->fetch();
            if ($row) {
                $row['content'] = json_decode($row['content_json'], true) ?: [];
                echo json_encode(["success" => true, "data" => $row]);
                exit;
            }
        }

        $allRows = $conn->query("SELECT slug, badge, title, subtitle, content_json, banner_image, updated_at FROM about_pages")->fetchAll();
        if ($allRows && count($allRows) > 0) {
            $pagesMap = [];
            foreach ($allRows as $r) {
                $r['content'] = json_decode($r['content_json'], true) ?: [];
                $pagesMap[$r['slug']] = $r;
            }
            echo json_encode(["success" => true, "data" => $pagesMap]);
            exit;
        }
    } catch (PDOException $e) {
        // Fallback below
    }
}

$slugParam = trim($_GET['slug'] ?? '');
if ($slugParam !== '' && isset($defaultAboutPages[$slugParam])) {
    echo json_encode(["success" => true, "data" => $defaultAboutPages[$slugParam]]);
    exit;
}

echo json_encode(["success" => true, "data" => $defaultAboutPages]);
