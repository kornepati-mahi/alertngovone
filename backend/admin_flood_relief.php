<?php
require_once __DIR__ . '/config.php';

function floodRespond($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload);
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
    floodRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

if (!$conn) {
    floodRespond(["success" => false, "message" => "Database connection unavailable. Check MySQL in XAMPP."], 503);
}

$method = $_SERVER['REQUEST_METHOD'];

// Ensure table exists
require_once __DIR__ . '/get_flood_relief_pages.php';

if ($method === 'GET') {
    try {
        $requestedId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        $requestedSlug = isset($_GET['slug']) ? trim($_GET['slug']) : '';

        if ($requestedId > 0 || $requestedSlug !== '') {
            $sql = $requestedId > 0
                ? "SELECT * FROM flood_relief_pages WHERE id = ?"
                : "SELECT * FROM flood_relief_pages WHERE slug = ? OR LOWER(slug) = LOWER(?)";
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

                floodRespond([
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
                        "downloads_count" => count($content['downloads'] ?? []),
                        "tables_count" => count($content['tables'] ?? []),
                        "images_count" => count($images),
                        "videos_count" => count($content['videos'] ?? []),
                        "stats_count" => count($content['stats'] ?? []),
                        "sort_order" => (int)$row['sort_order'],
                        "is_active" => (int)$row['is_active'],
                        "content" => $pageContent
                    ])
                ]);
            } else {
                floodRespond(["success" => false, "message" => "Flood Relief page not found."], 404);
            }
        }

        // List all pages
        $stmt = $conn->query("SELECT id, slug, nav_label, title, category, badge, subtitle, content_json, sort_order, is_active FROM flood_relief_pages ORDER BY sort_order ASC, id ASC");
        $rows = $stmt->fetchAll();

        $list = [];
        foreach ($rows as $r) {
            $content = json_decode($r['content_json'] ?? '{}', true) ?: [];
            $images = $content['images'] ?? [];

            $pageContent = array_merge($content, [
                "slug" => $r['slug'],
                "title" => $r['title'],
                "nav_label" => $r['nav_label'],
                "category" => $r['category'],
                "badge" => $r['badge'],
                "subtitle" => $r['subtitle'],
                "paragraphs" => $content['paragraphs'] ?? [],
                "downloads" => $content['downloads'] ?? [],
                "tables" => $content['tables'] ?? [],
                "images" => $images,
                "videos" => $content['videos'] ?? [],
                "stats" => $content['stats'] ?? []
            ]);

            $list[] = array_merge($content, [
                "id" => (int)$r['id'],
                "slug" => $r['slug'],
                "nav_label" => $r['nav_label'],
                "title" => $r['title'],
                "category" => $r['category'],
                "badge" => $r['badge'],
                "subtitle" => $r['subtitle'],
                "downloads" => $content['downloads'] ?? [],
                "tables" => $content['tables'] ?? [],
                "images" => $images,
                "videos" => $content['videos'] ?? [],
                "paragraphs" => $content['paragraphs'] ?? [],
                "stats" => $content['stats'] ?? [],
                "downloads_count" => count($content['downloads'] ?? []),
                "tables_count" => count($content['tables'] ?? []),
                "images_count" => count($images),
                "videos_count" => count($content['videos'] ?? []),
                "stats_count" => count($content['stats'] ?? []),
                "sort_order" => (int)$r['sort_order'],
                "is_active" => (int)$r['is_active'],
                "content" => $pageContent
            ]);
        }

        floodRespond(["success" => true, "data" => $list]);
    } catch (Exception $e) {
        floodRespond(["success" => false, "message" => "Error loading Flood Relief pages: " . $e->getMessage()], 500);
    }
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $action = $input['action'] ?? 'update_page';

    // 1. CREATE NEW PAGE
    if ($action === 'create_page') {
        $navLabel = trim($input['nav_label'] ?? $input['name'] ?? $input['title'] ?? '');
        $title = trim($input['title'] ?? '');
        if ($title === '') $title = $navLabel;
        if ($navLabel === '') $navLabel = $title;

        $slug = trim($input['slug'] ?? '');
        if ($slug === '') {
            $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $navLabel));
            $slug = trim($slug, '-');
        }
        if ($slug === '') {
            $slug = 'page-' . time();
        }

        $category = trim($input['category'] ?? 'Flood Relief');
        $badge = trim($input['badge'] ?? 'Flood Relief Project');
        $subtitle = trim($input['subtitle'] ?? '');

        if ($navLabel === '') {
            floodRespond(["success" => false, "message" => "Page name / navigation label is required."], 400);
        }

        // Clean slug
        $slug = preg_replace('/[^a-z0-9_-]/', '-', strtolower($slug));
        $slug = preg_replace('/-+/', '-', $slug);
        $slug = trim($slug, '-');

        // Auto-resolve slug collision
        $baseSlug = $slug;
        $counter = 1;
        $stmt = $conn->prepare("SELECT id FROM flood_relief_pages WHERE slug = ?");
        $stmt->execute([$slug]);
        while ($stmt->fetch()) {
            $counter++;
            $slug = $baseSlug . '-' . $counter;
            $stmt->execute([$slug]);
        }

        $maxOrder = (int)$conn->query("SELECT COALESCE(MAX(sort_order), 0) FROM flood_relief_pages")->fetchColumn();
        $sortOrder = $maxOrder + 1;

        $contentJson = json_encode([
            "slug" => $slug,
            "title" => $title,
            "nav_label" => $navLabel,
            "category" => $category,
            "badge" => $badge,
            "subtitle" => $subtitle,
            "paragraphs" => [],
            "downloads" => [],
            "tables" => [],
            "images" => [],
            "videos" => []
        ], JSON_UNESCAPED_UNICODE);

        try {
            $stmt = $conn->prepare("INSERT INTO flood_relief_pages (slug, nav_label, title, category, badge, subtitle, content_json, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)");
            $stmt->execute([$slug, $navLabel, $title, $category, $badge, $subtitle, $contentJson, $sortOrder]);
            $newId = (int)$conn->lastInsertId();

            floodRespond([
                "success" => true,
                "message" => "New Flood Relief page created successfully.",
                "data" => [
                    "id" => $newId,
                    "slug" => $slug,
                    "nav_label" => $navLabel,
                    "title" => $title
                ]
            ], 201);
        } catch (Exception $e) {
            floodRespond(["success" => false, "message" => "Failed to create page: " . $e->getMessage()], 500);
        }
    }

    // 2. UPDATE PAGE METADATA
    if ($action === 'update_page') {
        $rawPageId = $input['page_id'] ?? ($input['id'] ?? null);
        $pageId = is_numeric($rawPageId) ? (int)$rawPageId : 0;
        $slug = trim($input['slug'] ?? (!is_numeric($rawPageId) && is_string($rawPageId) ? $rawPageId : ''));

        if ($pageId <= 0 && !$slug) {
            floodRespond(["success" => false, "message" => "Page ID or slug is required."], 400);
        }

        $sql = $pageId > 0 ? "SELECT * FROM flood_relief_pages WHERE id = ?" : "SELECT * FROM flood_relief_pages WHERE slug = ? OR LOWER(slug) = LOWER(?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute($pageId > 0 ? [$pageId] : [$slug, $slug]);
        $page = $stmt->fetch();

        if (!$page) {
            floodRespond(["success" => false, "message" => "Flood Relief page not found."], 404);
        }

        $navLabel = isset($input['nav_label']) ? trim($input['nav_label']) : $page['nav_label'];
        $title = isset($input['title']) ? trim($input['title']) : $page['title'];
        $category = isset($input['category']) ? trim($input['category']) : $page['category'];
        $badge = isset($input['badge']) ? trim($input['badge']) : $page['badge'];
        $subtitle = isset($input['subtitle']) ? trim($input['subtitle']) : $page['subtitle'];
        $isActive = isset($input['is_active']) ? (int)$input['is_active'] : (int)$page['is_active'];

        $content = json_decode($page['content_json'] ?? '{}', true) ?: [];
        $content['nav_label'] = $navLabel;
        $content['title'] = $title;
        $content['category'] = $category;
        $content['badge'] = $badge;
        $content['subtitle'] = $subtitle;

        $stmt = $conn->prepare("UPDATE flood_relief_pages SET nav_label = ?, title = ?, category = ?, badge = ?, subtitle = ?, content_json = ?, is_active = ? WHERE id = ?");
        $stmt->execute([$navLabel, $title, $category, $badge, $subtitle, json_encode($content, JSON_UNESCAPED_UNICODE), $isActive, $page['id']]);

        floodRespond(["success" => true, "message" => "Page metadata updated successfully."]);
    }

    // 3. DELETE PAGE
    if ($action === 'delete_page') {
        $rawPageId = $input['page_id'] ?? ($input['id'] ?? null);
        $pageId = is_numeric($rawPageId) ? (int)$rawPageId : 0;
        $slug = trim($input['slug'] ?? (!is_numeric($rawPageId) && is_string($rawPageId) ? $rawPageId : ''));

        if ($pageId <= 0 && !$slug) {
            floodRespond(["success" => false, "message" => "Page ID or slug is required."], 400);
        }

        $sql = $pageId > 0 ? "SELECT * FROM flood_relief_pages WHERE id = ?" : "SELECT * FROM flood_relief_pages WHERE slug = ? OR LOWER(slug) = LOWER(?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute($pageId > 0 ? [$pageId] : [$slug, $slug]);
        $page = $stmt->fetch();

        if (!$page) {
            floodRespond(["success" => false, "message" => "Page not found."], 404);
        }

        if ($page['slug'] === 'rofr') {
            floodRespond(["success" => false, "message" => "The main Flood Relief overview page cannot be deleted."], 400);
        }

        $stmt = $conn->prepare("DELETE FROM flood_relief_pages WHERE id = ?");
        $stmt->execute([$page['id']]);

        floodRespond(["success" => true, "message" => "Page deleted successfully."]);
    }

    // 4. ADD DOCUMENT TO PAGE
    if ($action === 'add_document') {
        $rawPageId = $input['page_id'] ?? ($input['id'] ?? null);
        $pageId = is_numeric($rawPageId) ? (int)$rawPageId : 0;
        $slug = trim($input['slug'] ?? (!is_numeric($rawPageId) && is_string($rawPageId) ? $rawPageId : ''));

        if ($pageId <= 0 && !$slug) {
            floodRespond(["success" => false, "message" => "Page ID or slug is required."], 400);
        }

        $sql = $pageId > 0 ? "SELECT * FROM flood_relief_pages WHERE id = ?" : "SELECT * FROM flood_relief_pages WHERE slug = ? OR LOWER(slug) = LOWER(?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute($pageId > 0 ? [$pageId] : [$slug, $slug]);
        $page = $stmt->fetch();

        if (!$page) {
            floodRespond(["success" => false, "message" => "Page not found."], 404);
        }

        $content = json_decode($page['content_json'] ?? '{}', true) ?: [];
        $downloads = $content['downloads'] ?? [];

        $docUrl = trim($input['url'] ?? '');
        $docText = trim($input['text'] ?? '');
        $filename = trim($input['filename'] ?? '');

        // Handle uploaded file if present
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $f = $_FILES['file'];
            $ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
            if (!in_array($ext, ['pdf', 'doc', 'docx', 'xlsx', 'xls', 'zip'])) {
                floodRespond(["success" => false, "message" => "Only PDF and document files are permitted."], 400);
            }

            $safeBase = preg_replace('/[^a-zA-Z0-9_-]/', '_', pathinfo($f['name'], PATHINFO_FILENAME));
            $newFileName = 'rofr_' . time() . '_' . substr(md5(uniqid()), 0, 6) . '.' . $ext;

            $backUploadDir = __DIR__ . '/uploads';
            $frontUploadDir = dirname(__DIR__) . '/frontend/public/uploads';

            if (!is_dir($backUploadDir)) @mkdir($backUploadDir, 0755, true);
            if (!is_dir($frontUploadDir)) @mkdir($frontUploadDir, 0755, true);

            $backDest = $backUploadDir . '/' . $newFileName;
            $frontDest = $frontUploadDir . '/' . $newFileName;

            if (move_uploaded_file($f['tmp_name'], $frontDest)) {
                @copy($frontDest, $backDest);
                $docUrl = '/uploads/' . $newFileName;
                if (!$filename) $filename = $f['name'];
                if (!$docText) $docText = pathinfo($f['name'], PATHINFO_FILENAME);
            } else {
                floodRespond(["success" => false, "message" => "Failed to save uploaded file."], 500);
            }
        }

        if (!$docUrl) {
            floodRespond(["success" => false, "message" => "Document URL or file upload is required."], 400);
        }

        if (!$docText) $docText = $filename ?: basename($docUrl);
        if (!$filename) $filename = basename($docUrl);

        $newDoc = [
            "url" => $docUrl,
            "text" => $docText,
            "filename" => $filename,
            "size" => $input['size'] ?? '',
            "date" => $input['date'] ?? date('Y-m-d'),
            "category" => $input['category'] ?? 'Official PDF'
        ];

        $downloads[] = $newDoc;
        $content['downloads'] = $downloads;

        $stmt = $conn->prepare("UPDATE flood_relief_pages SET content_json = ? WHERE id = ?");
        $stmt->execute([json_encode($content, JSON_UNESCAPED_UNICODE), $page['id']]);

        floodRespond([
            "success" => true,
            "message" => "Document added successfully.",
            "data" => $newDoc,
            "downloads" => $downloads
        ]);
    }

    // 5. UPDATE DOCUMENT
    if ($action === 'update_document') {
        $rawPageId = $input['page_id'] ?? ($input['id'] ?? null);
        $pageId = is_numeric($rawPageId) ? (int)$rawPageId : 0;
        $slug = trim($input['slug'] ?? (!is_numeric($rawPageId) && is_string($rawPageId) ? $rawPageId : ''));
        $docIndex = isset($input['doc_index']) ? (int)$input['doc_index'] : -1;

        if ($pageId <= 0 && !$slug) {
            floodRespond(["success" => false, "message" => "Page ID or slug is required."], 400);
        }

        $sql = $pageId > 0 ? "SELECT * FROM flood_relief_pages WHERE id = ?" : "SELECT * FROM flood_relief_pages WHERE slug = ? OR LOWER(slug) = LOWER(?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute($pageId > 0 ? [$pageId] : [$slug, $slug]);
        $page = $stmt->fetch();

        if (!$page) {
            floodRespond(["success" => false, "message" => "Page not found."], 404);
        }

        $content = json_decode($page['content_json'] ?? '{}', true) ?: [];
        $downloads = $content['downloads'] ?? [];

        if (!isset($downloads[$docIndex])) {
            floodRespond(["success" => false, "message" => "Document index out of bounds."], 400);
        }

        if (isset($input['text'])) $downloads[$docIndex]['text'] = trim($input['text']);
        if (isset($input['url']) && trim($input['url']) !== '') $downloads[$docIndex]['url'] = trim($input['url']);
        if (isset($input['filename'])) $downloads[$docIndex]['filename'] = trim($input['filename']);
        if (isset($input['size'])) $downloads[$docIndex]['size'] = trim($input['size']);
        if (isset($input['date'])) $downloads[$docIndex]['date'] = trim($input['date']);
        if (isset($input['category'])) $downloads[$docIndex]['category'] = trim($input['category']);

        $content['downloads'] = $downloads;
        $stmt = $conn->prepare("UPDATE flood_relief_pages SET content_json = ? WHERE id = ?");
        $stmt->execute([json_encode($content, JSON_UNESCAPED_UNICODE), $page['id']]);

        floodRespond([
            "success" => true,
            "message" => "Document updated successfully.",
            "downloads" => $downloads
        ]);
    }

    // 6. DELETE DOCUMENT FROM PAGE
    if ($action === 'delete_document') {
        $rawPageId = $input['page_id'] ?? ($input['id'] ?? null);
        $pageId = is_numeric($rawPageId) ? (int)$rawPageId : 0;
        $slug = trim($input['slug'] ?? (!is_numeric($rawPageId) && is_string($rawPageId) ? $rawPageId : ''));
        $docIndex = isset($input['doc_index']) ? (int)$input['doc_index'] : -1;

        $sql = $pageId > 0 ? "SELECT * FROM flood_relief_pages WHERE id = ?" : "SELECT * FROM flood_relief_pages WHERE slug = ? OR LOWER(slug) = LOWER(?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute($pageId > 0 ? [$pageId] : [$slug, $slug]);
        $page = $stmt->fetch();

        if (!$page) {
            floodRespond(["success" => false, "message" => "Page not found."], 404);
        }

        $content = json_decode($page['content_json'] ?? '{}', true) ?: [];
        $downloads = $content['downloads'] ?? [];

        if (isset($downloads[$docIndex])) {
            array_splice($downloads, $docIndex, 1);
            $content['downloads'] = $downloads;
            $stmt = $conn->prepare("UPDATE flood_relief_pages SET content_json = ? WHERE id = ?");
            $stmt->execute([json_encode($content, JSON_UNESCAPED_UNICODE), $page['id']]);

            floodRespond([
                "success" => true,
                "message" => "Document deleted successfully.",
                "downloads" => $downloads
            ]);
        } else {
            floodRespond(["success" => false, "message" => "Document not found at index."], 400);
        }
    }

    // 7. SAVE COMPLETE PAGE CONTENT (downloads, tables, images, videos, paragraphs)
    if ($action === 'save_content') {
        $rawPageId = $input['page_id'] ?? ($input['id'] ?? null);
        $pageId = is_numeric($rawPageId) ? (int)$rawPageId : 0;
        $slug = trim($input['slug'] ?? (!is_numeric($rawPageId) && is_string($rawPageId) ? $rawPageId : ''));

        if ($pageId <= 0 && !$slug) {
            floodRespond(["success" => false, "message" => "Page ID or slug is required."], 400);
        }

        $sql = $pageId > 0 ? "SELECT * FROM flood_relief_pages WHERE id = ?" : "SELECT * FROM flood_relief_pages WHERE slug = ? OR LOWER(slug) = LOWER(?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute($pageId > 0 ? [$pageId] : [$slug, $slug]);
        $page = $stmt->fetch();

        if (!$page) {
            floodRespond(["success" => false, "message" => "Page not found."], 404);
        }

        $content = json_decode($page['content_json'] ?? '{}', true) ?: [];

        if (isset($input['content']) && is_array($input['content'])) {
            $c = $input['content'];
            // Merge full content object first so hero/section/cta/custom fields persist,
            // then ensure key arrays/known fields are applied explicitly.
            $content = array_merge($content, $c);
            if (isset($c['downloads'])) $content['downloads'] = $c['downloads'];
            if (isset($c['tables'])) $content['tables'] = $c['tables'];
            if (isset($c['images'])) $content['images'] = $c['images'];
            if (isset($c['videos'])) $content['videos'] = $c['videos'];
            if (isset($c['paragraphs'])) $content['paragraphs'] = $c['paragraphs'];
            if (isset($c['stats'])) $content['stats'] = $c['stats'];
        } else {
            if (isset($input['downloads']) && is_array($input['downloads'])) {
                $content['downloads'] = $input['downloads'];
            }
            if (isset($input['tables']) && is_array($input['tables'])) {
                $content['tables'] = $input['tables'];
            }
            if (isset($input['images']) && is_array($input['images'])) {
                $content['images'] = $input['images'];
            }
            if (isset($input['videos']) && is_array($input['videos'])) {
                $content['videos'] = $input['videos'];
            }
            if (isset($input['paragraphs']) && is_array($input['paragraphs'])) {
                $content['paragraphs'] = $input['paragraphs'];
            }
            if (isset($input['stats']) && is_array($input['stats'])) {
                $content['stats'] = $input['stats'];
            }
        }

        // Optional metadata updates included in save
        $updates = [];
        $params = [json_encode($content, JSON_UNESCAPED_UNICODE)];
        $sql = "UPDATE flood_relief_pages SET content_json = ?";

        if (isset($input['title']) && trim($input['title']) !== '') {
            $sql .= ", title = ?";
            $params[] = trim($input['title']);
        }
        if (isset($input['nav_label']) && trim($input['nav_label']) !== '') {
            $sql .= ", nav_label = ?";
            $params[] = trim($input['nav_label']);
        }
        if (isset($input['subtitle'])) {
            $sql .= ", subtitle = ?";
            $params[] = trim($input['subtitle']);
        }
        if (isset($input['category']) && trim($input['category']) !== '') {
            $sql .= ", category = ?";
            $params[] = trim($input['category']);
        }
        if (isset($input['badge']) && trim($input['badge']) !== '') {
            $sql .= ", badge = ?";
            $params[] = trim($input['badge']);
        }

        $sql .= " WHERE id = ?";
        $params[] = $page['id'];

        $stmt = $conn->prepare($sql);
        $stmt->execute($params);

        // Also synchronize to all_site_pages.json for zero-downtime offline fallback
        $dataFile = dirname(__DIR__) . '/frontend/src/data/all_site_pages.json';
        if (file_exists($dataFile)) {
            $sitePages = json_decode(file_get_contents($dataFile), true) ?: [];
            $pageSlug = $page['slug'];
            $sitePages[$pageSlug] = [
                "slug" => $pageSlug,
                "title" => $input['title'] ?? $page['title'],
                "subtitle" => $input['subtitle'] ?? $page['subtitle'],
                "category" => $input['category'] ?? $page['category'],
                "url" => "https://alertngo.in/{$pageSlug}/",
                "paragraphs" => $content['paragraphs'] ?? [],
                "tables" => $content['tables'] ?? [],
                "images" => $content['images'] ?? [],
                "downloads" => $content['downloads'] ?? []
            ];
            @file_put_contents($dataFile, json_encode($sitePages, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }

        floodRespond([
            "success" => true,
            "message" => "Flood Relief page content and metadata saved successfully.",
            "data" => $content
        ]);
    }

    // 8. REORDER PAGES
    if ($action === 'reorder_pages') {
        $orderedIds = $input['page_ids'] ?? [];
        if (!is_array($orderedIds) || count($orderedIds) === 0) {
            floodRespond(["success" => false, "message" => "Array of page_ids required."], 400);
        }

        $stmt = $conn->prepare("UPDATE flood_relief_pages SET sort_order = ? WHERE id = ?");
        foreach ($orderedIds as $index => $id) {
            $stmt->execute([$index + 1, (int)$id]);
        }

        floodRespond(["success" => true, "message" => "Pages reordered successfully."]);
    }

    floodRespond(["success" => false, "message" => "Unknown action '{$action}'."], 400);
}

floodRespond(["success" => false, "message" => "Method not allowed."], 405);

