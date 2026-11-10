<?php
require_once __DIR__ . '/config.php';

function partnerRespond($payload, $status = 200) {
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
    partnerRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

if (!$conn) {
    partnerRespond(["success" => false, "message" => "Database connection unavailable."], 503);
}

// ── ENSURE ALL RELEVANT TABLES EXIST ──────────────────────────────────────────
try {
    $conn->exec("CREATE TABLE IF NOT EXISTS `partner_page` (
        `id` INT PRIMARY KEY DEFAULT 1,
        `badge` VARCHAR(100) DEFAULT 'Section 01',
        `title` VARCHAR(255) DEFAULT 'Why Partner With ALERT',
        `subtitle` TEXT NULL,
        `intro_p1` TEXT NULL,
        `intro_p2` TEXT NULL,
        `hero_media_type` VARCHAR(20) DEFAULT 'image',
        `hero_media_url` VARCHAR(500) DEFAULT '/uploads/reels/reel-4-women.jpg',
        `hero_poster` VARCHAR(500) NULL,
        `contact_email` VARCHAR(255) DEFAULT 'director@alertngo.in',
        `donate_btn_text` VARCHAR(100) DEFAULT 'Give Directly',
        `donate_btn_url` VARCHAR(255) DEFAULT '/donate',
        `routes_badge` VARCHAR(100) DEFAULT 'Section 02',
        `routes_title` VARCHAR(255) DEFAULT 'Four Ways to Partner',
        `routes_subtitle` TEXT NULL,
        `routes_json` LONGTEXT NULL,
        `missions_badge` VARCHAR(100) DEFAULT 'Section 03',
        `missions_title` VARCHAR(255) DEFAULT 'Where Support Goes',
        `missions_subtitle` TEXT NULL,
        `missions_json` LONGTEXT NULL,
        `diligence_badge` VARCHAR(100) DEFAULT 'Section 04',
        `diligence_title` VARCHAR(255) DEFAULT 'Due Diligence & Statutory Records',
        `diligence_subtitle` TEXT NULL,
        `diligence_json` LONGTEXT NULL,
        `commitments_title` VARCHAR(255) DEFAULT 'Our Institutional Commitments',
        `commitments_json` LONGTEXT NULL,
        `registration_title` VARCHAR(255) DEFAULT 'Registration & tax details',
        `registration_json` LONGTEXT NULL,
        `registration_note` TEXT NULL,
        `cta_badge` VARCHAR(100) DEFAULT 'Partnership',
        `cta_title` VARCHAR(255) DEFAULT 'Begin a Conversation With Us',
        `cta_subtitle` TEXT NULL,
        `cta_email_subject` VARCHAR(255) DEFAULT 'Partnership enquiry to ALERT',
        `cta_donate_url` VARCHAR(255) DEFAULT '/donate',
        `trust_strip_json` LONGTEXT NULL,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    try { $conn->exec("ALTER TABLE `partner_page` ADD COLUMN `registration_title` VARCHAR(255) DEFAULT 'Registration & tax details'"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `partner_page` ADD COLUMN `registration_json` LONGTEXT NULL"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `partner_page` ADD COLUMN `registration_note` TEXT NULL"); } catch (Exception $e) {}

    $conn->exec("CREATE TABLE IF NOT EXISTS `grievance_page` (
        `id` INT PRIMARY KEY DEFAULT 1,
        `badge` VARCHAR(100) DEFAULT 'Community Assistance',
        `title` VARCHAR(255) DEFAULT 'ALERT Grievance Redressal Portal',
        `subtitle` TEXT NULL,
        `typewriter_json` LONGTEXT NULL,
        `form_title` VARCHAR(255) DEFAULT 'Lodge a Land or R&R Grievance',
        `form_subtitle` TEXT NULL,
        `categories_json` LONGTEXT NULL,
        `full_forms_json` LONGTEXT NULL,
        `chart1_title` VARCHAR(255) DEFAULT 'Official Grievance Categories Chart',
        `chart1_image` VARCHAR(500) DEFAULT '/uploads/grievance-types.png',
        `chart2_title` VARCHAR(255) DEFAULT 'ALERT R&R Grievances Abstract',
        `chart2_image` VARCHAR(500) DEFAULT '/uploads/GRIEVANCE-ALL.png',
        `chart3_title` VARCHAR(255) DEFAULT 'Land Rights Grievances Classification',
        `chart3_image` VARCHAR(500) DEFAULT '/uploads/LAND-RIGHTS.png',
        `faq_pdf_url` VARCHAR(500) DEFAULT '/uploads/GREIVANCE-FAQ.pdf',
        `faq_pdf_label` VARCHAR(255) DEFAULT 'FAQ PDF',
        `hero_image` VARCHAR(500) NULL,
        `success_title` VARCHAR(255) DEFAULT 'Grievance Registered Successfully',
        `success_desc` TEXT NULL,
        `guidelines_json` LONGTEXT NULL,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `categories_json` LONGTEXT NULL"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `chart1_title` VARCHAR(255) DEFAULT 'Official Grievance Categories Chart'"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `chart1_image` VARCHAR(500) DEFAULT '/uploads/grievance-types.png'"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `chart2_title` VARCHAR(255) DEFAULT 'ALERT R&R Grievances Abstract'"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `chart2_image` VARCHAR(500) DEFAULT '/uploads/GRIEVANCE-ALL.png'"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `chart3_title` VARCHAR(255) DEFAULT 'Land Rights Grievances Classification'"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `chart3_image` VARCHAR(500) DEFAULT '/uploads/LAND-RIGHTS.png'"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `charts_json` LONGTEXT NULL"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `faq_pdf_url` VARCHAR(500) DEFAULT '/uploads/GREIVANCE-FAQ.pdf'"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `faq_pdf_label` VARCHAR(255) DEFAULT 'FAQ PDF'"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `hero_image` VARCHAR(500) NULL"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `success_title` VARCHAR(255) DEFAULT 'Grievance Registered Successfully'"); } catch (Exception $e) {}
    try { $conn->exec("ALTER TABLE `grievance_page` ADD COLUMN `success_desc` TEXT NULL"); } catch (Exception $e) {}

    $conn->exec("CREATE TABLE IF NOT EXISTS `grievances` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `tracking_code` VARCHAR(50) UNIQUE NOT NULL,
        `name` VARCHAR(150) NOT NULL,
        `aadhaar` VARCHAR(20) NULL,
        `phone` VARCHAR(30) NOT NULL,
        `village` VARCHAR(100) NOT NULL,
        `mandal` VARCHAR(100) NOT NULL,
        `district` VARCHAR(100) NOT NULL,
        `grievance_type` VARCHAR(150) NOT NULL,
        `description` TEXT NOT NULL,
        `status` ENUM('registered', 'under_investigation', 'submitted_to_sdc', 'resolved') DEFAULT 'registered',
        `admin_remarks` TEXT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $conn->exec("CREATE TABLE IF NOT EXISTS `site_downloads` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `category` VARCHAR(50) NOT NULL DEFAULT 'acts',
        `title` VARCHAR(255) NOT NULL,
        `file` VARCHAR(500) NOT NULL,
        `meta` VARCHAR(255) NULL,
        `desc` TEXT NOT NULL,
        `file_size` VARCHAR(100) DEFAULT 'Official PDF',
        `sort_order` INT DEFAULT 0,
        `is_active` TINYINT(1) DEFAULT 1,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $conn->exec("CREATE TABLE IF NOT EXISTS `site_faqs` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `category` VARCHAR(100) DEFAULT 'General',
        `q` TEXT NOT NULL,
        `a` LONGTEXT NOT NULL,
        `sort_order` INT DEFAULT 0,
        `is_active` TINYINT(1) DEFAULT 1,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $conn->exec("CREATE TABLE IF NOT EXISTS `partner_dropdowns` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `parent_label` VARCHAR(100) NOT NULL DEFAULT 'Partner with us',
        `section` VARCHAR(100) NOT NULL DEFAULT 'Main',
        `label` VARCHAR(150) NOT NULL,
        `path` VARCHAR(255) NOT NULL,
        `sub_items_json` LONGTEXT NULL,
        `sort_order` INT DEFAULT 0,
        `is_active` TINYINT(1) DEFAULT 1,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

} catch (PDOException $e) {
    partnerRespond(["success" => false, "message" => "Database table setup failed: " . $e->getMessage()], 500);
}

$action = $_GET['action'] ?? ($_POST['action'] ?? 'get_all');
$inputData = json_decode(file_get_contents('php://input'), true) ?? $_POST;

switch ($action) {
    // ── MASTER GET ALL DATA ──────────────────────────────────────────────────
    case 'get_all':
        // 1. Partner Page
        $pRow = $conn->query("SELECT * FROM partner_page WHERE id = 1 LIMIT 1")->fetch(PDO::FETCH_ASSOC);
        if (!$pRow) {
            require_once __DIR__ . '/get_partner.php';
            $pRow = $conn->query("SELECT * FROM partner_page WHERE id = 1 LIMIT 1")->fetch(PDO::FETCH_ASSOC);
        }
        if ($pRow) {
            if (empty($pRow['missions_json']) || $pRow['missions_json'] === '[]') {
                $defaultMissions = [
                    ["icon" => "FaGavel", "title" => "Land & Forest Rights", "body" => "Recognition of Forest Rights Act and LTR 1970 claims, Community Forest Resource mapping, title-suit recovery, and legal aid for habitation-level rights disputes across the Eastern Ghats agency zones.", "tell" => "Tell us if you want to fund legal aid, claim facilitation or document recovery."],
                    ["icon" => "FaWater", "title" => "Polavaram Rehabilitation", "body" => "Household surveys, RFCTLARR Act 2013 entitlement tracking, R&R social audits and grievance redressal support for families in the submergence belt of Godavari and Krishna districts.", "tell" => "Tell us if you want to back field research, social audits or victim support."],
                    ["icon" => "FaUsers", "title" => "Antyodaya Livelihoods", "body" => "Women's cooperatives and SHGs — micro-savings, revolving credit, estuarine fishing and mangrove work, house-site pattas and market linkage for coastal Krishna mandals.", "tell" => "Tell us if you want to seed a cooperative, a revolving fund or skills training."],
                    ["icon" => "FaGraduationCap", "title" => "Child Rights & Basic Services", "body" => "Joyful learning centres, digital classrooms and kits, school kits and kits for out-of-school children, alongside child-protection and nutrition monitoring at the village level.", "tell" => "Tell us if you want to equip a classroom, a centre or a batch of students."]
                ];
                $pRow['missions_json'] = json_encode($defaultMissions, JSON_UNESCAPED_UNICODE);
            }
            if (empty($pRow['commitments_json']) || $pRow['commitments_json'] === '[]') {
                $defaultCommitments = [
                    "Project-scoped agreement with clear deliverables, budget heads and a reporting calendar",
                    "Social audit and beneficiary-level verification before a grant is renewed",
                    "Named field officer and a site visit for every funded intervention",
                    "Donations and grants reported publicly in our News & Views and annual report",
                    "Zero tolerance on diversion: 12A & 80G, FCRA and POSH compliant operations"
                ];
                $pRow['commitments_json'] = json_encode($defaultCommitments, JSON_UNESCAPED_UNICODE);
            }
            if (empty($pRow['registration_json']) || $pRow['registration_json'] === '[]') {
                $defaultRegistration = [
                    ["label" => "Legal form", "value" => "Registered Society, Andhra Pradesh"],
                    ["label" => "Reg. No.", "value" => "307/2004"],
                    ["label" => "Tax status", "value" => "12A & 80G — donations tax-exempt"],
                    ["label" => "Foreign contributions", "value" => "FCRA-compliant institutional grants"],
                    ["label" => "Head office", "value" => "Vijayawada, Krishna District, Andhra Pradesh"]
                ];
                $pRow['registration_json'] = json_encode($defaultRegistration, JSON_UNESCAPED_UNICODE);
            }
            if (empty($pRow['registration_title'])) {
                $pRow['registration_title'] = "Registration & tax details";
            }
            if (empty($pRow['registration_note'])) {
                $pRow['registration_note'] = "Certificates, PAN, FCRA sanction and audited statements are shared on request against a signed enquiry. Full document list: [Downloads](/downloads).";
            }
        }

        // 2. Grievance Page & Submissions
        $gPage = $conn->query("SELECT * FROM grievance_page WHERE id = 1 LIMIT 1")->fetch(PDO::FETCH_ASSOC);
        if (!$gPage) {
            $defaultTypewriter = [
                "Polavaram Displaced Family (PDF) Housing Packages",
                "Adult Youth (18+) R&R Entitlement Claims",
                "Submergence Contour & Survey Rectifications",
                "Forest Land Rights (RoFR) Disposed Appeals",
                "Resettlement Colony Public Infrastructure Gaps"
            ];
            $defaultFullForms = [
                ["abbr" => "PDF", "full" => "Project Displaced Family", "desc" => "A family whose home or physical dwelling is acquired and displaced."],
                ["abbr" => "PAF", "full" => "Project Affected Family", "desc" => "A family whose livelihood or agricultural land is impacted by the project."],
                ["abbr" => "SDC", "full" => "Special Deputy Collector", "desc" => "The designated Land Acquisition & Resettlement Officer at sub-division level."],
                ["abbr" => "SLAO", "full" => "Special Land Acquisition Officer", "desc" => "Revenue officer presiding over award enquiries and compensation disbursement."],
                ["abbr" => "FRL", "full" => "Full Reservoir Level", "desc" => "Maximum water storage height (+45.72 Meters in Polavaram Dam)."],
                ["abbr" => "RoFR", "full" => "Recognition of Forest Rights", "desc" => "Statutory rights under the Scheduled Tribes Forest Rights Act 2006."]
            ];
            $stmtGP = $conn->prepare("INSERT INTO grievance_page (id, badge, title, subtitle, typewriter_json, form_title, form_subtitle, full_forms_json) 
                VALUES (1, 'Community Assistance', 'ALERT Grievance Redressal Portal', 
                'Dedicated platform for Project Affected Families (PAFs) and Displaced Families (PDFs) to lodge land, compensation, and R&R complaints.',
                :tw, 'Submit Grievance Representation', 'All representations are verified by Caseworkers and represented before the R&R Commissioner.', :ff)");
            $stmtGP->execute([
                ':tw' => json_encode($defaultTypewriter, JSON_UNESCAPED_UNICODE),
                ':ff' => json_encode($defaultFullForms, JSON_UNESCAPED_UNICODE)
            ]);
            $gPage = $conn->query("SELECT * FROM grievance_page WHERE id = 1 LIMIT 1")->fetch(PDO::FETCH_ASSOC);
        }
        if ($gPage) {
            $defaultGrievanceCategories = [
                ["value" => "R&R Package Entitlement", "label" => "R&R Package Entitlement", "desc" => "₹10 Lakh or House allotment"],
                ["value" => "Adult Youth Package", "label" => "Adult Youth (18+ Yrs) Package", "desc" => "Non-inclusion in entitlement roll"],
                ["value" => "Land Valuation / Award Issue", "label" => "Land Valuation / Low Compensation", "desc" => "Discrepancy in land award"],
                ["value" => "House / Structure Valuation", "label" => "House Structure Valuation", "desc" => "Structure measurement discrepancy"],
                ["value" => "Resettlement Colony Infrastructure", "label" => "R&R Colony Amenities", "desc" => "Water, power, access roads"],
                ["value" => "RoFR Forest Land Patta Issue", "label" => "RoFR Forest Land Patta", "desc" => "Title rejection or pending claim"]
            ];
            if (empty($gPage['categories_json']) || $gPage['categories_json'] === '[]') {
                $gPage['categories_json'] = json_encode($defaultGrievanceCategories, JSON_UNESCAPED_UNICODE);
            }
            if (empty($gPage['chart1_title'])) $gPage['chart1_title'] = "Official Grievance Categories Chart";
            if (empty($gPage['chart1_image'])) $gPage['chart1_image'] = "/uploads/grievance-types.png";
            if (empty($gPage['chart2_title'])) $gPage['chart2_title'] = "ALERT R&R Grievances Abstract";
            if (empty($gPage['chart2_image'])) $gPage['chart2_image'] = "/uploads/GRIEVANCE-ALL.png";
            if (empty($gPage['chart3_title'])) $gPage['chart3_title'] = "Land Rights Grievances Classification";
            if (empty($gPage['chart3_image'])) $gPage['chart3_image'] = "/uploads/LAND-RIGHTS.png";
            if (empty($gPage['faq_pdf_url'])) $gPage['faq_pdf_url'] = "/uploads/GREIVANCE-FAQ.pdf";
            if (empty($gPage['faq_pdf_label'])) $gPage['faq_pdf_label'] = "FAQ PDF";
            if (empty($gPage['form_title'])) $gPage['form_title'] = "Lodge a Land or R&R Grievance";
            if (empty($gPage['form_subtitle'])) $gPage['form_subtitle'] = "Provide accurate details as per your household ration card / patta documents.";
            if (empty($gPage['success_title'])) $gPage['success_title'] = "Grievance Registered Successfully";
            if (empty($gPage['success_desc'])) $gPage['success_desc'] = "Our legal and field caseworkers in Vijayawada will inspect the revenue records and follow up with the concerned Special Deputy Collector (SDC).";
        }

        $grievanceList = $conn->query("SELECT * FROM grievances ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);

        // 3. Downloads
        $downloadsList = $conn->query("SELECT id, category, title, file, meta, `desc`, file_size as fileSize, sort_order, is_active FROM site_downloads ORDER BY sort_order ASC, id ASC")->fetchAll(PDO::FETCH_ASSOC);
        if (count($downloadsList) === 0) {
            require_once __DIR__ . '/get_downloads.php';
            $downloadsList = $conn->query("SELECT id, category, title, file, meta, `desc`, file_size as fileSize, sort_order, is_active FROM site_downloads ORDER BY sort_order ASC, id ASC")->fetchAll(PDO::FETCH_ASSOC);
        }

        // 4. FAQs
        $faqsList = $conn->query("SELECT * FROM site_faqs ORDER BY sort_order ASC, id ASC")->fetchAll(PDO::FETCH_ASSOC);
        if (count($faqsList) === 0) {
            require_once __DIR__ . '/get_faqs.php';
            $faqsList = $conn->query("SELECT * FROM site_faqs ORDER BY sort_order ASC, id ASC")->fetchAll(PDO::FETCH_ASSOC);
        }

        // 5. Partner Dropdown Links
        $dropdownsList = $conn->query("SELECT * FROM partner_dropdowns ORDER BY sort_order ASC, id ASC")->fetchAll(PDO::FETCH_ASSOC);
        if (count($dropdownsList) === 0) {
            require_once __DIR__ . '/get_partner_dropdowns.php';
            $dropdownsList = $conn->query("SELECT * FROM partner_dropdowns ORDER BY sort_order ASC, id ASC")->fetchAll(PDO::FETCH_ASSOC);
        }

        partnerRespond([
            "success" => true,
            "partner_page" => $pRow,
            "grievance_page" => $gPage,
            "grievances" => $grievanceList,
            "downloads" => $downloadsList,
            "faqs" => $faqsList,
            "dropdowns" => $dropdownsList
        ]);
        break;

    // ── 1. PARTNER PAGE SAVE ────────────────────────────────────────────────
    case 'save_partner_page':
        $p = $inputData;
        $exists = (int)$conn->query("SELECT COUNT(*) FROM partner_page WHERE id = 1")->fetchColumn();
        if ($exists === 0) {
            $stmt = $conn->prepare("INSERT INTO partner_page 
                (id, badge, title, subtitle, intro_p1, intro_p2, hero_media_type, hero_media_url, hero_poster, contact_email, donate_btn_text, donate_btn_url, routes_badge, routes_title, routes_subtitle, routes_json, missions_badge, missions_title, missions_subtitle, missions_json, diligence_badge, diligence_title, diligence_subtitle, diligence_json, commitments_title, commitments_json, registration_title, registration_json, registration_note, cta_badge, cta_title, cta_subtitle, cta_email_subject, cta_donate_url)
                VALUES (1, :badge, :title, :subtitle, :intro_p1, :intro_p2, :hero_media_type, :hero_media_url, :hero_poster, :contact_email, :donate_btn_text, :donate_btn_url, :routes_badge, :routes_title, :routes_subtitle, :routes_json, :missions_badge, :missions_title, :missions_subtitle, :missions_json, :diligence_badge, :diligence_title, :diligence_subtitle, :diligence_json, :commitments_title, :commitments_json, :registration_title, :registration_json, :registration_note, :cta_badge, :cta_title, :cta_subtitle, :cta_email_subject, :cta_donate_url)");
        } else {
            $stmt = $conn->prepare("UPDATE partner_page SET 
                badge = :badge,
                title = :title,
                subtitle = :subtitle,
                intro_p1 = :intro_p1,
                intro_p2 = :intro_p2,
                hero_media_type = :hero_media_type,
                hero_media_url = :hero_media_url,
                hero_poster = :hero_poster,
                contact_email = :contact_email,
                donate_btn_text = :donate_btn_text,
                donate_btn_url = :donate_btn_url,
                routes_badge = :routes_badge,
                routes_title = :routes_title,
                routes_subtitle = :routes_subtitle,
                routes_json = :routes_json,
                missions_badge = :missions_badge,
                missions_title = :missions_title,
                missions_subtitle = :missions_subtitle,
                missions_json = :missions_json,
                diligence_badge = :diligence_badge,
                diligence_title = :diligence_title,
                diligence_subtitle = :diligence_subtitle,
                diligence_json = :diligence_json,
                commitments_title = :commitments_title,
                commitments_json = :commitments_json,
                registration_title = :registration_title,
                registration_json = :registration_json,
                registration_note = :registration_note,
                cta_badge = :cta_badge,
                cta_title = :cta_title,
                cta_subtitle = :cta_subtitle,
                cta_email_subject = :cta_email_subject,
                cta_donate_url = :cta_donate_url
                WHERE id = 1");
        }

        $stmt->execute([
            ':badge' => $p['badge'] ?? 'Section 01',
            ':title' => $p['title'] ?? 'Why Partner With ALERT',
            ':subtitle' => $p['subtitle'] ?? '',
            ':intro_p1' => $p['intro_p1'] ?? '',
            ':intro_p2' => $p['intro_p2'] ?? '',
            ':hero_media_type' => $p['hero_media_type'] ?? 'image',
            ':hero_media_url' => $p['hero_media_url'] ?? '',
            ':hero_poster' => $p['hero_poster'] ?? '',
            ':contact_email' => $p['contact_email'] ?? 'director@alertngo.in',
            ':donate_btn_text' => $p['donate_btn_text'] ?? 'Give Directly',
            ':donate_btn_url' => $p['donate_btn_url'] ?? '/donate',
            ':routes_badge' => $p['routes_badge'] ?? 'Section 02',
            ':routes_title' => $p['routes_title'] ?? 'Four Ways to Partner',
            ':routes_subtitle' => $p['routes_subtitle'] ?? '',
            ':routes_json' => is_string($p['routes_json'] ?? null) ? $p['routes_json'] : json_encode($p['routes_json'] ?? [], JSON_UNESCAPED_UNICODE),
            ':missions_badge' => $p['missions_badge'] ?? 'Section 03',
            ':missions_title' => $p['missions_title'] ?? 'Where Support Goes',
            ':missions_subtitle' => $p['missions_subtitle'] ?? '',
            ':missions_json' => is_string($p['missions_json'] ?? null) ? $p['missions_json'] : json_encode($p['missions_json'] ?? [], JSON_UNESCAPED_UNICODE),
            ':diligence_badge' => $p['diligence_badge'] ?? 'Section 04',
            ':diligence_title' => $p['diligence_title'] ?? 'Due Diligence & Statutory Records',
            ':diligence_subtitle' => $p['diligence_subtitle'] ?? '',
            ':diligence_json' => is_string($p['diligence_json'] ?? null) ? $p['diligence_json'] : json_encode($p['diligence_json'] ?? [], JSON_UNESCAPED_UNICODE),
            ':commitments_title' => $p['commitments_title'] ?? 'Our Institutional Commitments',
            ':commitments_json' => is_string($p['commitments_json'] ?? null) ? $p['commitments_json'] : json_encode($p['commitments_json'] ?? [], JSON_UNESCAPED_UNICODE),
            ':registration_title' => $p['registration_title'] ?? 'Registration & tax details',
            ':registration_json' => is_string($p['registration_json'] ?? null) ? $p['registration_json'] : json_encode($p['registration_json'] ?? [], JSON_UNESCAPED_UNICODE),
            ':registration_note' => $p['registration_note'] ?? '',
            ':cta_badge' => $p['cta_badge'] ?? 'Partnership',
            ':cta_title' => $p['cta_title'] ?? 'Begin a Conversation With Us',
            ':cta_subtitle' => $p['cta_subtitle'] ?? '',
            ':cta_email_subject' => $p['cta_email_subject'] ?? 'Partnership enquiry to ALERT',
            ':cta_donate_url' => $p['cta_donate_url'] ?? '/donate'
        ]);

        partnerRespond(["success" => true, "message" => "Partner page updated successfully!"]);
        break;

    // ── 2. GRIEVANCE PAGE & SUBMISSIONS ──────────────────────────────────────
    case 'save_grievance_page':
        $gp = $inputData;
        $existsG = (int)$conn->query("SELECT COUNT(*) FROM grievance_page WHERE id = 1")->fetchColumn();
        if ($existsG === 0) {
            $stmt = $conn->prepare("INSERT INTO grievance_page 
                (id, badge, title, subtitle, typewriter_json, form_title, form_subtitle, categories_json, full_forms_json, charts_json, chart1_title, chart1_image, chart2_title, chart2_image, chart3_title, chart3_image, faq_pdf_url, faq_pdf_label, hero_image, success_title, success_desc)
                VALUES (1, :badge, :title, :subtitle, :typewriter_json, :form_title, :form_subtitle, :categories_json, :full_forms_json, :charts_json, :chart1_title, :chart1_image, :chart2_title, :chart2_image, :chart3_title, :chart3_image, :faq_pdf_url, :faq_pdf_label, :hero_image, :success_title, :success_desc)");
        } else {
            $stmt = $conn->prepare("UPDATE grievance_page SET 
                badge = :badge,
                title = :title,
                subtitle = :subtitle,
                typewriter_json = :typewriter_json,
                form_title = :form_title,
                form_subtitle = :form_subtitle,
                categories_json = :categories_json,
                full_forms_json = :full_forms_json,
                charts_json = :charts_json,
                chart1_title = :chart1_title,
                chart1_image = :chart1_image,
                chart2_title = :chart2_title,
                chart2_image = :chart2_image,
                chart3_title = :chart3_title,
                chart3_image = :chart3_image,
                faq_pdf_url = :faq_pdf_url,
                faq_pdf_label = :faq_pdf_label,
                hero_image = :hero_image,
                success_title = :success_title,
                success_desc = :success_desc
                WHERE id = 1");
        }

        $stmt->execute([
            ':badge' => $gp['badge'] ?? 'Community Assistance',
            ':title' => $gp['title'] ?? 'ALERT Grievance Redressal Portal',
            ':subtitle' => $gp['subtitle'] ?? '',
            ':typewriter_json' => is_string($gp['typewriter_json'] ?? null) ? $gp['typewriter_json'] : json_encode($gp['typewriter_json'] ?? [], JSON_UNESCAPED_UNICODE),
            ':form_title' => $gp['form_title'] ?? 'Lodge a Land or R&R Grievance',
            ':form_subtitle' => $gp['form_subtitle'] ?? '',
            ':categories_json' => is_string($gp['categories_json'] ?? null) ? $gp['categories_json'] : json_encode($gp['categories_json'] ?? [], JSON_UNESCAPED_UNICODE),
            ':full_forms_json' => is_string($gp['full_forms_json'] ?? null) ? $gp['full_forms_json'] : json_encode($gp['full_forms_json'] ?? [], JSON_UNESCAPED_UNICODE),
            ':charts_json' => is_string($gp['charts_json'] ?? null) ? $gp['charts_json'] : json_encode($gp['charts_json'] ?? [], JSON_UNESCAPED_UNICODE),
            ':chart1_title' => $gp['chart1_title'] ?? 'Official Grievance Categories Chart',
            ':chart1_image' => $gp['chart1_image'] ?? '/uploads/grievance-types.png',
            ':chart2_title' => $gp['chart2_title'] ?? 'ALERT R&R Grievances Abstract',
            ':chart2_image' => $gp['chart2_image'] ?? '/uploads/GRIEVANCE-ALL.png',
            ':chart3_title' => $gp['chart3_title'] ?? 'Land Rights Grievances Classification',
            ':chart3_image' => $gp['chart3_image'] ?? '/uploads/LAND-RIGHTS.png',
            ':faq_pdf_url' => $gp['faq_pdf_url'] ?? '/uploads/GREIVANCE-FAQ.pdf',
            ':faq_pdf_label' => $gp['faq_pdf_label'] ?? 'FAQ PDF',
            ':hero_image' => $gp['hero_image'] ?? '',
            ':success_title' => $gp['success_title'] ?? 'Grievance Registered Successfully',
            ':success_desc' => $gp['success_desc'] ?? 'Our legal and field caseworkers in Vijayawada will inspect the revenue records and follow up with the concerned Special Deputy Collector (SDC).'
        ]);
        partnerRespond(["success" => true, "message" => "Grievance portal settings updated!"]);
        break;

    case 'update_grievance':
        $gid = (int)($inputData['id'] ?? 0);
        if (!$gid) partnerRespond(["success" => false, "message" => "Grievance ID is required"], 400);

        $stmt = $conn->prepare("UPDATE grievances SET 
            status = :status,
            admin_remarks = :admin_remarks
            WHERE id = :id");
        $stmt->execute([
            ':status' => $inputData['status'] ?? 'registered',
            ':admin_remarks' => $inputData['admin_remarks'] ?? '',
            ':id' => $gid
        ]);
        partnerRespond(["success" => true, "message" => "Grievance status and remarks updated!"]);
        break;

    case 'delete_grievance':
        $gid = (int)($inputData['id'] ?? ($_GET['id'] ?? 0));
        if (!$gid) partnerRespond(["success" => false, "message" => "Grievance ID is required"], 400);

        $stmt = $conn->prepare("DELETE FROM grievances WHERE id = :id");
        $stmt->execute([':id' => $gid]);
        partnerRespond(["success" => true, "message" => "Grievance record deleted."]);
        break;

    // ── 3. DOWNLOADS CRUD ────────────────────────────────────────────────────
    case 'save_download':
        $d = $inputData;
        $did = !empty($d['id']) ? (int)$d['id'] : null;

        if (empty($d['title']) || empty($d['file'])) {
            partnerRespond(["success" => false, "message" => "Document title and PDF file URL are required."], 400);
        }

        if ($did) {
            $stmt = $conn->prepare("UPDATE site_downloads SET 
                category = :category,
                title = :title,
                file = :file,
                meta = :meta,
                `desc` = :desc,
                file_size = :file_size,
                sort_order = :sort_order,
                is_active = :is_active
                WHERE id = :id");
            $stmt->execute([
                ':category' => trim($d['category'] ?? 'acts'),
                ':title' => trim($d['title']),
                ':file' => trim($d['file']),
                ':meta' => trim($d['meta'] ?? ''),
                ':desc' => trim($d['desc'] ?? ''),
                ':file_size' => trim($d['file_size'] ?? ($d['fileSize'] ?? 'Official PDF')),
                ':sort_order' => (int)($d['sort_order'] ?? 0),
                ':is_active' => isset($d['is_active']) ? (int)$d['is_active'] : 1,
                ':id' => $did
            ]);
            partnerRespond(["success" => true, "message" => "Document updated successfully!", "id" => $did]);
        } else {
            $stmt = $conn->prepare("INSERT INTO site_downloads 
                (category, title, file, meta, `desc`, file_size, sort_order, is_active)
                VALUES (:category, :title, :file, :meta, :desc, :file_size, :sort_order, :is_active)");
            $stmt->execute([
                ':category' => trim($d['category'] ?? 'acts'),
                ':title' => trim($d['title']),
                ':file' => trim($d['file']),
                ':meta' => trim($d['meta'] ?? ''),
                ':desc' => trim($d['desc'] ?? ''),
                ':file_size' => trim($d['file_size'] ?? ($d['fileSize'] ?? 'Official PDF')),
                ':sort_order' => (int)($d['sort_order'] ?? 0),
                ':is_active' => isset($d['is_active']) ? (int)$d['is_active'] : 1
            ]);
            $newId = (int)$conn->lastInsertId();
            partnerRespond(["success" => true, "message" => "Document added successfully!", "id" => $newId]);
        }
        break;

    case 'delete_download':
        $did = (int)($inputData['id'] ?? ($_GET['id'] ?? 0));
        if (!$did) partnerRespond(["success" => false, "message" => "Valid ID is required."], 400);

        $stmt = $conn->prepare("DELETE FROM site_downloads WHERE id = :id");
        $stmt->execute([':id' => $did]);
        partnerRespond(["success" => true, "message" => "Document deleted."]);
        break;

    case 'toggle_download_active':
        $did = (int)($inputData['id'] ?? 0);
        $active = !empty($inputData['is_active']) ? 1 : 0;
        $stmt = $conn->prepare("UPDATE site_downloads SET is_active = :active WHERE id = :id");
        $stmt->execute([':active' => $active, ':id' => $did]);
        partnerRespond(["success" => true, "message" => "Document status updated."]);
        break;

    // ── 4. FAQS CRUD ─────────────────────────────────────────────────────────
    case 'save_faq':
        $f = $inputData;
        $fid = !empty($f['id']) ? (int)$f['id'] : null;

        if (empty($f['q']) || empty($f['a'])) {
            partnerRespond(["success" => false, "message" => "Question and Answer are required."], 400);
        }

        if ($fid) {
            $stmt = $conn->prepare("UPDATE site_faqs SET 
                category = :category,
                q = :q,
                a = :a,
                sort_order = :sort_order,
                is_active = :is_active
                WHERE id = :id");
            $stmt->execute([
                ':category' => trim($f['category'] ?? 'General'),
                ':q' => trim($f['q']),
                ':a' => trim($f['a']),
                ':sort_order' => (int)($f['sort_order'] ?? 0),
                ':is_active' => isset($f['is_active']) ? (int)$f['is_active'] : 1,
                ':id' => $fid
            ]);
            partnerRespond(["success" => true, "message" => "FAQ updated successfully!", "id" => $fid]);
        } else {
            $stmt = $conn->prepare("INSERT INTO site_faqs (category, q, a, sort_order, is_active) 
                VALUES (:category, :q, :a, :sort_order, :is_active)");
            $stmt->execute([
                ':category' => trim($f['category'] ?? 'General'),
                ':q' => trim($f['q']),
                ':a' => trim($f['a']),
                ':sort_order' => (int)($f['sort_order'] ?? 0),
                ':is_active' => isset($f['is_active']) ? (int)$f['is_active'] : 1
            ]);
            $newId = (int)$conn->lastInsertId();
            partnerRespond(["success" => true, "message" => "FAQ added successfully!", "id" => $newId]);
        }
        break;

    case 'delete_faq':
        $fid = (int)($inputData['id'] ?? ($_GET['id'] ?? 0));
        if (!$fid) partnerRespond(["success" => false, "message" => "Valid FAQ ID is required."], 400);

        $stmt = $conn->prepare("DELETE FROM site_faqs WHERE id = :id");
        $stmt->execute([':id' => $fid]);
        partnerRespond(["success" => true, "message" => "FAQ deleted."]);
        break;

    case 'toggle_faq_active':
        $fid = (int)($inputData['id'] ?? 0);
        $active = !empty($inputData['is_active']) ? 1 : 0;
        $stmt = $conn->prepare("UPDATE site_faqs SET is_active = :active WHERE id = :id");
        $stmt->execute([':active' => $active, ':id' => $fid]);
        partnerRespond(["success" => true, "message" => "FAQ status updated."]);
        break;

    // ── 5. NAVBAR DROPDOWNS CRUD ─────────────────────────────────────────────
    case 'save_dropdown':
        $dd = $inputData;
        $ddId = !empty($dd['id']) ? (int)$dd['id'] : null;

        if (empty($dd['label']) || empty($dd['path'])) {
            partnerRespond(["success" => false, "message" => "Dropdown item label and path are required."], 400);
        }

        $subJson = is_string($dd['sub_items_json'] ?? null) ? $dd['sub_items_json'] : json_encode($dd['sub_items_json'] ?? [], JSON_UNESCAPED_UNICODE);

        if ($ddId) {
            $stmt = $conn->prepare("UPDATE partner_dropdowns SET 
                parent_label = :parent_label,
                section = :section,
                label = :label,
                path = :path,
                sub_items_json = :sub_items_json,
                sort_order = :sort_order,
                is_active = :is_active
                WHERE id = :id");
            $stmt->execute([
                ':parent_label' => trim($dd['parent_label'] ?? 'Partner with us'),
                ':section' => trim($dd['section'] ?? 'Main'),
                ':label' => trim($dd['label']),
                ':path' => trim($dd['path']),
                ':sub_items_json' => $subJson,
                ':sort_order' => (int)($dd['sort_order'] ?? 0),
                ':is_active' => isset($dd['is_active']) ? (int)$dd['is_active'] : 1,
                ':id' => $ddId
            ]);
            partnerRespond(["success" => true, "message" => "Dropdown item updated!", "id" => $ddId]);
        } else {
            $stmt = $conn->prepare("INSERT INTO partner_dropdowns 
                (parent_label, section, label, path, sub_items_json, sort_order, is_active)
                VALUES (:parent_label, :section, :label, :path, :sub_items_json, :sort_order, :is_active)");
            $stmt->execute([
                ':parent_label' => trim($dd['parent_label'] ?? 'Partner with us'),
                ':section' => trim($dd['section'] ?? 'Main'),
                ':label' => trim($dd['label']),
                ':path' => trim($dd['path']),
                ':sub_items_json' => $subJson,
                ':sort_order' => (int)($dd['sort_order'] ?? 0),
                ':is_active' => isset($dd['is_active']) ? (int)$dd['is_active'] : 1
            ]);
            $newId = (int)$conn->lastInsertId();
            partnerRespond(["success" => true, "message" => "Dropdown item created!", "id" => $newId]);
        }
        break;

    case 'delete_dropdown':
        $ddId = (int)($inputData['id'] ?? ($_GET['id'] ?? 0));
        if (!$ddId) partnerRespond(["success" => false, "message" => "Valid ID is required."], 400);

        $stmt = $conn->prepare("DELETE FROM partner_dropdowns WHERE id = :id");
        $stmt->execute([':id' => $ddId]);
        partnerRespond(["success" => true, "message" => "Dropdown item deleted."]);
        break;

    case 'toggle_dropdown_active':
        $ddId = (int)($inputData['id'] ?? 0);
        $active = !empty($inputData['is_active']) ? 1 : 0;
        $stmt = $conn->prepare("UPDATE partner_dropdowns SET is_active = :active WHERE id = :id");
        $stmt->execute([':active' => $active, ':id' => $ddId]);
        partnerRespond(["success" => true, "message" => "Dropdown item visibility updated."]);
        break;

    case 'seed_defaults':
        // Restore all default files & items
        $conn->exec("TRUNCATE TABLE partner_page");
        $conn->exec("TRUNCATE TABLE site_downloads");
        $conn->exec("TRUNCATE TABLE site_faqs");
        $conn->exec("TRUNCATE TABLE partner_dropdowns");

        require_once __DIR__ . '/get_partner.php';
        require_once __DIR__ . '/get_downloads.php';
        require_once __DIR__ . '/get_faqs.php';
        require_once __DIR__ . '/get_partner_dropdowns.php';

        partnerRespond(["success" => true, "message" => "All Partner with Us pages, downloads, FAQs, and dropdowns restored to factory defaults!"]);
        break;

    default:
        partnerRespond(["success" => false, "message" => "Unknown action: " . $action], 400);
}

