<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$rofrSlugs = [
    'rofr',
    'abstract-rofr',
    'reasons-for-rejections',
    'compendium-of-judgements-rofr',
    'rofr-g-os',
    'ltr',
    'ltr-eluru',
    'ltr-disposal-meanings'
];

$defaultNavLabels = [
    'rofr' => 'RoFR & LTR Overview',
    'abstract-rofr' => 'Abstract RoFR',
    'reasons-for-rejections' => 'Rejection Reasons',
    'compendium-of-judgements-rofr' => 'RoFR Judgements',
    'rofr-g-os' => 'RoFR Rules-G.Os',
    'ltr' => 'LTR ASR',
    'ltr-eluru' => 'LTR ELURU',
    'ltr-disposal-meanings' => 'LTR Disposal'
];

function ensureRofrTable($conn, $rofrSlugs, $defaultNavLabels) {
    if (!$conn) return;

    $conn->exec("CREATE TABLE IF NOT EXISTS rofr_pages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(150) NOT NULL UNIQUE,
        nav_label VARCHAR(150) NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'RoFR & LTR',
        badge VARCHAR(100) DEFAULT 'RoFR & LTR Project',
        subtitle TEXT NULL,
        content_json LONGTEXT NOT NULL,
        sort_order INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $count = (int)$conn->query("SELECT COUNT(*) FROM rofr_pages")->fetchColumn();
    if ($count < count($rofrSlugs)) {
        $dataFile = __DIR__ . '/../frontend/src/data/all_site_pages.json';
        $sitePages = [];
        if (file_exists($dataFile)) {
            $sitePages = json_decode(file_get_contents($dataFile), true) ?: [];
        }

        $stmt = $conn->prepare("INSERT INTO rofr_pages (slug, nav_label, title, category, badge, subtitle, content_json, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE nav_label = VALUES(nav_label)");

        foreach ($rofrSlugs as $order => $slug) {
            $pageData = $sitePages[$slug] ?? null;
            $navLabel = $defaultNavLabels[$slug] ?? ucwords(str_replace('-', ' ', $slug));
            $title = $pageData['title'] ?? $navLabel;
            $category = 'RoFR & LTR';
            $badge = 'RoFR & LTR Project';
            $subtitle = $pageData['subtitle'] ?? '';

            if (!$subtitle) {
                if ($slug === 'rofr') {
                    $subtitle = 'Statutory forest rights, community forest titles, Land Transfer Regulations (LTR 1/70), and tribal safeguards.';
                } elseif ($slug === 'abstract-rofr') {
                    $subtitle = 'District-wise and mandal-wise abstract of RoFR claims submitted, titles recognized, and pending claims.';
                } elseif ($slug === 'reasons-for-rejections') {
                    $subtitle = 'Statistical analysis and legal breakdown of reasons for rejection of tribal forest rights claims.';
                } elseif ($slug === 'compendium-of-judgements-rofr') {
                    $subtitle = 'Compendium of landmark Supreme Court and High Court judgements on the Forest Rights Act 2006.';
                } elseif ($slug === 'rofr-g-os') {
                    $subtitle = 'Official Government Orders, statutory rules, operational guidelines, and convergence orders for RoFR.';
                } elseif ($slug === 'ltr') {
                    $subtitle = 'Land Transfer Regulation (LTR 1/70) implementation, case inquiries, and tribal restorations in Alluri Sitharama Raju.';
                } elseif ($slug === 'ltr-eluru') {
                    $subtitle = 'Land Transfer Regulation inquiries, disposals, and non-tribal ejectment decrees in Eluru district.';
                } elseif ($slug === 'ltr-disposal-meanings') {
                    $subtitle = 'Classification and statutory definitions of LTR case disposal categories and restitution procedures.';
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

if (basename(__FILE__) !== basename($_SERVER['SCRIPT_NAME'] ?? '')) {
    return;
}

$requestedSlug = isset($_GET['slug']) ? trim($_GET['slug']) : '';

if ($conn) {
    try {
        ensureRofrTable($conn, $rofrSlugs, $defaultNavLabels);

        if ($requestedSlug !== '') {
            $stmt = $conn->prepare("SELECT * FROM rofr_pages WHERE (slug = ? OR LOWER(slug) = LOWER(?)) AND is_active = 1 LIMIT 1");
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
                    "images" => $content['images'] ?? [],
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
                        "images" => $content['images'] ?? [],
                        "videos" => $content['videos'] ?? [],
                        "stats" => $content['stats'] ?? []
                    ]
                ];

                echo json_encode(["success" => true, "data" => $resData]);
                exit;
            }
        } else {
            // List all pages
            $stmt = $conn->query("SELECT id, slug, nav_label, title, category, badge, subtitle, content_json, sort_order, is_active FROM rofr_pages WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
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
foreach ($rofrSlugs as $idx => $s) {
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

