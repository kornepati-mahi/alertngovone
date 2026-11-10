<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$larrSlugs = [
    'la-rr',
    'land-acquisition-la',
    'la-flow-chart',
    'la-act-2013-3-schdules',
    'la-rr-status',
    'cases',
    'cases-rr-commissioner-office',
    'legal-compliances',
    'high-court-cases-wg',
    'high-court-cases-eg',
    'rr-package',
    'rr-colony-layouts',
    'submergence-villages-abstract',
    'dprs',
    'award-copies',
    'housing-colonies-construction-status'
];

$defaultNavLabels = [
    'la-rr' => 'Polavaram LA & RR',
    'land-acquisition-la' => 'Land Acquisition',
    'la-flow-chart' => 'LA Flow Chart',
    'la-act-2013-3-schdules' => 'LA Act 2013 Schedules',
    'la-rr-status' => 'LA & RR Status',
    'cases' => 'Court Cases',
    'cases-rr-commissioner-office' => 'R&R Commissioner',
    'legal-compliances' => 'Cases @ LA & RR Court',
    'high-court-cases-wg' => 'High Court WG',
    'high-court-cases-eg' => 'High Court EG',
    'rr-package' => 'RR Packages',
    'rr-colony-layouts' => 'R&R Colony Layouts',
    'submergence-villages-abstract' => 'Submergence Villages',
    'dprs' => "DPR's",
    'award-copies' => 'Award Copies',
    'housing-colonies-construction-status' => 'Housing Colonies'
];

