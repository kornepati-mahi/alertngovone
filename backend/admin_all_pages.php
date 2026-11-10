<?php
require_once __DIR__ . '/config.php';

function siteAllPagesRespond($payload, $status = 200) {
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
    siteAllPagesRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

if (!$conn) {
    siteAllPagesRespond(["success" => false, "message" => "Database connection unavailable. Check MySQL in XAMPP."], 503);
}

// 1. Ensure site_all_pages table exists
try {
    $createSql = "CREATE TABLE IF NOT EXISTS `site_all_pages` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `slug` VARCHAR(150) NOT NULL UNIQUE,
        `title` VARCHAR(255) NOT NULL,
        `nav_label` VARCHAR(150) NULL,
        `category` VARCHAR(100) DEFAULT 'General',
        `badge` VARCHAR(100) NULL,
        `subtitle` TEXT NULL,
        `content_json` LONGTEXT NOT NULL,
        `sort_order` INT DEFAULT 0,
        `is_active` TINYINT(1) DEFAULT 1,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    $conn->exec($createSql);
} catch (PDOException $e) {
    siteAllPagesRespond(["success" => false, "message" => "Failed to initialize table: " . $e->getMessage()], 500);
}

// Helper to seed from all_site_pages.json
function seedSiteAllPagesFromJson($conn, $force = false) {
    $count = (int)$conn->query("SELECT COUNT(*) FROM site_all_pages")->fetchColumn();
    if ($count > 0 && !$force) {
        return $count;
    }

    $jsonPath = __DIR__ . '/../frontend/src/data/all_site_pages.json';
    if (!file_exists($jsonPath)) {
        return 0;
    }

    $raw = file_get_contents($jsonPath);
    $data = json_decode($raw, true) ?: [];
    if (empty($data)) {
        return 0;
    }

    $insertStmt = $conn->prepare("INSERT INTO site_all_pages (slug, nav_label, title, category, badge, subtitle, content_json, sort_order, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            nav_label = VALUES(nav_label),
            category = VALUES(category),
            badge = VALUES(badge),
            subtitle = VALUES(subtitle),
            content_json = VALUES(content_json),
            sort_order = VALUES(sort_order)");

    $order = 1;
    $seeded = 0;
    foreach ($data as $slugKey => $page) {
        $slug = trim($page['slug'] ?? $slugKey);
        if ($slug === '') continue;

        $title = trim($page['title'] ?? $slug);
        $navLabel = trim($page['nav_label'] ?? $title);
        $category = trim($page['category'] ?? 'General');
        $badge = trim($page['badge'] ?? $category);
        $subtitle = trim($page['subtitle'] ?? '');

        $content = [
            "paragraphs" => $page['paragraphs'] ?? [],
            "tables"     => $page['tables'] ?? [],
            "images"     => $page['images'] ?? [],
            "downloads"  => $page['downloads'] ?? [],
            "videos"     => $page['videos'] ?? [],
            "stats"      => $page['stats'] ?? []
        ];

        $contentJson = json_encode($content, JSON_UNESCAPED_UNICODE);
        $insertStmt->execute([$slug, $navLabel, $title, $category, $badge, $subtitle, $contentJson, $order]);
        $order++;
        $seeded++;
    }

    return $seeded;
}

// Auto-seed if empty
$existingCount = (int)$conn->query("SELECT COUNT(*) FROM site_all_pages")->fetchColumn();
if ($existingCount === 0) {
    seedSiteAllPagesFromJson($conn, false);
}

$method = $_SERVER['REQUEST_METHOD'];

// ── GET REQUESTS ─────────────────────────────────────────────────────────────
if ($method === 'GET') {
    try {
        $requestedId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        $requestedSlug = isset($_GET['slug']) ? trim($_GET['slug']) : '';

        // Single page fetch
        if ($requestedId > 0 || $requestedSlug !== '') {
            $sql = $requestedId > 0
                ? "SELECT * FROM site_all_pages WHERE id = ?"
                : "SELECT * FROM site_all_pages WHERE slug = ? OR LOWER(slug) = LOWER(?) LIMIT 1";
            $params = $requestedId > 0 ? [$requestedId] : [$requestedSlug, $requestedSlug];

            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            $row = $stmt->fetch();

            if ($row) {
                $content = json_decode($row['content_json'] ?? '{}', true) ?: [];

                $pageData = [
                    "id" => (int)$row['id'],
                    "slug" => $row['slug'],
                    "nav_label" => $row['nav_label'] ?: $row['title'],
                    "title" => $row['title'],
                    "category" => $row['category'],
                    "badge" => $row['badge'] ?: $row['category'],
                    "subtitle" => $row['subtitle'] ?? '',
                    "sort_order" => (int)$row['sort_order'],
                    "is_active" => (int)$row['is_active'],
                    "paragraphs" => $content['paragraphs'] ?? [],
                    "tables" => $content['tables'] ?? [],
                    "images" => $content['images'] ?? [],
                    "downloads" => $content['downloads'] ?? [],
                    "videos" => $content['videos'] ?? [],
                    "stats" => $content['stats'] ?? [],
                    "content" => $content
                ];

                siteAllPagesRespond(["success" => true, "data" => $pageData]);
            } else {
                siteAllPagesRespond(["success" => false, "message" => "Page not found."], 404);
            }
        }

        // List all pages
        $categoryFilter = isset($_GET['category']) ? trim($_GET['category']) : '';
        $searchFilter = isset($_GET['search']) ? trim($_GET['search']) : '';

        $sql = "SELECT id, slug, nav_label, title, category, badge, subtitle, content_json, sort_order, is_active, updated_at FROM site_all_pages WHERE 1=1";
        $params = [];

        if ($categoryFilter !== '' && strtolower($categoryFilter) !== 'all') {
            $sql .= " AND (LOWER(category) = LOWER(?) OR LOWER(category) LIKE LOWER(?))";
            $params[] = $categoryFilter;
            $params[] = '%' . $categoryFilter . '%';
        }

        if ($searchFilter !== '') {
            $sql .= " AND (LOWER(title) LIKE LOWER(?) OR LOWER(slug) LIKE LOWER(?) OR LOWER(subtitle) LIKE LOWER(?))";
            $params[] = '%' . $searchFilter . '%';
            $params[] = '%' . $searchFilter . '%';
            $params[] = '%' . $searchFilter . '%';
        }

        $sql .= " ORDER BY sort_order ASC, id ASC";
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $list = [];
        $totalTables = 0;
        $totalImages = 0;
        $totalDownloads = 0;
        $totalVideos = 0;

        foreach ($rows as $r) {
            $content = json_decode($r['content_json'] ?? '{}', true) ?: [];
            $paragraphs = $content['paragraphs'] ?? [];
            $tables = $content['tables'] ?? [];
            $images = $content['images'] ?? [];
            $downloads = $content['downloads'] ?? [];
            $videos = $content['videos'] ?? [];
            $stats = $content['stats'] ?? [];

            $totalTables += count($tables);
            $totalImages += count($images);
            $totalDownloads += count($downloads);
            $totalVideos += count($videos);

            $excerpt = '';
            if (!empty($paragraphs)) {
                $firstPara = is_string($paragraphs[0]) ? $paragraphs[0] : (is_array($paragraphs[0]) ? ($paragraphs[0]['text'] ?? '') : '');
                $excerpt = mb_substr(strip_tags($firstPara), 0, 160) . '...';
            }

            $list[] = [
                "id" => (int)$r['id'],
                "slug" => $r['slug'],
                "nav_label" => $r['nav_label'] ?: $r['title'],
                "title" => $r['title'],
                "category" => $r['category'] ?: 'General',
                "badge" => $r['badge'] ?: $r['category'],
                "subtitle" => $r['subtitle'] ?? '',
                "sort_order" => (int)$r['sort_order'],
                "is_active" => (int)$r['is_active'],
                "updated_at" => $r['updated_at'],
                "tables_count" => count($tables),
                "images_count" => count($images),
                "downloads_count" => count($downloads),
                "videos_count" => count($videos),
                "paragraphs_count" => count($paragraphs),
                "stats_count" => count($stats),
                "excerpt" => $excerpt,
                "url" => "/" . $r['slug'],
                "content" => [
                    "paragraphs" => $paragraphs,
                    "tables" => $tables,
                    "images" => $images,
                    "downloads" => $downloads,
                    "videos" => $videos,
                    "stats" => $stats
                ]
            ];
        }

        siteAllPagesRespond([
            "success" => true,
            "total" => count($list),
            "stats_summary" => [
                "total_pages" => count($list),
                "total_tables" => $totalTables,
                "total_images" => $totalImages,
                "total_downloads" => $totalDownloads,
                "total_videos" => $totalVideos
            ],
            "data" => $list
        ]);
    } catch (PDOException $e) {
        siteAllPagesRespond(["success" => false, "message" => "Database query error: " . $e->getMessage()], 500);
    }
}

// ── POST REQUESTS ────────────────────────────────────────────────────────────
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $action = $input['action'] ?? 'save_page';

    // 1. RE-SEED / SYNC FROM JSON
    if ($action === 'seed_from_json' || $action === 'reset_seed') {
        try {
            $force = !empty($input['force']);
            if ($force) {
                $conn->exec("TRUNCATE TABLE site_all_pages");
            }
            $count = seedSiteAllPagesFromJson($conn, true);
            siteAllPagesRespond([
                "success" => true,
                "message" => "Successfully synchronized {$count} site pages from JSON dataset.",
                "total" => $count
            ]);
        } catch (Exception $e) {
            siteAllPagesRespond(["success" => false, "message" => "Seed error: " . $e->getMessage()], 500);
        }
    }

    // 2. CREATE NEW PAGE
    if ($action === 'create_page') {
        $title = trim($input['title'] ?? '');
        $navLabel = trim($input['nav_label'] ?? $title);
        if ($title === '') {
            siteAllPagesRespond(["success" => false, "message" => "Page title is required."], 422);
        }

        $slug = trim($input['slug'] ?? '');
        if ($slug === '') {
            $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $title));
            $slug = trim($slug, '-');
        }
        if ($slug === '') {
            $slug = 'page-' . time();
        }

        // Check and auto-increment slug collision
        $baseSlug = $slug;
        $counter = 1;
        while ((int)$conn->query("SELECT COUNT(*) FROM site_all_pages WHERE slug = " . $conn->quote($slug))->fetchColumn() > 0) {
            $counter++;
            $slug = $baseSlug . '-' . $counter;
        }

        $category = trim($input['category'] ?? 'General');
        $badge = trim($input['badge'] ?? $category);
        $subtitle = trim($input['subtitle'] ?? '');

        $maxOrder = (int)$conn->query("SELECT MAX(sort_order) FROM site_all_pages")->fetchColumn();
        $sortOrder = $maxOrder + 1;

        $contentObj = [
            "paragraphs" => $input['paragraphs'] ?? [],
            "tables"     => $input['tables'] ?? [],
            "images"     => $input['images'] ?? [],
            "downloads"  => $input['downloads'] ?? [],
            "videos"     => $input['videos'] ?? [],
            "stats"      => $input['stats'] ?? []
        ];

        $contentJson = json_encode($contentObj, JSON_UNESCAPED_UNICODE);

        try {
            $stmt = $conn->prepare("INSERT INTO site_all_pages (slug, nav_label, title, category, badge, subtitle, content_json, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)");
            $stmt->execute([$slug, $navLabel, $title, $category, $badge, $subtitle, $contentJson, $sortOrder]);
            $newId = (int)$conn->lastInsertId();

            siteAllPagesRespond([
                "success" => true,
                "message" => "Page '{$title}' created successfully.",
                "data" => [
                    "id" => $newId,
                    "slug" => $slug,
                    "nav_label" => $navLabel,
                    "title" => $title,
                    "category" => $category,
                    "badge" => $badge,
                    "subtitle" => $subtitle,
                    "sort_order" => $sortOrder,
                    "is_active" => 1,
                    "content" => $contentObj
                ]
            ]);
        } catch (PDOException $e) {
            siteAllPagesRespond(["success" => false, "message" => "Failed to create page: " . $e->getMessage()], 500);
        }
    }

    // 3. SAVE / UPDATE PAGE
    if ($action === 'save_page' || $action === 'update_page') {
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        $slug = trim($input['slug'] ?? '');

        if ($id <= 0 && $slug === '') {
            siteAllPagesRespond(["success" => false, "message" => "Valid page ID or slug required."], 422);
        }

        $target = $id > 0 ? "id = {$id}" : "slug = " . $conn->quote($slug);
        $page = $conn->query("SELECT * FROM site_all_pages WHERE {$target} LIMIT 1")->fetch();

        if (!$page) {
            siteAllPagesRespond(["success" => false, "message" => "Page not found."], 404);
        }

        $existingId = (int)$page['id'];
        $title = isset($input['title']) ? trim($input['title']) : $page['title'];
        $navLabel = isset($input['nav_label']) ? trim($input['nav_label']) : ($page['nav_label'] ?: $title);
        $category = isset($input['category']) ? trim($input['category']) : $page['category'];
        $badge = isset($input['badge']) ? trim($input['badge']) : $page['badge'];
        $subtitle = isset($input['subtitle']) ? trim($input['subtitle']) : $page['subtitle'];
        $sortOrder = isset($input['sort_order']) ? (int)$input['sort_order'] : (int)$page['sort_order'];
        $isActive = isset($input['is_active']) ? (int)$input['is_active'] : (int)$page['is_active'];

        // If new slug is provided and different, check uniqueness
        $newSlug = isset($input['new_slug']) ? trim($input['new_slug']) : (isset($input['slug']) ? trim($input['slug']) : $page['slug']);
        if ($newSlug !== '' && $newSlug !== $page['slug']) {
            $conflict = (int)$conn->query("SELECT COUNT(*) FROM site_all_pages WHERE slug = " . $conn->quote($newSlug) . " AND id != {$existingId}")->fetchColumn();
            if ($conflict > 0) {
                siteAllPagesRespond(["success" => false, "message" => "Slug '{$newSlug}' already exists on another page."], 409);
            }
        } else {
            $newSlug = $page['slug'];
        }

        // Build content json
        $existingContent = json_decode($page['content_json'] ?? '{}', true) ?: [];

        $contentObj = [
            "paragraphs" => $input['paragraphs'] ?? ($existingContent['paragraphs'] ?? []),
            "tables"     => $input['tables'] ?? ($existingContent['tables'] ?? []),
            "images"     => $input['images'] ?? ($existingContent['images'] ?? []),
            "downloads"  => $input['downloads'] ?? ($existingContent['downloads'] ?? []),
            "videos"     => $input['videos'] ?? ($existingContent['videos'] ?? []),
            "stats"      => $input['stats'] ?? ($existingContent['stats'] ?? [])
        ];

        $contentJson = json_encode($contentObj, JSON_UNESCAPED_UNICODE);

        try {
            $stmt = $conn->prepare("UPDATE site_all_pages SET slug = ?, nav_label = ?, title = ?, category = ?, badge = ?, subtitle = ?, content_json = ?, sort_order = ?, is_active = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$newSlug, $navLabel, $title, $category, $badge, $subtitle, $contentJson, $sortOrder, $isActive, $existingId]);

            siteAllPagesRespond([
                "success" => true,
                "message" => "Page '{$title}' saved successfully.",
                "data" => [
                    "id" => $existingId,
                    "slug" => $newSlug,
                    "nav_label" => $navLabel,
                    "title" => $title,
                    "category" => $category,
                    "badge" => $badge,
                    "subtitle" => $subtitle,
                    "sort_order" => $sortOrder,
                    "is_active" => $isActive,
                    "content" => $contentObj
                ]
            ]);
        } catch (PDOException $e) {
            siteAllPagesRespond(["success" => false, "message" => "Failed to update page: " . $e->getMessage()], 500);
        }
    }

    // 4. DELETE PAGE
    if ($action === 'delete_page') {
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        $slug = trim($input['slug'] ?? '');

        if ($id <= 0 && $slug === '') {
            siteAllPagesRespond(["success" => false, "message" => "Valid page ID or slug required for deletion."], 422);
        }

        $target = $id > 0 ? "id = {$id}" : "slug = " . $conn->quote($slug);
        $page = $conn->query("SELECT id, title, slug FROM site_all_pages WHERE {$target} LIMIT 1")->fetch();

        if (!$page) {
            siteAllPagesRespond(["success" => false, "message" => "Page not found."], 404);
        }

        try {
            $conn->exec("DELETE FROM site_all_pages WHERE id = {$page['id']}");
            siteAllPagesRespond([
                "success" => true,
                "message" => "Page '{$page['title']}' deleted successfully.",
                "deleted_id" => (int)$page['id'],
                "deleted_slug" => $page['slug']
            ]);
        } catch (PDOException $e) {
            siteAllPagesRespond(["success" => false, "message" => "Failed to delete page: " . $e->getMessage()], 500);
        }
    }

    // 5. REORDER PAGES
    if ($action === 'reorder_pages') {
        $orderList = $input['order'] ?? [];
        if (!is_array($orderList)) {
            siteAllPagesRespond(["success" => false, "message" => "Invalid order format."], 422);
        }

        try {
            $stmt = $conn->prepare("UPDATE site_all_pages SET sort_order = ? WHERE id = ?");
            foreach ($orderList as $item) {
                if (isset($item['id'], $item['sort_order'])) {
                    $stmt->execute([(int)$item['sort_order'], (int)$item['id']]);
                }
            }
            siteAllPagesRespond(["success" => true, "message" => "Page order updated successfully."]);
        } catch (PDOException $e) {
            siteAllPagesRespond(["success" => false, "message" => "Failed to reorder: " . $e->getMessage()], 500);
        }
    }

    siteAllPagesRespond(["success" => false, "message" => "Unknown action '{$action}'."], 400);
}

siteAllPagesRespond(["success" => false, "message" => "Method not allowed."], 405);

