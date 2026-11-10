<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$floodSlugs = [
    'flood-relief-measures',
    '2023-2',
    'flood-relief-measures-2022',
    'flood-relief-measures-2021-2',
    'flood-relief-measures-2020',
    'blankets-distribution-in-east-godavari',
    'groceries-distribution-in-west-godavari'
];

$defaultNavLabels = [
    'flood-relief-measures' => 'Flood Relief Overview',
    '2023-2' => '2023',
    'flood-relief-measures-2022' => '2022',
    'flood-relief-measures-2021-2' => '2021',
    'flood-relief-measures-2020' => '2020',
    'blankets-distribution-in-east-godavari' => 'Blankets - East G.',
    'groceries-distribution-in-west-godavari' => 'Groceries - West G.'
];

function ensureFloodReliefTable($conn, $floodSlugs, $defaultNavLabels) {
    if (!$conn) return;

    $conn->exec("CREATE TABLE IF NOT EXISTS flood_relief_pages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(150) NOT NULL UNIQUE,
        nav_label VARCHAR(150) NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'Flood Relief',
        badge VARCHAR(100) DEFAULT 'Flood Relief Mission',
        subtitle TEXT NULL,
        content_json LONGTEXT NOT NULL,
        sort_order INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $dataFile = __DIR__ . '/../frontend/src/data/all_site_pages.json';
    $sitePages = [];
    if (file_exists($dataFile)) {
        $sitePages = json_decode(file_get_contents($dataFile), true) ?: [];
    }

    $checkStmt = $conn->prepare("SELECT id FROM flood_relief_pages WHERE slug = ? LIMIT 1");
    $insertStmt = $conn->prepare("INSERT INTO flood_relief_pages (slug, nav_label, title, category, badge, subtitle, content_json, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)");
    $maxOrder = (int)$conn->query("SELECT COALESCE(MAX(sort_order), 0) FROM flood_relief_pages")->fetchColumn();

    foreach ($floodSlugs as $order => $slug) {
        $checkStmt->execute([$slug]);
        if ($checkStmt->fetch()) {
            continue;
        }

        $pageData = $sitePages[$slug] ?? null;
        $navLabel = $defaultNavLabels[$slug] ?? ucwords(str_replace('-', ' ', $slug));
        $title = $pageData['title'] ?? $navLabel;
        $category = 'Flood Relief';
        $badge = 'Flood Relief Mission';
        $subtitle = $pageData['subtitle'] ?? '';

        $paragraphs = $pageData['paragraphs'] ?? [];
        $downloads = $pageData['downloads'] ?? [];
        $tables = $pageData['tables'] ?? [];
        $images = $pageData['images'] ?? [];
        $videos = $pageData['videos'] ?? [];

        // Filter out counter GIFs and logos from images
        $cleanImages = [];
        foreach ($images as $img) {
            $src = $img['src'] ?? ($img['url'] ?? '');
            if (
                strpos($src, 'wps-visitor-counter') === false &&
                !preg_match('/\.gif$/i', $src) &&
                strpos(strtolower($src), 'logo') === false
            ) {
                $cleanImages[] = [
                    'src' => $src,
                    'url' => $src,
                    'name' => $img['name'] ?? 'Flood Relief Photo',
                    'caption' => $img['caption'] ?? ($img['name'] ?? 'Flood Relief Photo')
                ];
            }
        }

        $contentJson = json_encode([
            'paragraphs' => $paragraphs,
            'downloads' => $downloads,
            'tables' => $tables,
            'images' => $cleanImages,
            'videos' => $videos
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        $maxOrder++;
        $insertStmt->execute([
            $slug,
            $navLabel,
            $title,
            $category,
            $badge,
            $subtitle,
            $contentJson,
            $order
        ]);
    }
}

if ($conn) {
    ensureFloodReliefTable($conn, $floodSlugs, $defaultNavLabels);
}

// 1. Single Page by Slug or ID
if (basename(__FILE__) !== basename($_SERVER['SCRIPT_NAME'] ?? '')) {
    return;
}

$requestedSlug = isset($_GET['slug']) ? trim($_GET['slug']) : '';
$requestedId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($requestedSlug !== '' || $requestedId > 0) {
    if ($conn) {
        $sql = $requestedId > 0
            ? "SELECT * FROM flood_relief_pages WHERE id = ? LIMIT 1"
            : "SELECT * FROM flood_relief_pages WHERE slug = ? OR LOWER(slug) = LOWER(?) LIMIT 1";
        $params = $requestedId > 0 ? [$requestedId] : [$requestedSlug, $requestedSlug];

        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();

        if ($row) {
            $content = json_decode($row['content_json'] ?? '{}', true) ?: [];
            $images = $content['images'] ?? [];

            $pageContent = array_merge($content, [
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
            ]);
            echo json_encode([
                "success" => true,
                "data" => array_merge($content, [
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
                    "content" => $pageContent
                ])
            ]);
            exit;
        }
    }

    // Fallback from JSON file
    $dataFile = __DIR__ . '/../frontend/src/data/all_site_pages.json';
    if (file_exists($dataFile)) {
        $sitePages = json_decode(file_get_contents($dataFile), true) ?: [];
        $cleanSlug = strtolower($requestedSlug);
        $page = $sitePages[$cleanSlug] ?? null;
        if (!$page) {
            foreach ($sitePages as $s => $p) {
                if (strtolower($p['slug'] ?? $s) === $cleanSlug) {
                    $page = $p;
                    break;
                }
            }
        }
        if ($page) {
            echo json_encode(["success" => true, "data" => $page]);
            exit;
        }
    }

    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Flood Relief page not found."]);
    exit;
}

// 2. List All Flood Relief Pages
if ($conn) {
    try {
        $stmt = $conn->query("SELECT id, slug, nav_label, title, category, badge, subtitle, content_json, sort_order, is_active FROM flood_relief_pages ORDER BY sort_order ASC, id ASC");
        $rows = $stmt->fetchAll();

        $list = [];
        foreach ($rows as $row) {
            $content = json_decode($row['content_json'] ?? '{}', true) ?: [];
            $images = $content['images'] ?? [];

            $pageContent = array_merge($content, [
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
            ]);
            $list[] = array_merge($content, [
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
                "downloads_count" => count($content['downloads'] ?? []),
                "tables_count" => count($content['tables'] ?? []),
                "images_count" => count($images),
                "videos_count" => count($content['videos'] ?? []),
                "stats" => $content['stats'] ?? [],
                "sort_order" => (int)$row['sort_order'],
                "is_active" => (int)$row['is_active'],
                "content" => $pageContent
            ]);
        }

        echo json_encode(["success" => true, "data" => $list]);
        exit;
    } catch (Exception $e) {
        // Fall back below
    }
}

// Fallback to static array
$dataFile = __DIR__ . '/../frontend/src/data/all_site_pages.json';
$list = [];
if (file_exists($dataFile)) {
    $sitePages = json_decode(file_get_contents($dataFile), true) ?: [];
    $idx = 1;
    foreach ($floodSlugs as $order => $slug) {
        $p = $sitePages[$slug] ?? null;
        if ($p) {
            $navLabel = $defaultNavLabels[$slug] ?? ucwords(str_replace('-', ' ', $slug));
            $list[] = [
                "id" => $idx++,
                "slug" => $p['slug'] ?? $slug,
                "nav_label" => $navLabel,
                "title" => $p['title'] ?? $navLabel,
                "category" => $p['category'] ?? "Flood Relief",
                "badge" => $p['badge'] ?? "Flood Relief Mission",
                "subtitle" => $p['subtitle'] ?? "",
                "paragraphs" => $p['paragraphs'] ?? [],
                "downloads" => $p['downloads'] ?? [],
                "tables" => $p['tables'] ?? [],
                "images" => $p['images'] ?? [],
                "videos" => $p['videos'] ?? [],
                "stats" => $p['stats'] ?? [],
                "downloads_count" => count($p['downloads'] ?? []),
                "tables_count" => count($p['tables'] ?? []),
                "images_count" => count($p['images'] ?? []),
                "videos_count" => count($p['videos'] ?? []),
                "stats_count" => count($p['stats'] ?? []),
                "sort_order" => $order,
                "is_active" => 1,
                "content" => $p
            ];
        }
    }
}

echo json_encode(["success" => true, "data" => $list]);
