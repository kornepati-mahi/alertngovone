<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$defaultOpenings = [
    [
        "role" => "Field Coordinator — Polavaram R&R",
        "type" => "Full-time",
        "place" => "Vijayawada HQ with field travel, ASR & Eluru districts",
        "icon" => "FaMapMarkerAlt",
        "about" => "Lead household surveys and social audits across the submergence belt, verify RFCTLARR Act 2013 entitlements, and carry findings into meetings with the R&R Commissioner and Gram Sabhas.",
        "fit" => "Field research experience with tribal communities, Telugu fluency, comfort with long mandal travel.",
        "apply_link" => "",
        "apply_email" => "contact@alertngo.in",
        "media_type" => "none",
        "media_url" => "",
        "jd_file" => "",
        "link_url" => "/contact",
        "sort_order" => 1,
        "is_active" => 1
    ],
    [
        "role" => "Legal Aid & RTI Researcher",
        "type" => "Full-time",
        "place" => "Vijayawada HQ",
        "icon" => "FaShieldAlt",
        "about" => "Draft RTI representations, writ petition documentation and RoFR / LTR case files with the Legal Cell, and prepare village-level legal literacy material on the Bare Acts.",
        "fit" => "Law degree or legal-research background; writing in plain Telugu and English; familiarity with forest and land law.",
        "apply_link" => "",
        "apply_email" => "contact@alertngo.in",
        "media_type" => "none",
        "media_url" => "",
        "jd_file" => "",
        "link_url" => "/contact",
        "sort_order" => 2,
        "is_active" => 1
    ],
    [
        "role" => "Women Cooperatives Manager",
        "type" => "Full-time",
        "place" => "Krishna District coastal mandals",
        "icon" => "FaUsers",
        "about" => "Work with Matsya Mithra groups on savings discipline, market linkages, fish handling and leadership training for Yenadi members across the six coastal mandals.",
        "fit" => "Experience with SHGs or cooperatives, fisheries or livelihood programmes, and community mobilisation.",
        "apply_link" => "",
        "apply_email" => "contact@alertngo.in",
        "media_type" => "none",
        "media_url" => "",
        "jd_file" => "",
        "link_url" => "/contact",
        "sort_order" => 3,
        "is_active" => 1
    ],
    [
        "role" => "Monitoring, Evaluation & Learning Officer",
        "type" => "Full-time",
        "place" => "Vijayawada HQ with field visits",
        "icon" => "FaGraduationCap",
        "about" => "Maintain the MEL framework behind ALERT's 35 institutional policies — beneficiary tracking, outcome harvesting, donor reporting and the evidence used in our public impact pages.",
        "fit" => "M&E or development-economics background, data cleaning and reporting discipline, Kannada/Telugu an advantage.",
        "apply_link" => "",
        "apply_email" => "contact@alertngo.in",
        "media_type" => "none",
        "media_url" => "",
        "jd_file" => "",
        "link_url" => "/contact",
        "sort_order" => 4,
        "is_active" => 1
    ],
    [
        "role" => "Solar & Green Energy Technician",
        "type" => "Contract / Project",
        "place" => "Eastern Ghats agency habitations",
        "icon" => "FaBriefcase",
        "about" => "Install and service solar home lighting and street poles, train local youth maintenance teams, and keep the spares and warranty record for each hamlet.",
        "fit" => "ITI or diploma in electrical work, solar system experience, willingness to stay in field locations.",
        "apply_link" => "",
        "apply_email" => "contact@alertngo.in",
        "media_type" => "none",
        "media_url" => "",
        "jd_file" => "",
        "link_url" => "/contact",
        "sort_order" => 5,
        "is_active" => 1
    ]
];

