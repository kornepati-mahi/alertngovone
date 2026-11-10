<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

$achievementSlugs = [
    'achievements',
    'child-interventions',
    'child-bare-acts',
    'reports',
    'portfolio-3'
];

$defaultNavLabels = [
    'achievements' => 'Achievements Overview',
    'child-interventions' => 'Child Interventions',
    'child-bare-acts' => 'Child Bare Acts',
    'reports' => 'Reports',
    'portfolio-3' => 'PORTFOLIO'
];

function ensureAchievementsTable($conn, $achievementSlugs, $defaultNavLabels) {
    if (!$conn) return;

    $conn->exec("CREATE TABLE IF NOT EXISTS achievements_pages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(150) NOT NULL UNIQUE,
        nav_label VARCHAR(150) NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'Achievements',
        badge VARCHAR(100) DEFAULT 'Achievements & Impact',
        subtitle TEXT NULL,
        content_json LONGTEXT NOT NULL,
        sort_order INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        parent_slug VARCHAR(150) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    try {
        $cols = $conn->query("SHOW COLUMNS FROM achievements_pages LIKE 'parent_slug'")->fetchAll();
        if (!$cols || count($cols) === 0) {
            $conn->exec("ALTER TABLE achievements_pages ADD COLUMN parent_slug VARCHAR(150) DEFAULT '' AFTER is_active");
        }
    } catch (Exception $e) {}

    $count = (int)$conn->query("SELECT COUNT(*) FROM achievements_pages")->fetchColumn();
    if ($count < count($achievementSlugs)) {
        $dataFile = __DIR__ . '/../frontend/src/data/all_site_pages.json';
        $sitePages = [];
        if (file_exists($dataFile)) {
            $sitePages = json_decode(file_get_contents($dataFile), true) ?: [];
        }

        $stmt = $conn->prepare("INSERT INTO achievements_pages (slug, nav_label, title, category, badge, subtitle, content_json, sort_order, is_active, parent_slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?) ON DUPLICATE KEY UPDATE nav_label = VALUES(nav_label), parent_slug = IF(parent_slug = '' OR parent_slug IS NULL, VALUES(parent_slug), parent_slug)");

        foreach ($achievementSlugs as $order => $slug) {
            $pageData = $sitePages[$slug] ?? null;
            $navLabel = $defaultNavLabels[$slug] ?? ucwords(str_replace('-', ' ', $slug));
            $title = $pageData['title'] ?? $navLabel;
            $category = $pageData['category'] ?? 'Achievements';
            $badge = 'Achievements & Impact';
            $parentSlug = '';
            if ($slug === 'child-interventions') { $badge = 'Child Protection & Education'; $parentSlug = 'achievements'; }
            if ($slug === 'child-bare-acts') { $badge = 'Statutory Bare Acts'; $parentSlug = 'achievements'; }
            if ($slug === 'reports') { $badge = 'Annual & Field Reports'; $parentSlug = 'achievements'; }
            if ($slug === 'portfolio-3') { $badge = 'Organization Portfolio'; $parentSlug = 'achievements'; }

            $subtitle = $pageData['subtitle'] ?? '';

            $paragraphs = $pageData['paragraphs'] ?? [];
            $downloads = $pageData['downloads'] ?? [];
            $tables = $pageData['tables'] ?? [];
            $images = $pageData['images'] ?? [];
            $videos = $pageData['videos'] ?? [];

            // Clean images
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
                        'name' => $img['name'] ?? 'Achievement Media',
                        'caption' => $img['caption'] ?? ($img['name'] ?? 'Achievement Media')
                    ];
                }
            }

            // Default stats if none exist
            $stats = [];
            if ($slug === 'achievements') {
                $stats = [
                    ['value' => '3,452', 'label' => 'Farmers Supported (APCBTM Tank Project)'],
                    ['value' => '495', 'label' => 'Child Labourers Mainstreamed'],
                    ['value' => '350', 'label' => 'Tribal Organic Farmers'],
                    ['value' => '254', 'label' => 'Youth Rescue Swimmers (UNDP DRR)']
                ];
            } elseif ($slug === 'child-interventions') {
                $stats = [
                    ['value' => '1,500+', 'label' => 'Adivasi Children Reached'],
                    ['value' => '5', 'label' => 'Koya Basha Teachers Deployed'],
                    ['value' => '100+', 'label' => 'Solar Hamlets Energized'],
                    ['value' => '12', 'label' => 'Child Protection Committees']
                ];
            } elseif ($slug === 'child-bare-acts') {
                $stats = [
                    ['value' => '5', 'label' => 'Enacted Bare Acts & Rules'],
                    ['value' => '2005-2022', 'label' => 'Legislative Timeline'],
                    ['value' => '100%', 'label' => 'Official Full-Text Access']
                ];
            } elseif ($slug === 'reports') {
                $stats = [
                    ['value' => '20+', 'label' => 'Continuous Years of Audit'],
                    ['value' => '100%', 'label' => 'Statutory Compliance'],
                    ['value' => '4+', 'label' => 'Key Field Surveys Archived']
                ];
            } elseif ($slug === 'portfolio-3') {
                $stats = [
                    ['value' => '25,000+', 'label' => 'Tribal Families Defended'],
                    ['value' => '371', 'label' => 'Polavaram Villages Monitored'],
                    ['value' => '75', 'label' => 'Off-Grid Solar Hamlets'],
                    ['value' => '20+', 'label' => 'Years of Grassroots Leadership']
                ];
            }

            $contentJson = json_encode([
                'paragraphs' => $paragraphs,
                'downloads' => $downloads,
                'tables' => $tables,
                'images' => $cleanImages,
                'videos' => $videos,
                'stats' => $stats
            ], JSON_UNESCAPED_UNICODE);

            $stmt->execute([
                $slug,
                $navLabel,
                $title,
                $category,
                $badge,
                $subtitle,
                $contentJson,
                $order,
                $parentSlug
            ]);
        }
    }
}

