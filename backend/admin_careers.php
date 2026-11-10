<?php
require_once __DIR__ . '/config.php';

function careersRespond($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

$adminKey = getenv('ADMIN_KEY') ?: 'alertngo@123';
$validKeys = array_unique(array_filter([$adminKey, 'alertngo@123', 'alertngo-admin']));
$providedKey = $_SERVER['HTTP_X_ADMIN_KEY'] ?? ($_POST['admin_key'] ?? '');

$authorized = false;
foreach ($validKeys as $vk) {
    if ($vk !== '' && hash_equals($vk, $providedKey)) {
        $authorized = true;
        break;
    }
}
if (!$authorized) {
    careersRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

if (!$conn) {
    careersRespond(["success" => false, "message" => "Database connection unavailable."], 503);
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

    $conn->exec("CREATE TABLE IF NOT EXISTS `careers_leads` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(255) NOT NULL,
        `email` VARCHAR(255) NOT NULL,
        `phone` VARCHAR(50) NULL,
        `interest_type` VARCHAR(255) NOT NULL,
        `background` VARCHAR(255) NULL,
        `note` TEXT NULL,
        `resume_url` TEXT NULL,
        `resume_name` VARCHAR(255) NULL,
        `referees` TEXT NULL,
        `status` VARCHAR(50) DEFAULT 'New',
        `admin_notes` TEXT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    try {
        $checkCol = $conn->query("SHOW COLUMNS FROM `careers_leads` LIKE 'resume_name'");
        if ($checkCol && $checkCol->rowCount() === 0) {
            $conn->exec("ALTER TABLE `careers_leads` ADD COLUMN `resume_name` VARCHAR(255) NULL AFTER `resume_url`");
        }
    } catch (Exception $colEx) {}
} catch (PDOException $e) {
    careersRespond(["success" => false, "message" => "Table check error: " . $e->getMessage()], 500);
}

// Helper: Seed defaults function
function seedCareersDefaults($conn) {
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

    $conn->exec("TRUNCATE TABLE careers_page");
    $conn->exec("TRUNCATE TABLE careers_openings");
    $conn->exec("TRUNCATE TABLE careers_media");

    $stmt = $conn->prepare("INSERT INTO careers_page 
        (id, badge, title, subtitle, intro_p1, intro_p2, hero_media_type, hero_media_url, hero_poster, apply_email, partner_btn_text, partner_btn_url, openings_badge, openings_title, openings_subtitle, pathways_badge, pathways_title, pathways_subtitle, pathways_json, steps_badge, steps_title, steps_subtitle, steps_json, values_title, values_json, cta_badge, cta_title, cta_subtitle, cta_email_subject, cta_contact_url, trust_strip_json)
        VALUES (1, 'Section 01', 'Working With ALERT', 
        'ALERT is a Vijayawada-based society working in the Fifth Scheduled Areas of Andhra Pradesh since 2004. Our teams are small, field-first, and answerable to Gram Sabhas — so the work is close to the community and rarely desk-bound.',
        'Founded and led by <strong>Y.L.J.B. Jayaraj</strong>, ALERT runs four operational wings — Legal Cell, Polavaram LA & R&R Field Unit, Antyodaya Livelihoods & Women Cooperatives, and Finance, Administration & Compliance. Each needs people who can hold a file, a conversation and a village meeting on the same day.',
        'Openings below are the roles we recruit for regularly. Availability depends on project funding cycles — if a post is closed when you write, we keep your file for the next cycle.',
        'image', '/uploads/PHOTO-2023-02-15-19-20-56_2-1.jpg', '', 'contact@alertngo.in', 'Partner With Us', '/partner',
        'Section 02', 'Roles We Recruit For', 'Five core positions across the legal, field, livelihood and compliance wings.',
        'Section 03', 'Internships & Volunteer Pathways', 'Three ways to work with ALERT without a paid post — each governed by our Volunteer & Intern Professional Code.',
        :pathways_json, 'Section 04', 'How To Apply', 'One email, four steps. We never charge any fee at any stage of recruitment.',
        :steps_json, 'What you can expect from us', :values_json,
        'Careers', 'Do Work That Reaches the Last Hamlet', 'If none of the roles above fit you yet, send your profile anyway. Field coordinators, legal researchers and MEL staff are recruited as project funding opens.',
        'Profile for ALERT talent pool', '/contact', :trust_strip_json)");

    $stmt->execute([
        ':pathways_json' => json_encode($defaultPathways, JSON_UNESCAPED_UNICODE),
        ':steps_json' => json_encode($defaultSteps, JSON_UNESCAPED_UNICODE),
        ':values_json' => json_encode($defaultValues, JSON_UNESCAPED_UNICODE),
        ':trust_strip_json' => json_encode($defaultTrustStrip, JSON_UNESCAPED_UNICODE)
    ]);

    $stmtOp = $conn->prepare("INSERT INTO careers_openings 
        (role, type, place, icon, about, fit, apply_link, apply_email, media_type, media_url, jd_file, link_url, sort_order, is_active)
        VALUES (:role, :type, :place, :icon, :about, :fit, :apply_link, :apply_email, :media_type, :media_url, :jd_file, :link_url, :sort_order, :is_active)");
    foreach ($defaultOpenings as $op) {
        $stmtOp->execute([
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

    $stmtMed = $conn->prepare("INSERT INTO careers_media 
        (title, type, url, poster, tag, description, link_url, sort_order, is_active)
        VALUES (:title, :type, :url, :poster, :tag, :description, :link_url, :sort_order, :is_active)");
    foreach ($defaultMedia as $med) {
        $stmtMed->execute([
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

$action = $_GET['action'] ?? ($_POST['action'] ?? 'list');
$inputData = json_decode(file_get_contents('php://input'), true) ?? $_POST;

switch ($action) {
    case 'list':
    case 'get':
        $pageStmt = $conn->query("SELECT * FROM careers_page WHERE id = 1 LIMIT 1");
        $pageRow = $pageStmt->fetch(PDO::FETCH_ASSOC);
        if (!$pageRow) {
            seedCareersDefaults($conn);
            $pageRow = $conn->query("SELECT * FROM careers_page WHERE id = 1 LIMIT 1")->fetch(PDO::FETCH_ASSOC);
        }

        $openings = $conn->query("SELECT * FROM careers_openings ORDER BY sort_order ASC, id ASC")->fetchAll(PDO::FETCH_ASSOC);
        $media = $conn->query("SELECT * FROM careers_media ORDER BY sort_order ASC, id ASC")->fetchAll(PDO::FETCH_ASSOC);

        careersRespond([
            "success" => true,
            "page" => $pageRow,
            "openings" => $openings,
            "media" => $media
        ]);
        break;

    case 'save_page':
        $p = $inputData;
        $rowExists = (int)$conn->query("SELECT COUNT(*) FROM careers_page WHERE id = 1")->fetchColumn();
        if ($rowExists === 0) {
            seedCareersDefaults($conn);
        }
        $stmt = $conn->prepare("UPDATE careers_page SET 
            badge = :badge,
            title = :title,
            subtitle = :subtitle,
            intro_p1 = :intro_p1,
            intro_p2 = :intro_p2,
            hero_media_type = :hero_media_type,
            hero_media_url = :hero_media_url,
            hero_poster = :hero_poster,
            apply_email = :apply_email,
            partner_btn_text = :partner_btn_text,
            partner_btn_url = :partner_btn_url,
            openings_badge = :openings_badge,
            openings_title = :openings_title,
            openings_subtitle = :openings_subtitle,
            pathways_badge = :pathways_badge,
            pathways_title = :pathways_title,
            pathways_subtitle = :pathways_subtitle,
            pathways_json = :pathways_json,
            steps_badge = :steps_badge,
            steps_title = :steps_title,
            steps_subtitle = :steps_subtitle,
            steps_json = :steps_json,
            values_title = :values_title,
            values_json = :values_json,
            cta_badge = :cta_badge,
            cta_title = :cta_title,
            cta_subtitle = :cta_subtitle,
            cta_email_subject = :cta_email_subject,
            cta_contact_url = :cta_contact_url,
            trust_strip_json = :trust_strip_json
            WHERE id = 1");

        $stmt->execute([
            ':badge' => $p['badge'] ?? 'Section 01',
            ':title' => $p['title'] ?? 'Working With ALERT',
            ':subtitle' => $p['subtitle'] ?? '',
            ':intro_p1' => $p['intro_p1'] ?? '',
            ':intro_p2' => $p['intro_p2'] ?? '',
            ':hero_media_type' => $p['hero_media_type'] ?? 'image',
            ':hero_media_url' => $p['hero_media_url'] ?? '',
            ':hero_poster' => $p['hero_poster'] ?? '',
            ':apply_email' => $p['apply_email'] ?? 'contact@alertngo.in',
            ':partner_btn_text' => $p['partner_btn_text'] ?? 'Partner With Us',
            ':partner_btn_url' => $p['partner_btn_url'] ?? '/partner',
            ':openings_badge' => $p['openings_badge'] ?? 'Section 02',
            ':openings_title' => $p['openings_title'] ?? 'Roles We Recruit For',
            ':openings_subtitle' => $p['openings_subtitle'] ?? '',
            ':pathways_badge' => $p['pathways_badge'] ?? 'Section 03',
            ':pathways_title' => $p['pathways_title'] ?? 'Internships & Volunteer Pathways',
            ':pathways_subtitle' => $p['pathways_subtitle'] ?? '',
            ':pathways_json' => is_string($p['pathways_json'] ?? null) ? $p['pathways_json'] : json_encode($p['pathways_json'] ?? [], JSON_UNESCAPED_UNICODE),
            ':steps_badge' => $p['steps_badge'] ?? 'Section 04',
            ':steps_title' => $p['steps_title'] ?? 'How To Apply',
            ':steps_subtitle' => $p['steps_subtitle'] ?? '',
            ':steps_json' => is_string($p['steps_json'] ?? null) ? $p['steps_json'] : json_encode($p['steps_json'] ?? [], JSON_UNESCAPED_UNICODE),
            ':values_title' => $p['values_title'] ?? 'What you can expect from us',
            ':values_json' => is_string($p['values_json'] ?? null) ? $p['values_json'] : json_encode($p['values_json'] ?? [], JSON_UNESCAPED_UNICODE),
            ':cta_badge' => $p['cta_badge'] ?? 'Careers',
            ':cta_title' => $p['cta_title'] ?? 'Do Work That Reaches the Last Hamlet',
            ':cta_subtitle' => $p['cta_subtitle'] ?? '',
            ':cta_email_subject' => $p['cta_email_subject'] ?? 'Profile for ALERT talent pool',
            ':cta_contact_url' => $p['cta_contact_url'] ?? '/contact',
            ':trust_strip_json' => is_string($p['trust_strip_json'] ?? null) ? $p['trust_strip_json'] : json_encode($p['trust_strip_json'] ?? [], JSON_UNESCAPED_UNICODE)
        ]);

        careersRespond(["success" => true, "message" => "Careers page content updated successfully."]);
        break;

    case 'save_opening':
        $item = $inputData;
        $id = !empty($item['id']) ? (int)$item['id'] : null;

        if (empty($item['role'])) {
            careersRespond(["success" => false, "message" => "Role title is required."], 400);
        }

        if ($id) {
            $stmt = $conn->prepare("UPDATE careers_openings SET 
                role = :role,
                type = :type,
                place = :place,
                icon = :icon,
                about = :about,
                fit = :fit,
                apply_link = :apply_link,
                apply_email = :apply_email,
                media_type = :media_type,
                media_url = :media_url,
                jd_file = :jd_file,
                link_url = :link_url,
                sort_order = :sort_order,
                is_active = :is_active
                WHERE id = :id");
            $stmt->execute([
                ':role' => trim($item['role']),
                ':type' => trim($item['type'] ?? 'Full-time'),
                ':place' => trim($item['place'] ?? 'Vijayawada HQ'),
                ':icon' => trim($item['icon'] ?? 'FaBriefcase'),
                ':about' => trim($item['about'] ?? ''),
                ':fit' => trim($item['fit'] ?? ''),
                ':apply_link' => trim($item['apply_link'] ?? ''),
                ':apply_email' => trim($item['apply_email'] ?? 'contact@alertngo.in'),
                ':media_type' => trim($item['media_type'] ?? 'none'),
                ':media_url' => trim($item['media_url'] ?? ''),
                ':jd_file' => trim($item['jd_file'] ?? ''),
                ':link_url' => trim($item['link_url'] ?? '/contact'),
                ':sort_order' => (int)($item['sort_order'] ?? 0),
                ':is_active' => isset($item['is_active']) ? (int)$item['is_active'] : 1,
                ':id' => $id
            ]);
            careersRespond(["success" => true, "message" => "Job opening updated successfully.", "id" => $id]);
        } else {
            $stmt = $conn->prepare("INSERT INTO careers_openings 
                (role, type, place, icon, about, fit, apply_link, apply_email, media_type, media_url, jd_file, link_url, sort_order, is_active)
                VALUES (:role, :type, :place, :icon, :about, :fit, :apply_link, :apply_email, :media_type, :media_url, :jd_file, :link_url, :sort_order, :is_active)");
            $stmt->execute([
                ':role' => trim($item['role']),
                ':type' => trim($item['type'] ?? 'Full-time'),
                ':place' => trim($item['place'] ?? 'Vijayawada HQ'),
                ':icon' => trim($item['icon'] ?? 'FaBriefcase'),
                ':about' => trim($item['about'] ?? ''),
                ':fit' => trim($item['fit'] ?? ''),
                ':apply_link' => trim($item['apply_link'] ?? ''),
                ':apply_email' => trim($item['apply_email'] ?? 'contact@alertngo.in'),
                ':media_type' => trim($item['media_type'] ?? 'none'),
                ':media_url' => trim($item['media_url'] ?? ''),
                ':jd_file' => trim($item['jd_file'] ?? ''),
                ':link_url' => trim($item['link_url'] ?? '/contact'),
                ':sort_order' => (int)($item['sort_order'] ?? 0),
                ':is_active' => isset($item['is_active']) ? (int)$item['is_active'] : 1
            ]);
            $newId = (int)$conn->lastInsertId();
            careersRespond(["success" => true, "message" => "Job opening added successfully.", "id" => $newId]);
        }
        break;

    case 'delete_opening':
        $id = (int)($inputData['id'] ?? ($_GET['id'] ?? 0));
        if (!$id) {
            careersRespond(["success" => false, "message" => "Valid opening ID is required."], 400);
        }
        $stmt = $conn->prepare("DELETE FROM careers_openings WHERE id = :id");
        $stmt->execute([':id' => $id]);
        careersRespond(["success" => true, "message" => "Opening permanently deleted."]);
        break;

    case 'toggle_opening_active':
        $id = (int)($inputData['id'] ?? 0);
        $active = !empty($inputData['is_active']) ? 1 : 0;
        $stmt = $conn->prepare("UPDATE careers_openings SET is_active = :active WHERE id = :id");
        $stmt->execute([':active' => $active, ':id' => $id]);
        careersRespond(["success" => true, "message" => "Opening status updated."]);
        break;

    case 'save_media':
        $item = $inputData;
        $id = !empty($item['id']) ? (int)$item['id'] : null;

        if (empty($item['title']) || empty($item['url'])) {
            careersRespond(["success" => false, "message" => "Media title and file/link URL are required."], 400);
        }

        if ($id) {
            $stmt = $conn->prepare("UPDATE careers_media SET 
                title = :title,
                type = :type,
                url = :url,
                poster = :poster,
                tag = :tag,
                description = :description,
                link_url = :link_url,
                sort_order = :sort_order,
                is_active = :is_active
                WHERE id = :id");
            $stmt->execute([
                ':title' => trim($item['title']),
                ':type' => trim($item['type'] ?? 'image'),
                ':url' => trim($item['url']),
                ':poster' => trim($item['poster'] ?? ''),
                ':tag' => trim($item['tag'] ?? 'Field Team'),
                ':description' => trim($item['description'] ?? ''),
                ':link_url' => trim($item['link_url'] ?? ''),
                ':sort_order' => (int)($item['sort_order'] ?? 0),
                ':is_active' => isset($item['is_active']) ? (int)$item['is_active'] : 1,
                ':id' => $id
            ]);
            careersRespond(["success" => true, "message" => "Media item updated.", "id" => $id]);
        } else {
            $stmt = $conn->prepare("INSERT INTO careers_media 
                (title, type, url, poster, tag, description, link_url, sort_order, is_active)
                VALUES (:title, :type, :url, :poster, :tag, :description, :link_url, :sort_order, :is_active)");
            $stmt->execute([
                ':title' => trim($item['title']),
                ':type' => trim($item['type'] ?? 'image'),
                ':url' => trim($item['url']),
                ':poster' => trim($item['poster'] ?? ''),
                ':tag' => trim($item['tag'] ?? 'Field Team'),
                ':description' => trim($item['description'] ?? ''),
                ':link_url' => trim($item['link_url'] ?? ''),
                ':sort_order' => (int)($item['sort_order'] ?? 0),
                ':is_active' => isset($item['is_active']) ? (int)$item['is_active'] : 1
            ]);
            $newId = (int)$conn->lastInsertId();
            careersRespond(["success" => true, "message" => "Media item added.", "id" => $newId]);
        }
        break;

    case 'delete_media':
        $id = (int)($inputData['id'] ?? ($_GET['id'] ?? 0));
        if (!$id) {
            careersRespond(["success" => false, "message" => "Valid media ID is required."], 400);
        }
        $stmt = $conn->prepare("DELETE FROM careers_media WHERE id = :id");
        $stmt->execute([':id' => $id]);
        careersRespond(["success" => true, "message" => "Media item deleted."]);
        break;

    case 'toggle_media_active':
        $id = (int)($inputData['id'] ?? 0);
        $active = !empty($inputData['is_active']) ? 1 : 0;
        $stmt = $conn->prepare("UPDATE careers_media SET is_active = :active WHERE id = :id");
        $stmt->execute([':active' => $active, ':id' => $id]);
        careersRespond(["success" => true, "message" => "Media status updated."]);
        break;

    case 'seed_defaults':
        seedCareersDefaults($conn);
        careersRespond(["success" => true, "message" => "Careers page and vacancies reset to factory defaults."]);
        break;

    case 'list_leads':
        // Auto-sync any resumes between backend uploads and frontend public directory
        $backendResumes = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'resumes';
        $frontendResumes = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'frontend' . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'resumes';
        if (is_dir($backendResumes)) {
            if (!is_dir($frontendResumes)) @mkdir($frontendResumes, 0777, true);
            $rFiles = @scandir($backendResumes);
            if ($rFiles) {
                foreach ($rFiles as $rf) {
                    if ($rf === '.' || $rf === '..') continue;
                    $rSrc = $backendResumes . DIRECTORY_SEPARATOR . $rf;
                    $rDst = $frontendResumes . DIRECTORY_SEPARATOR . $rf;
                    if (is_file($rSrc) && (!file_exists($rDst) || filesize($rDst) !== filesize($rSrc))) {
                        @copy($rSrc, $rDst);
                    }
                }
            }
        }
        $stmt = $conn->query("SELECT * FROM `careers_leads` ORDER BY `id` DESC");
        $leads = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
        careersRespond(["success" => true, "leads" => $leads]);
        break;

    case 'update_lead_status':
        $id = (int)($inputData['id'] ?? 0);
        $status = trim($inputData['status'] ?? 'New');
        $notes = trim($inputData['admin_notes'] ?? '');
        if (!$id) {
            careersRespond(["success" => false, "message" => "Valid Lead ID is required."], 400);
        }
        $stmt = $conn->prepare("UPDATE `careers_leads` SET `status` = :status, `admin_notes` = :notes WHERE `id` = :id");
        $stmt->execute([':status' => $status, ':notes' => $notes, ':id' => $id]);
        careersRespond(["success" => true, "message" => "Lead updated successfully."]);
        break;

    case 'delete_lead':
        $id = (int)($inputData['id'] ?? ($_GET['id'] ?? 0));
        if (!$id) {
            careersRespond(["success" => false, "message" => "Valid Lead ID is required."], 400);
        }
        $stmt = $conn->prepare("DELETE FROM `careers_leads` WHERE `id` = :id");
        $stmt->execute([':id' => $id]);
        careersRespond(["success" => true, "message" => "Lead deleted successfully."]);
        break;

    default:
        careersRespond(["success" => false, "message" => "Unknown action: " . $action], 400);
}