$defaultPathways = [
    [
        "id" => "pw_1",
        "title" => "Field Volunteering",
        "who" => "Students and early-career practitioners",
        "body" => "Join a mandal team for relief distribution, school support, documentation drives or civil-documentation camps. Short stints of two to four weeks, longer placements by arrangement.",
        "link_url" => "/contact",
        "is_active" => 1
    ],
    [
        "id" => "pw_2",
        "title" => "Research Internships",
        "who" => "Postgraduate researchers in law, development, anthropology, data",
        "body" => "Work with verified programme records on land rights, displacement rehabilitation or cooperative livelihoods. We ask for a research design cleared by your guide and a plain-language summary for the community.",
        "link_url" => "/contact",
        "is_active" => 1
    ],
    [
        "id" => "pw_3",
        "title" => "Skilled Pro-Bono Support",
        "who" => "Lawyers, accountants, designers, developers, translators",
        "body" => "Legal opinion support, audit readiness, translation of Bare Acts into Koya and Telugu, photography and archive digitisation — contributed on your own schedule.",
        "link_url" => "/partner",
        "is_active" => 1
    ]
];

$defaultSteps = [
    ["n" => "01", "t" => "Write to us", "d" => "Email contact@alertngo.in with the role or pathway in the subject line — for example \"Application — MEL Officer\"."],
    ["n" => "02", "t" => "Send your file", "d" => "CV or resume, a short note on why this work, and contacts for two referees. Certificates can follow later."],
    ["n" => "03", "t" => "Conversation", "d" => "A first call with the programme team, then a field or task-based exercise that reflects the actual work."],
    ["n" => "04", "t" => "Decision", "d" => "Written offer or honest feedback. Vacancies are filled as project funding allows; we keep strong applicants in a talent pool."]
];

$defaultValues = [
    "Volunteer & Intern Professional Code for work inside Fifth Scheduled Adivasi habitations",
    "POSH Act 2013 compliance with an active Internal Complaints Committee",
    "Child Protection & Safeguarding Policy — background checks and no unsupervised access",
    "Human Resource Policy with merit recruitment and affirmative induction of tribal youth",
    "Do No Harm and conflict-sensitive community practice",
    "Grievance Redressal Mechanism with a 15-day resolution pathway"
];

$defaultTrustStrip = [
    ["text" => "No Recruitment Fee", "icon" => "FaShieldAlt"],
    ["text" => "POSH Compliant Workplace", "icon" => "FaCheckCircle"],
    ["text" => "Tribal Youth Induction", "icon" => "FaUsers"]
];

$defaultMedia = [
    [
        "title" => "ALERT Field Team & Community Orientation",
        "type" => "image",
        "url" => "/uploads/PHOTO-2023-02-15-19-20-56_2-1.jpg",
        "poster" => "",
        "tag" => "Field Orientation",
        "description" => "Village level induction and orientation with Adivasi communities in Godavari agency.",
        "link_url" => "/careers",
        "sort_order" => 1,
        "is_active" => 1
    ],
    [
        "title" => "Youth Capacity Building in Agency Schools",
        "type" => "video",
        "url" => "/uploads/reels/reel-3-school-kits.mp4",
        "poster" => "/uploads/PHOTO-2023-02-15-19-20-52_1.jpg",
        "tag" => "Agency Education",
        "description" => "Field work supporting joyful learning and school kits in agency hamlets.",
        "link_url" => "/careers",
        "sort_order" => 2,
        "is_active" => 1
    ]
];