if ($conn) {
    ensureAchievementsTable($conn, $achievementSlugs, $defaultNavLabels);
}

if (basename(__FILE__) !== basename($_SERVER['SCRIPT_NAME'] ?? '')) {
    return;
}

$reqMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($reqMethod === 'GET') {
    try {
        if (!$conn) {
            http_response_code(503);
            echo json_encode(["success" => false, "message" => "Database connection unavailable"]);
            exit;
        }

        $requestedSlug = isset($_GET['slug']) ? trim($_GET['slug']) : '';
        $requestedId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

        $hasParentSlug = false;
        try {
            $cols = $conn->query("SHOW COLUMNS FROM achievements_pages LIKE 'parent_slug'")->fetchAll();
            $hasParentSlug = $cols && count($cols) > 0;
        } catch (Exception $e) { $hasParentSlug = false; }

        if ($requestedSlug !== '' || $requestedId > 0) {
            $selectCols = $hasParentSlug
                ? "id, slug, nav_label, title, category, badge, subtitle, sort_order, is_active, parent_slug, content_json, updated_at"
                : "id, slug, nav_label, title, category, badge, subtitle, sort_order, is_active, content_json, updated_at";
            $sql = $requestedId > 0
                ? "SELECT {$selectCols} FROM achievements_pages WHERE id = ? LIMIT 1"
                : "SELECT {$selectCols} FROM achievements_pages WHERE (slug = ? OR LOWER(slug) = LOWER(?)) LIMIT 1";
            $stmt = $conn->prepare($sql);
            $stmt->execute($requestedId > 0 ? [$requestedId] : [$requestedSlug, $requestedSlug]);
            $r = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($r) {
                $content = json_decode($r['content_json'] ?? '{}', true) ?: [];
                $images = $content['images'] ?? [];
                $parentSlug = $hasParentSlug ? ($r['parent_slug'] ?? ($content['parent_slug'] ?? '')) : ($content['parent_slug'] ?? '');
                $page = array_merge($content, [
                    'id' => (int)$r['id'],
                    'slug' => $r['slug'],
                    'nav_label' => $r['nav_label'],
                    'title' => $r['title'],
                    'category' => $r['category'],
                    'badge' => $r['badge'],
                    'subtitle' => $r['subtitle'],
                    'sort_order' => (int)$r['sort_order'],
                    'is_active' => (int)$r['is_active'],
                    'parent_slug' => $parentSlug,
                    'paragraphs' => $content['paragraphs'] ?? [],
                    'downloads' => $content['downloads'] ?? [],
                    'tables' => $content['tables'] ?? [],
                    'images' => $images,
                    'videos' => $content['videos'] ?? [],
                    'stats' => $content['stats'] ?? [],
                    'content' => array_merge($content, [
                        'slug' => $r['slug'],
                        'title' => $r['title'],
                        'nav_label' => $r['nav_label'],
                        'category' => $r['category'],
                        'badge' => $r['badge'],
                        'subtitle' => $r['subtitle'],
                        'parent_slug' => $parentSlug,
                        'paragraphs' => $content['paragraphs'] ?? [],
                        'downloads' => $content['downloads'] ?? [],
                        'tables' => $content['tables'] ?? [],
                        'images' => $images,
                        'videos' => $content['videos'] ?? [],
                        'stats' => $content['stats'] ?? []
                    ]),
                    'updated_at' => $r['updated_at']
                ]);
                echo json_encode(["success" => true, "data" => $page], JSON_UNESCAPED_UNICODE);
                exit;
            }
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Achievements page not found"], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $selectCols = $hasParentSlug
            ? "id, slug, nav_label, title, category, badge, subtitle, sort_order, is_active, parent_slug, content_json, updated_at"
            : "id, slug, nav_label, title, category, badge, subtitle, sort_order, is_active, content_json, updated_at";
        $stmt = $conn->query("SELECT {$selectCols} FROM achievements_pages WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $pages = [];
        foreach ($rows as $r) {
            $content = json_decode($r['content_json'] ?? '{}', true) ?: [];
            $images = $content['images'] ?? [];
            $parentSlug = $hasParentSlug ? ($r['parent_slug'] ?? ($content['parent_slug'] ?? '')) : ($content['parent_slug'] ?? '');
            $pages[] = array_merge($content, [
                'id' => (int)$r['id'],
                'slug' => $r['slug'],
                'nav_label' => $r['nav_label'],
                'title' => $r['title'],
                'category' => $r['category'],
                'badge' => $r['badge'],
                'subtitle' => $r['subtitle'],
                'sort_order' => (int)$r['sort_order'],
                'is_active' => (int)$r['is_active'],
                'parent_slug' => $parentSlug,
                'docs_count' => count($content['downloads'] ?? []),
                'images_count' => count($content['images'] ?? []),
                'videos_count' => count($content['videos'] ?? []),
                'tables_count' => count($content['tables'] ?? []),
                'stats_count' => count($content['stats'] ?? []),
                'paragraphs' => $content['paragraphs'] ?? [],
                'downloads' => $content['downloads'] ?? [],
                'tables' => $content['tables'] ?? [],
                'images' => $images,
                'videos' => $content['videos'] ?? [],
                'stats' => $content['stats'] ?? [],
                'content' => array_merge($content, [
                    'slug' => $r['slug'],
                    'title' => $r['title'],
                    'nav_label' => $r['nav_label'],
                    'category' => $r['category'],
                    'badge' => $r['badge'],
                    'subtitle' => $r['subtitle'],
                    'parent_slug' => $parentSlug,
                    'paragraphs' => $content['paragraphs'] ?? [],
                    'downloads' => $content['downloads'] ?? [],
                    'tables' => $content['tables'] ?? [],
                    'images' => $images,
                    'videos' => $content['videos'] ?? [],
                    'stats' => $content['stats'] ?? []
                ]),
                'updated_at' => $r['updated_at']
            ]);
        }

        echo json_encode(["success" => true, "data" => $pages], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}
