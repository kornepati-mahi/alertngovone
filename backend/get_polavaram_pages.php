<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$polavaramSlugs = [
    'legislative-acts-2',
    'submergence-area-map',
    'chronological-order-of-pip-progress',
    'issues-of-pip',
    'polavaram-project-authority-minutes',
    'slmc-meetings',
    'review-meeting-presentations-on-pip'
];

$defaultNavLabels = [
    'legislative-acts-2' => 'Polavaram Project',
    'submergence-area-map' => 'Submergence Map',
    'chronological-order-of-pip-progress' => 'PIP Progress',
    'issues-of-pip' => 'PIP Issues',
    'polavaram-project-authority-minutes' => 'PPA Minutes',
    'slmc-meetings' => 'SLMC Meetings',
    'review-meeting-presentations-on-pip' => 'PIP Review'
];

function ensurePolavaramTable($conn, $polavaramSlugs, $defaultNavLabels) {
    if (!$conn) return;

    $conn->exec("CREATE TABLE IF NOT EXISTS polavaram_pages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(150) NOT NULL UNIQUE,
        nav_label VARCHAR(150) NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'Polavaram Project',
        badge VARCHAR(100) DEFAULT 'Polavaram PIP',
        subtitle TEXT NULL,
        content_json LONGTEXT NOT NULL,
        sort_order INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $count = (int)$conn->query("SELECT COUNT(*) FROM polavaram_pages")->fetchColumn();
    if ($count === 0) {
        $dataFile = __DIR__ . '/../frontend/src/data/all_site_pages.json';
        $sitePages = [];
        if (file_exists($dataFile)) {
            $sitePages = json_decode(file_get_contents($dataFile), true) ?: [];
        }

        $stmt = $conn->prepare("INSERT INTO polavaram_pages (slug, nav_label, title, category, badge, subtitle, content_json, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)");

        foreach ($polavaramSlugs as $order => $slug) {
            $pageData = $sitePages[$slug] ?? null;
            $navLabel = $defaultNavLabels[$slug] ?? ucwords(str_replace('-', ' ', $slug));
            $title = $pageData['title'] ?? $navLabel;
            $category = $pageData['category'] ?? 'Polavaram Project';
            $badge = 'Polavaram PIP';
            $subtitle = '';

            if ($slug === 'submergence-area-map') {
                $subtitle = 'Detailed contour submergence elevation map (41.15m & 45.72m) across Godavari tribal habitations.';
            } elseif ($slug === 'legislative-acts-2') {
                $subtitle = 'Statutory legislative acts and official policies safeguarding displaced Adivasi communities.';
            } elseif ($slug === 'issues-of-pip') {
                $subtitle = 'Analytical brief on submergence contour errors, youth package exclusions, and colony infrastructure.';
            } elseif ($slug === 'polavaram-project-authority-minutes') {
                $subtitle = 'Official quarterly minutes and proceedings of the Polavaram Project Authority.';
            } elseif ($slug === 'slmc-meetings') {
                $subtitle = 'State Level Monitoring Committee proceedings and R&R Commissioner review meetings.';
            } elseif ($slug === 'review-meeting-presentations-on-pip') {
                $subtitle = 'High-level review presentations by Water Resources Department and Commissioner of R&R.';
            } elseif ($slug === 'chronological-order-of-pip-progress') {
                $subtitle = 'Chronological order of milestones, approvals, technical clearances, and resettlement events.';
            }

            // Normalise downloads paths to /uploads/polavaram/ where possible
            if (!empty($pageData['downloads'])) {
                foreach ($pageData['downloads'] as &$d) {
                    if (!empty($d['url']) && strpos($d['url'], '/uploads/') === 0 && strpos($d['url'], '/uploads/polavaram/') === false) {
                        $baseName = basename($d['url']);
                        $d['url'] = "/uploads/polavaram/{$baseName}";
                    }
                }
                unset($d);
            }

            // If submergence map, ensure image path points to /uploads/polavaram/
            if ($slug === 'submergence-area-map') {
                $pageData['images'] = [
                    [
                        "url" => "/uploads/polavaram/submergence-area-map-1.jpg",
                        "alt" => "Submergence Area Map",
                        "caption" => "Polavaram National Project Submergence Map"
                    ]
                ];
            }

            $contentJson = json_encode([
                "paragraphs" => $pageData['paragraphs'] ?? [],
                "downloads" => $pageData['downloads'] ?? [],
                "tables" => $pageData['tables'] ?? [],
                "images" => $pageData['images'] ?? []
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

$requestedSlug = isset($_GET['slug']) ? trim($_GET['slug']) : '';

if ($conn) {
    try {
        ensurePolavaramTable($conn, $polavaramSlugs, $defaultNavLabels);

        if ($requestedSlug !== '') {
            $stmt = $conn->prepare("SELECT id, slug, nav_label, title, category, badge, subtitle, content_json, sort_order, is_active FROM polavaram_pages WHERE slug = ? OR LOWER(slug) = LOWER(?) LIMIT 1");
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
            $stmt = $conn->query("SELECT id, slug, nav_label, title, category, badge, subtitle, content_json, sort_order, is_active FROM polavaram_pages WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
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
foreach ($polavaramSlugs as $idx => $s) {
    $p = $sitePages[$s] ?? [];
    $fbList[] = [
        "id" => $idx + 1,
        "slug" => $s,
        "nav_label" => $defaultNavLabels[$s] ?? $s,
        "title" => $p['title'] ?? $s,
        "downloads_count" => count($p['downloads'] ?? []),
        "tables_count" => count($p['tables'] ?? []),
        "images_count" => count($p['images'] ?? []),
        "sort_order" => $idx + 1,
        "is_active" => 1,
        "content" => $p
    ];
}

echo json_encode(["success" => true, "data" => $fbList]);