$defaultPage = [
    "id" => 1,
    "badge" => "Section 01",
    "title" => "Working With ALERT",
    "subtitle" => "ALERT is a Vijayawada-based society working in the Fifth Scheduled Areas of Andhra Pradesh since 2004. Our teams are small, field-first, and answerable to Gram Sabhas — so the work is close to the community and rarely desk-bound.",
    "intro_p1" => "Founded and led by <strong>Y.L.J.B. Jayaraj</strong>, ALERT runs four operational wings — Legal Cell, Polavaram LA & R&R Field Unit, Antyodaya Livelihoods & Women Cooperatives, and Finance, Administration & Compliance. Each needs people who can hold a file, a conversation and a village meeting on the same day.",
    "intro_p2" => "Openings below are the roles we recruit for regularly. Availability depends on project funding cycles — if a post is closed when you write, we keep your file for the next cycle.",
    "hero_media_type" => "image",
    "hero_media_url" => "/uploads/PHOTO-2023-02-15-19-20-56_2-1.jpg",
    "hero_poster" => "",
    "apply_email" => "contact@alertngo.in",
    "partner_btn_text" => "Partner With Us",
    "partner_btn_url" => "/partner",
    "openings_badge" => "Section 02",
    "openings_title" => "Roles We Recruit For",
    "openings_subtitle" => "Five core positions across the legal, field, livelihood and compliance wings.",
    "pathways_badge" => "Section 03",
    "pathways_title" => "Internships & Volunteer Pathways",
    "pathways_subtitle" => "Three ways to work with ALERT without a paid post — each governed by our Volunteer & Intern Professional Code.",
    "pathways_json" => json_encode($defaultPathways, JSON_UNESCAPED_UNICODE),
    "steps_badge" => "Section 04",
    "steps_title" => "How To Apply",
    "steps_subtitle" => "One email, four steps. We never charge any fee at any stage of recruitment.",
    "steps_json" => json_encode($defaultSteps, JSON_UNESCAPED_UNICODE),
    "values_title" => "What you can expect from us",
    "values_json" => json_encode($defaultValues, JSON_UNESCAPED_UNICODE),
    "cta_badge" => "Careers",
    "cta_title" => "Do Work That Reaches the Last Hamlet",
    "cta_subtitle" => "If none of the roles above fit you yet, send your profile anyway. Field coordinators, legal researchers and MEL staff are recruited as project funding opens.",
    "cta_email_subject" => "Profile for ALERT talent pool",
    "cta_contact_url" => "/contact",
    "trust_strip_json" => json_encode($defaultTrustStrip, JSON_UNESCAPED_UNICODE)
];