function ensureLaRrTable($conn, $larrSlugs, $defaultNavLabels) {
    if (!$conn) return;

    $conn->exec("CREATE TABLE IF NOT EXISTS la_rr_pages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(150) NOT NULL UNIQUE,
        nav_label VARCHAR(150) NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'LA & RR',
        badge VARCHAR(100) DEFAULT 'LA & RR Project',
        subtitle TEXT NULL,
        content_json LONGTEXT NOT NULL,
        sort_order INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $count = (int)$conn->query("SELECT COUNT(*) FROM la_rr_pages")->fetchColumn();
    if ($count < count($larrSlugs)) {
        $dataFile = __DIR__ . '/../frontend/src/data/all_site_pages.json';
        $sitePages = [];
        if (file_exists($dataFile)) {
            $sitePages = json_decode(file_get_contents($dataFile), true) ?: [];
        }

        $stmt = $conn->prepare("INSERT INTO la_rr_pages (slug, nav_label, title, category, badge, subtitle, content_json, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE nav_label = VALUES(nav_label)");

        foreach ($larrSlugs as $order => $slug) {
            $pageData = $sitePages[$slug] ?? null;
            $navLabel = $defaultNavLabels[$slug] ?? ucwords(str_replace('-', ' ', $slug));
            $title = $pageData['title'] ?? $navLabel;
            $category = 'LA & RR';
            $badge = 'LA & RR Project';
            $subtitle = $pageData['subtitle'] ?? '';

            if (!$subtitle) {
                if ($slug === 'la-rr') {
                    $subtitle = 'Official statutory records, court compliances, schedules, and rehabilitation entitlements for displaced tribal families.';
                } elseif ($slug === 'land-acquisition-la') {
                    $subtitle = 'Statutory Land Acquisition procedures, flow charts, and status across agency tracts.';
                } elseif ($slug === 'la-flow-chart') {
                    $subtitle = 'Step-by-step procedural workflow for notification, declaration, award inquiry, and compensation.';
                } elseif ($slug === 'la-act-2013-3-schdules') {
                    $subtitle = 'Mandatory statutory compensation, R&R entitlements, and 25 colony infrastructure amenities.';
                } elseif ($slug === 'la-rr-status') {
                    $subtitle = 'Official habitation-wise physical and financial progress reports of PIP rehabilitation.';
                } elseif ($slug === 'cases') {
                    $subtitle = 'Judicial litigation, writ petitions, and statutory appeals safeguarding displaced families.';
                } elseif ($slug === 'cases-rr-commissioner-office') {
                    $subtitle = 'Official statutory claims and appeals before the Commissioner of Rehabilitation & Resettlement.';
                } elseif ($slug === 'legal-compliances') {
                    $subtitle = 'Cases before the Land Acquisition, Rehabilitation and Resettlement Authority (LA & RR Court).';
                } elseif ($slug === 'high-court-cases-wg') {
                    $subtitle = 'Pending writ petitions before the High Court of Andhra Pradesh for West Godavari Agency.';
                } elseif ($slug === 'high-court-cases-eg') {
                    $subtitle = 'Pending writ petitions before the High Court of Andhra Pradesh for East Godavari Agency.';
                } elseif ($slug === 'rr-package') {
                    $subtitle = 'Comprehensive financial and physical R&R package components for project affected families.';
                } elseif ($slug === 'rr-colony-layouts') {
                    $subtitle = 'Approved layout plans and civic amenity distributions in resettlement colonies.';
                } elseif ($slug === 'submergence-villages-abstract') {
                    $subtitle = 'Abstract of submerged habitations, surveyed survey numbers, and affected households.';
                } elseif ($slug === 'dprs') {
                    $subtitle = 'Detailed Project Reports, technical sanction proceedings, and administrative approvals.';
                } elseif ($slug === 'award-copies') {
                    $subtitle = 'Official land valuation, structure assessment, and compensation award decrees.';
                } elseif ($slug === 'housing-colonies-construction-status') {
                    $subtitle = 'Physical construction progress of houses, drinking water, roads, and power infrastructure.';
                }
            }

            $contentJson = json_encode([
                "slug" => $slug,
                "title" => $title,
                "nav_label" => $navLabel,
                "category" => $category,
                "badge" => $badge,
                "subtitle" => $subtitle,
                "paragraphs" => $pageData['paragraphs'] ?? [],
                "downloads" => $pageData['downloads'] ?? [],
                "tables" => $pageData['tables'] ?? [],
                "images" => $pageData['images'] ?? [],
                "videos" => $pageData['videos'] ?? []
            ], JSON_UNESCAPED_UNICODE);

            $stmt->execute([
                $slug,
                $navLabel,
                $title,
                $category,
                $badge,
                $subtitle,
                $contentJson,
                $order + 1
            ]);
        }
    }
}

// When included by another script, only define the helper function above.
if (basename(__FILE__) !== basename($_SERVER['SCRIPT_NAME'] ?? '')) {
    return;
}

$requestedSlug = isset($_GET['slug']) ? trim($_GET['slug']) : '';

if ($conn) {
    try {
        ensureLaRrTable($conn, $larrSlugs, $defaultNavLabels);

        if ($requestedSlug !== '') {
            $stmt = $conn->prepare("SELECT * FROM la_rr_pages WHERE (slug = ? OR LOWER(slug) = LOWER(?)) AND is_active = 1 LIMIT 1");
            $stmt->execute([$requestedSlug, $requestedSlug]);
            $row = $stmt->fetch();

            if ($row) {
                $content = json_decode($row['content_json'] ?? '{}', true) ?: [];
                $resData = [
                    "id" => (int)$row['id'],
                    "slug" => $row['slug'],
                    "nav_label" => $row['nav_label'],
                    "title" => $row['title'],
                    "category" => $row['category'],
                    "badge" => $row['badge'],
                    "subtitle" => $row['subtitle'],
                    "paragraphs" => $content['paragraphs'] ?? [],
                    "downloads" => $content['downloads'] ?? [],
                    "tables" => $content['tables'] ?? [],
                    "images" => $images,
                    "videos" => $content['videos'] ?? [],
                    "stats" => $content['stats'] ?? [],
                    "sort_order" => (int)$row['sort_order'],
                    "is_active" => (int)$row['is_active'],
                    "content" => [
                        "slug" => $row['slug'],
                        "title" => $row['title'],
                        "nav_label" => $row['nav_label'],
                        "category" => $row['category'],
                        "badge" => $row['badge'],
                        "subtitle" => $row['subtitle'],
                        "paragraphs" => $content['paragraphs'] ?? [],
                        "downloads" => $content['downloads'] ?? [],
                        "tables" => $content['tables'] ?? [],
                        "images" => $images,
                        "videos" => $content['videos'] ?? [],
                        "stats" => $content['stats'] ?? []
                    ]
                ];

                echo json_encode(["success" => true, "data" => $resData]);
                exit;
            }
        } else {
            // List all pages
            $stmt = $conn->query("SELECT id, slug, nav_label, title, category, badge, subtitle, content_json, sort_order, is_active FROM la_rr_pages WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
            $rows = $stmt->fetchAll();

            $list = [];
            foreach ($rows as $r) {
                $content = json_decode($r['content_json'] ?? '{}', true) ?: [];
                $list[] = [
                    "id" => (int)$r['id'],
                    "slug" => $r['slug'],
                    "nav_label" => $r['nav_label'],
                    "title" => $r['title'],
                    "category" => $r['category'],
                    "badge" => $r['badge'],
                    "subtitle" => $r['subtitle'],
                    "paragraphs" => $content['paragraphs'] ?? [],
                    "downloads" => $content['downloads'] ?? [],
                    "tables" => $content['tables'] ?? [],
                    "images" => $content['images'] ?? [],
                    "videos" => $content['videos'] ?? [],
                    "stats" => $content['stats'] ?? [],
                    "downloads_count" => count($content['downloads'] ?? []),
                    "tables_count" => count($content['tables'] ?? []),
                    "images_count" => count($content['images'] ?? []),
                    "videos_count" => count($content['videos'] ?? []),
                    "stats_count" => count($content['stats'] ?? []),
                    "sort_order" => (int)$r['sort_order'],
                    "is_active" => (int)$r['is_active'],
                    "content" => $content
                ];
            }

            echo json_encode(["success" => true, "data" => $list]);
            exit;
        }
    } catch (PDOException $e) {
        // Fallback to static data
    }
}

// Fallback if DB unavailable
$dataFile = __DIR__ . '/../frontend/src/data/all_site_pages.json';
$sitePages = file_exists($dataFile) ? (json_decode(file_get_contents($dataFile), true) ?: []) : [];

if ($requestedSlug !== '') {
    $matched = $sitePages[$requestedSlug] ?? null;
    if ($matched) {
        echo json_encode(["success" => true, "data" => $matched]);
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Page not found"]);
    }
    exit;
}

$fbList = [];
foreach ($larrSlugs as $idx => $s) {
    $p = $sitePages[$s] ?? [];
    $fbList[] = [
        "id" => $idx + 1,
        "slug" => $s,
        "nav_label" => $defaultNavLabels[$s] ?? $s,
        "title" => $p['title'] ?? $s,
        "downloads" => $p['downloads'] ?? [],
        "tables" => $p['tables'] ?? [],
        "images" => $p['images'] ?? [],
        "videos" => $p['videos'] ?? [],
        "downloads_count" => count($p['downloads'] ?? []),
        "tables_count" => count($p['tables'] ?? []),
        "images_count" => count($p['images'] ?? []),
        "videos_count" => count($p['videos'] ?? []),
        "sort_order" => $idx + 1,
        "is_active" => 1,
        "content" => $p
    ];
}

echo json_encode(["success" => true, "data" => $fbList]);