if (!$conn) {
    echo json_encode([
        "success" => true,
        "source" => "fallback",
        "page" => $defaultPage,
        "openings" => $defaultOpenings,
        "media" => $defaultMedia
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Ensure tables exist
try {
    $conn->exec("CREATE TABLE IF NOT EXISTS `careers_page` (
        `id` INT PRIMARY KEY DEFAULT 1,
        `badge` VARCHAR(100) DEFAULT 'Section 01',
        `title` VARCHAR(255) DEFAULT 'Working With ALERT',
        `subtitle` TEXT NULL,
        `intro_p1` TEXT NULL,
        `intro_p2` TEXT NULL,
        `hero_media_type` VARCHAR(20) DEFAULT 'image',
        `hero_media_url` VARCHAR(500) DEFAULT '/uploads/PHOTO-2023-02-15-19-20-56_2-1.jpg',
        `hero_poster` VARCHAR(500) NULL,
        `apply_email` VARCHAR(255) DEFAULT 'contact@alertngo.in',
        `partner_btn_text` VARCHAR(100) DEFAULT 'Partner With Us',
        `partner_btn_url` VARCHAR(255) DEFAULT '/partner',
        `openings_badge` VARCHAR(100) DEFAULT 'Section 02',
        `openings_title` VARCHAR(255) DEFAULT 'Roles We Recruit For',
        `openings_subtitle` TEXT NULL,
        `pathways_badge` VARCHAR(100) DEFAULT 'Section 03',
        `pathways_title` VARCHAR(255) DEFAULT 'Internships & Volunteer Pathways',
        `pathways_subtitle` TEXT NULL,
        `pathways_json` LONGTEXT NULL,
        `steps_badge` VARCHAR(100) DEFAULT 'Section 04',
        `steps_title` VARCHAR(255) DEFAULT 'How To Apply',
        `steps_subtitle` TEXT NULL,
        `steps_json` LONGTEXT NULL,
        `values_title` VARCHAR(255) DEFAULT 'What you can expect from us',
        `values_json` LONGTEXT NULL,
        `cta_badge` VARCHAR(100) DEFAULT 'Careers',
        `cta_title` VARCHAR(255) DEFAULT 'Do Work That Reaches the Last Hamlet',
        `cta_subtitle` TEXT NULL,
        `cta_email_subject` VARCHAR(255) DEFAULT 'Profile for ALERT talent pool',
        `cta_contact_url` VARCHAR(255) DEFAULT '/contact',
        `trust_strip_json` LONGTEXT NULL,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $conn->exec("CREATE TABLE IF NOT EXISTS `careers_openings` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `role` VARCHAR(255) NOT NULL,
        `type` VARCHAR(100) NOT NULL DEFAULT 'Full-time',
        `place` VARCHAR(255) NOT NULL,
        `icon` VARCHAR(50) DEFAULT 'FaBriefcase',
        `about` TEXT NOT NULL,
        `fit` TEXT NOT NULL,
        `apply_link` VARCHAR(500) NULL,
        `apply_email` VARCHAR(255) DEFAULT 'contact@alertngo.in',
        `media_type` VARCHAR(20) DEFAULT 'none',
        `media_url` VARCHAR(500) NULL,
        `jd_file` VARCHAR(500) NULL,
        `link_url` VARCHAR(500) NULL,
        `sort_order` INT DEFAULT 0,
        `is_active` TINYINT(1) DEFAULT 1,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $conn->exec("CREATE TABLE IF NOT EXISTS `careers_media` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `title` VARCHAR(255) NOT NULL,
        `type` VARCHAR(20) NOT NULL DEFAULT 'image',
        `url` VARCHAR(500) NOT NULL,
        `poster` VARCHAR(500) NULL,
        `tag` VARCHAR(100) DEFAULT 'Field Team',
        `description` TEXT NULL,
        `link_url` VARCHAR(500) NULL,
        `sort_order` INT DEFAULT 0,
        `is_active` TINYINT(1) DEFAULT 1,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
} catch (PDOException $e) {
    // continue
}

// Auto-seed if empty
try {
    $pageCount = (int)$conn->query("SELECT COUNT(*) FROM careers_page")->fetchColumn();
    if ($pageCount === 0) {
        $stmt = $conn->prepare("INSERT INTO careers_page 
            (id, badge, title, subtitle, intro_p1, intro_p2, hero_media_type, hero_media_url, hero_poster, apply_email, partner_btn_text, partner_btn_url, openings_badge, openings_title, openings_subtitle, pathways_badge, pathways_title, pathways_subtitle, pathways_json, steps_badge, steps_title, steps_subtitle, steps_json, values_title, values_json, cta_badge, cta_title, cta_subtitle, cta_email_subject, cta_contact_url, trust_strip_json)
            VALUES (1, :badge, :title, :subtitle, :intro_p1, :intro_p2, :hero_media_type, :hero_media_url, :hero_poster, :apply_email, :partner_btn_text, :partner_btn_url, :openings_badge, :openings_title, :openings_subtitle, :pathways_badge, :pathways_title, :pathways_subtitle, :pathways_json, :steps_badge, :steps_title, :steps_subtitle, :steps_json, :values_title, :values_json, :cta_badge, :cta_title, :cta_subtitle, :cta_email_subject, :cta_contact_url, :trust_strip_json)");
        $stmt->execute([
            ':badge' => $defaultPage['badge'],
            ':title' => $defaultPage['title'],
            ':subtitle' => $defaultPage['subtitle'],
            ':intro_p1' => $defaultPage['intro_p1'],
            ':intro_p2' => $defaultPage['intro_p2'],
            ':hero_media_type' => $defaultPage['hero_media_type'],
            ':hero_media_url' => $defaultPage['hero_media_url'],
            ':hero_poster' => $defaultPage['hero_poster'],
            ':apply_email' => $defaultPage['apply_email'],
            ':partner_btn_text' => $defaultPage['partner_btn_text'],
            ':partner_btn_url' => $defaultPage['partner_btn_url'],
            ':openings_badge' => $defaultPage['openings_badge'],
            ':openings_title' => $defaultPage['openings_title'],
            ':openings_subtitle' => $defaultPage['openings_subtitle'],
            ':pathways_badge' => $defaultPage['pathways_badge'],
            ':pathways_title' => $defaultPage['pathways_title'],
            ':pathways_subtitle' => $defaultPage['pathways_subtitle'],
            ':pathways_json' => $defaultPage['pathways_json'],
            ':steps_badge' => $defaultPage['steps_badge'],
            ':steps_title' => $defaultPage['steps_title'],
            ':steps_subtitle' => $defaultPage['steps_subtitle'],
            ':steps_json' => $defaultPage['steps_json'],
            ':values_title' => $defaultPage['values_title'],
            ':values_json' => $defaultPage['values_json'],
            ':cta_badge' => $defaultPage['cta_badge'],
            ':cta_title' => $defaultPage['cta_title'],
            ':cta_subtitle' => $defaultPage['cta_subtitle'],
            ':cta_email_subject' => $defaultPage['cta_email_subject'],
            ':cta_contact_url' => $defaultPage['cta_contact_url'],
            ':trust_strip_json' => $defaultPage['trust_strip_json']
        ]);
    }

    $openingsCount = (int)$conn->query("SELECT COUNT(*) FROM careers_openings")->fetchColumn();
    if ($openingsCount === 0) {
        $stmt = $conn->prepare("INSERT INTO careers_openings 
            (role, type, place, icon, about, fit, apply_link, apply_email, media_type, media_url, jd_file, link_url, sort_order, is_active)
            VALUES (:role, :type, :place, :icon, :about, :fit, :apply_link, :apply_email, :media_type, :media_url, :jd_file, :link_url, :sort_order, :is_active)");
        foreach ($defaultOpenings as $op) {
            $stmt->execute([
                ':role' => $op['role'],
                ':type' => $op['type'],
                ':place' => $op['place'],
                ':icon' => $op['icon'],
                ':about' => $op['about'],
                ':fit' => $op['fit'],
                ':apply_link' => $op['apply_link'],
                ':apply_email' => $op['apply_email'],
                ':media_type' => $op['media_type'],
                ':media_url' => $op['media_url'],
                ':jd_file' => $op['jd_file'],
                ':link_url' => $op['link_url'],
                ':sort_order' => $op['sort_order'],
                ':is_active' => $op['is_active']
            ]);
        }
    }

    $mediaCount = (int)$conn->query("SELECT COUNT(*) FROM careers_media")->fetchColumn();
    if ($mediaCount === 0) {
        $stmt = $conn->prepare("INSERT INTO careers_media 
            (title, type, url, poster, tag, description, link_url, sort_order, is_active)
            VALUES (:title, :type, :url, :poster, :tag, :description, :link_url, :sort_order, :is_active)");
        foreach ($defaultMedia as $med) {
            $stmt->execute([
                ':title' => $med['title'],
                ':type' => $med['type'],
                ':url' => $med['url'],
                ':poster' => $med['poster'],
                ':tag' => $med['tag'],
                ':description' => $med['description'],
                ':link_url' => $med['link_url'],
                ':sort_order' => $med['sort_order'],
                ':is_active' => $med['is_active']
            ]);
        }
    }
} catch (PDOException $e) {
    // continue
}

// Fetch live data
try {
    $pageStmt = $conn->query("SELECT * FROM careers_page WHERE id = 1 LIMIT 1");
    $pageRow = $pageStmt->fetch(PDO::FETCH_ASSOC);
    if (!$pageRow) {
        $pageRow = $defaultPage;
    }

    $all = isset($_GET['all']) && $_GET['all'] === '1';
    $opSql = $all ? "SELECT * FROM careers_openings ORDER BY sort_order ASC, id ASC"
                  : "SELECT * FROM careers_openings WHERE is_active = 1 ORDER BY sort_order ASC, id ASC";
    $openingsRows = $conn->query($opSql)->fetchAll(PDO::FETCH_ASSOC);

    $medSql = $all ? "SELECT * FROM careers_media ORDER BY sort_order ASC, id ASC"
                   : "SELECT * FROM careers_media WHERE is_active = 1 ORDER BY sort_order ASC, id ASC";
    $mediaRows = $conn->query($medSql)->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "page" => $pageRow,
        "openings" => $openingsRows,
        "media" => $mediaRows
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    echo json_encode([
        "success" => true,
        "source" => "fallback_on_error",
        "error" => $e->getMessage(),
        "page" => $defaultPage,
        "openings" => $defaultOpenings,
        "media" => $defaultMedia
    ], JSON_UNESCAPED_UNICODE);
}

