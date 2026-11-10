<?php
require_once __DIR__ . '/config.php';

function larrRespond($payload, $status = 200) {
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
    larrRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

if (!$conn) {
    larrRespond(["success" => false, "message" => "Database connection unavailable. Check MySQL in XAMPP."], 503);
}

$method = $_SERVER['REQUEST_METHOD'];

// Ensure table exists
require_once __DIR__ . '/get_larr_pages.php';
if ($method === 'GET') {
    try {
        $requestedId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        $requestedSlug = isset($_GET['slug']) ? trim($_GET['slug']) : '';

        if ($requestedId > 0 || $requestedSlug !== '') {
            $sql = $requestedId > 0
                ? "SELECT * FROM la_rr_pages WHERE id = ?"
                : "SELECT * FROM la_rr_pages WHERE slug = ? OR LOWER(slug) = LOWER(?)";
            $params = $requestedId > 0 ? [$requestedId] : [$requestedSlug, $requestedSlug];

            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            $row = $stmt->fetch();

            if ($row) {
                $content = json_decode($row['content_json'] ?? '{}', true) ?: [];
                $images = $content['images'] ?? [];
                foreach ($images as &$img) {
                    if (isset($img['url']) && !isset($img['src'])) $img['src'] = $img['url'];
                    if (isset($img['src']) && !isset($img['url'])) $img['url'] = $img['src'];
                    if (isset($img['caption']) && !isset($img['name'])) $img['name'] = $img['caption'];
                }
                unset($img);

                $pageContent = [
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
                ];

                larrRespond([
                    "success" => true,
                    "data" => [
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
                    ]
                ]);
            } else {
                larrRespond(["success" => false, "message" => "Page not found"], 404);
            }
        }

        // List all pages
        $stmt = $conn->query("SELECT * FROM la_rr_pages ORDER BY sort_order ASC, id ASC");
        $rows = $stmt->fetchAll();

        $list = [];
        foreach ($rows as $r) {
            $content = json_decode($r['content_json'] ?? '{}', true) ?: [];
            $images = $content['images'] ?? [];
            foreach ($images as &$img) {
                if (isset($img['url']) && !isset($img['src'])) $img['src'] = $img['url'];
                if (isset($img['src']) && !isset($img['url'])) $img['url'] = $img['src'];
                if (isset($img['caption']) && !isset($img['name'])) $img['name'] = $img['caption'];
            }
            unset($img);

            $pageContent = [
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
            ];

            $list[] = [
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
            ];
        }

        larrRespond(["success" => true, "data" => $list]);
    } catch (PDOException $e) {
        larrRespond(["success" => false, "message" => "Database error: " . $e->getMessage()], 500);
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

        $category = trim($input['category'] ?? 'LA & RR');
        $badge = trim($input['badge'] ?? 'LA & RR Project');
        $subtitle = trim($input['subtitle'] ?? '');

        if ($navLabel === '') {
            larrRespond(["success" => false, "message" => "Page name / navigation label is required."], 422);
        }

        // Clean slug
        $slug = preg_replace('/[^a-z0-9_-]/', '-', strtolower($slug));
        $slug = preg_replace('/-+/', '-', $slug);
        $slug = trim($slug, '-');

        // Auto-resolve collision
        $baseSlug = $slug;
        $counter = 1;
        $stmt = $conn->prepare("SELECT COUNT(*) FROM la_rr_pages WHERE slug = ?");
        $stmt->execute([$slug]);
        while ($stmt->fetchColumn() > 0) {
            $counter++;
            $slug = $baseSlug . '-' . $counter;
            $stmt->execute([$slug]);
        }

        $maxSort = (int)$conn->query("SELECT COALESCE(MAX(sort_order), 0) FROM la_rr_pages")->fetchColumn();
        $sortOrder = $maxSort + 1;

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
            $stmt = $conn->prepare("INSERT INTO la_rr_pages (slug, nav_label, title, category, badge, subtitle, content_json, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)");
            $stmt->execute([$slug, $navLabel, $title, $category, $badge, $subtitle, $contentJson, $sortOrder]);
            $newId = (int)$conn->lastInsertId();

            larrRespond([
                "success" => true,
                "message" => "New dropdown page created successfully.",
                "data" => [
                    "id" => $newId,
                    "slug" => $slug,
                    "nav_label" => $navLabel,
                    "title" => $title,
                    "category" => $category,
                    "badge" => $badge,
                    "subtitle" => $subtitle,
                    "downloads_count" => 0,
                    "tables_count" => 0,
                    "images_count" => 0,
                    "videos_count" => 0,
                    "content" => [
                        "slug" => $slug,
                        "title" => $title,
                        "nav_label" => $navLabel,
                        "downloads" => [],
                        "tables" => [],
                        "images" => [],
                        "videos" => [],
                        "paragraphs" => []
                    ]
                ]
            ]);
        } catch (PDOException $e) {
            larrRespond(["success" => false, "message" => "Failed to create page: " . $e->getMessage()], 500);
        }
    }

    // 2. UPDATE PAGE META
    if ($action === 'update_page') {
        $rawId = $input['id'] ?? ($input['page_id'] ?? null);
        $id = is_numeric($rawId) ? (int)$rawId : 0;
        $slug = trim($input['slug'] ?? (!is_numeric($rawId) && is_string($rawId) ? $rawId : ''));
        if ($id <= 0 && $slug === '') {
            larrRespond(["success" => false, "message" => "Valid page ID or slug required."], 422);
        }

        $target = $id > 0 ? "id = {$id}" : "slug = " . $conn->quote($slug);
        $page = $conn->query("SELECT * FROM la_rr_pages WHERE {$target}")->fetch();
        if (!$page) {
            larrRespond(["success" => false, "message" => "Page not found."], 404);
        }

        $navLabel = trim($input['nav_label'] ?? $page['nav_label']);
        $title = trim($input['title'] ?? $page['title']);
        $subtitle = isset($input['subtitle']) ? trim($input['subtitle']) : $page['subtitle'];
        $badge = trim($input['badge'] ?? $page['badge']);
        $category = trim($input['category'] ?? $page['category']);
        $newSlug = trim($input['new_slug'] ?? $page['slug']);

        try {
            $stmt = $conn->prepare("UPDATE la_rr_pages SET slug = ?, nav_label = ?, title = ?, subtitle = ?, badge = ?, category = ? WHERE id = ?");
            $stmt->execute([$newSlug, $navLabel, $title, $subtitle, $badge, $category, $page['id']]);

            larrRespond([
                "success" => true,
                "message" => "Page metadata updated successfully.",
                "data" => [
                    "id" => (int)$page['id'],
                    "slug" => $newSlug,
                    "nav_label" => $navLabel,
                    "title" => $title,
                    "subtitle" => $subtitle,
                    "badge" => $badge,
                    "category" => $category
                ]
            ]);
        } catch (PDOException $e) {
            larrRespond(["success" => false, "message" => "Update failed: " . $e->getMessage()], 500);
        }
    }

    // 3. DELETE PAGE
    if ($action === 'delete_page') {
        $rawId = $input['id'] ?? ($input['page_id'] ?? null);
        $id = is_numeric($rawId) ? (int)$rawId : 0;
        $slug = trim($input['slug'] ?? (!is_numeric($rawId) && is_string($rawId) ? $rawId : ''));
        if ($id <= 0 && $slug === '') {
            larrRespond(["success" => false, "message" => "Valid page ID or slug required."], 422);
        }
        $target = $id > 0 ? "id = ?" : "slug = ?";
        $param = $id > 0 ? $id : $slug;

        try {
            $stmt = $conn->prepare("DELETE FROM la_rr_pages WHERE {$target}");
            $stmt->execute([$param]);
            larrRespond(["success" => true, "message" => "Page deleted successfully."]);
        } catch (PDOException $e) {
            larrRespond(["success" => false, "message" => "Delete failed: " . $e->getMessage()], 500);
        }
    }

    // 4. ADD DOCUMENT (PDF) TO PAGE
    if ($action === 'add_document') {
        $rawPageId = $input['page_id'] ?? ($input['id'] ?? null);
        $pageId = is_numeric($rawPageId) ? (int)$rawPageId : 0;
        $slug = trim($input['slug'] ?? (!is_numeric($rawPageId) && is_string($rawPageId) ? $rawPageId : ''));
        $docTitle = trim($input['title'] ?? '');
        $docUrl = trim($input['url'] ?? '');
        $docFilename = trim($input['filename'] ?? basename($docUrl));
        $docSize = trim($input['size'] ?? 'Official PDF');
        $docDate = trim($input['date'] ?? date('d/m/Y'));

        if (($pageId <= 0 && $slug === '') || $docTitle === '' || $docUrl === '') {
            larrRespond(["success" => false, "message" => "Page ID, document title, and document URL are required."], 422);
        }

        $target = $pageId > 0 ? "id = {$pageId}" : "slug = " . $conn->quote($slug);
        $page = $conn->query("SELECT id, content_json FROM la_rr_pages WHERE {$target}")->fetch();
        if (!$page) {
            larrRespond(["success" => false, "message" => "Target page not found."], 404);
        }

        $content = json_decode($page['content_json'] ?? '{}', true) ?: [];
        $downloads = $content['downloads'] ?? [];

        $newDoc = [
            "id" => time() . '_' . rand(100, 999),
            "text" => $docTitle,
            "title" => $docTitle,
            "filename" => $docFilename,
            "url" => $docUrl,
            "size" => $docSize,
            "date" => $docDate
        ];
        $downloads[] = $newDoc;
        $content['downloads'] = $downloads;

        $stmt = $conn->prepare("UPDATE la_rr_pages SET content_json = ? WHERE id = ?");
        $stmt->execute([json_encode($content, JSON_UNESCAPED_UNICODE), $page['id']]);

        larrRespond([
            "success" => true,
            "message" => "Document added successfully.",
            "document" => $newDoc,
            "downloads" => $downloads
        ]);
    }

    // 5. UPDATE DOCUMENT IN PAGE
    if ($action === 'update_document') {
        $rawPageId = $input['page_id'] ?? ($input['id'] ?? null);
        $pageId = is_numeric($rawPageId) ? (int)$rawPageId : 0;
        $slug = trim($input['slug'] ?? (!is_numeric($rawPageId) && is_string($rawPageId) ? $rawPageId : ''));
        $docIndex = isset($input['doc_index']) ? (int)$input['doc_index'] : -1;

        if (($pageId <= 0 && $slug === '') || $docIndex < 0) {
            larrRespond(["success" => false, "message" => "page_id/slug and doc_index are required."], 422);
        }

        $target = $pageId > 0 ? "id = {$pageId}" : "slug = " . $conn->quote($slug);
        $page = $conn->query("SELECT id, content_json FROM la_rr_pages WHERE {$target}")->fetch();
        if (!$page) {
            larrRespond(["success" => false, "message" => "Target page not found."], 404);
        }

        $content = json_decode($page['content_json'] ?? '{}', true) ?: [];
        $downloads = $content['downloads'] ?? [];

        if (!isset($downloads[$docIndex])) {
            larrRespond(["success" => false, "message" => "Document index out of range."], 404);
        }

        if (isset($input['title'])) {
            $downloads[$docIndex]['title'] = trim($input['title']);
            $downloads[$docIndex]['text'] = trim($input['title']);
        }
        if (isset($input['url'])) {
            $downloads[$docIndex]['url'] = trim($input['url']);
        }
        if (isset($input['filename'])) {
            $downloads[$docIndex]['filename'] = trim($input['filename']);
        }
        if (isset($input['size'])) {
            $downloads[$docIndex]['size'] = trim($input['size']);
        }
        if (isset($input['date'])) {
            $downloads[$docIndex]['date'] = trim($input['date']);
        }

        $content['downloads'] = $downloads;
        $stmt = $conn->prepare("UPDATE la_rr_pages SET content_json = ? WHERE id = ?");
        $stmt->execute([json_encode($content, JSON_UNESCAPED_UNICODE), $page['id']]);

        larrRespond([
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

        if (($pageId <= 0 && $slug === '') || $docIndex < 0) {
            larrRespond(["success" => false, "message" => "page_id/slug and doc_index are required."], 422);
        }

        $target = $pageId > 0 ? "id = {$pageId}" : "slug = " . $conn->quote($slug);
        $page = $conn->query("SELECT id, content_json FROM la_rr_pages WHERE {$target}")->fetch();
        if (!$page) {
            larrRespond(["success" => false, "message" => "Target page not found."], 404);
        }

        $content = json_decode($page['content_json'] ?? '{}', true) ?: [];
        $downloads = $content['downloads'] ?? [];

        if (isset($downloads[$docIndex])) {
            array_splice($downloads, $docIndex, 1);
            $content['downloads'] = $downloads;
            $stmt = $conn->prepare("UPDATE la_rr_pages SET content_json = ? WHERE id = ?");
            $stmt->execute([json_encode($content, JSON_UNESCAPED_UNICODE), $page['id']]);

            larrRespond([
                "success" => true,
                "message" => "Document deleted successfully.",
                "downloads" => $downloads
            ]);
        } else {
            larrRespond(["success" => false, "message" => "Document index not found."], 404);
        }
    }

    // 7. SAVE COMPLETE PAGE CONTENT (downloads, tables, images, videos, paragraphs)
    if ($action === 'save_content') {
        $rawPageId = $input['page_id'] ?? ($input['id'] ?? null);
        $pageId = is_numeric($rawPageId) ? (int)$rawPageId : 0;
        $slug = trim($input['slug'] ?? (!is_numeric($rawPageId) && is_string($rawPageId) ? $rawPageId : ''));

        if ($pageId <= 0 && $slug !== '') {
            $stmt = $conn->prepare("SELECT id, content_json FROM la_rr_pages WHERE slug = ? OR LOWER(slug) = LOWER(?) LIMIT 1");
            $stmt->execute([$slug, $slug]);
            $page = $stmt->fetch();
            if ($page) {
                $pageId = (int)$page['id'];
            }
        } else if ($pageId > 0) {
            $stmt = $conn->prepare("SELECT id, content_json FROM la_rr_pages WHERE id = ? LIMIT 1");
            $stmt->execute([$pageId]);
            $page = $stmt->fetch();
        } else {
            $page = null;
        }

        if (!$page || $pageId <= 0) {
            larrRespond(["success" => false, "message" => "Target page not found."], 404);
        }

        $content = json_decode($page['content_json'] ?? '{}', true) ?: [];

        if (isset($input['content']) && is_array($input['content'])) {
            $c = $input['content'];
            if (isset($c['downloads'])) $content['downloads'] = $c['downloads'];
            if (isset($c['tables'])) $content['tables'] = $c['tables'];
            if (isset($c['images'])) $content['images'] = $c['images'];
            if (isset($c['videos'])) $content['videos'] = $c['videos'];
            if (isset($c['paragraphs'])) $content['paragraphs'] = $c['paragraphs'];
            if (isset($c['stats'])) $content['stats'] = $c['stats'];
            if (isset($c['sections'])) $content['sections'] = $c['sections'];
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
            if (isset($input['sections']) && is_array($input['sections'])) {
                $content['sections'] = $input['sections'];
            }
        }

        // Optional metadata updates included in save
        $updates = [];
        $params = [json_encode($content, JSON_UNESCAPED_UNICODE)];
        $sql = "UPDATE la_rr_pages SET content_json = ?";

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
        if (isset($input['badge'])) {
            $sql .= ", badge = ?";
            $params[] = trim($input['badge']);
        }
        if (isset($input['category'])) {
            $sql .= ", category = ?";
            $params[] = trim($input['category']);
        }

        $sql .= " WHERE id = ?";
        $params[] = $pageId;

        $stmt = $conn->prepare($sql);
        $stmt->execute($params);

        larrRespond([
            "success" => true,
            "message" => "Page content saved successfully.",
            "data" => $content
        ]);
    }

    // 8. REORDER PAGES
    if ($action === 'reorder_pages') {
        $orderedIds = $input['ordered_ids'] ?? [];
        if (!is_array($orderedIds) || empty($orderedIds)) {
            larrRespond(["success" => false, "message" => "ordered_ids array required."], 422);
        }

        $stmt = $conn->prepare("UPDATE la_rr_pages SET sort_order = ? WHERE id = ?");
        foreach ($orderedIds as $index => $id) {
            $stmt->execute([$index + 1, (int)$id]);
        }

        larrRespond(["success" => true, "message" => "Pages reordered successfully."]);
    }

    larrRespond(["success" => false, "message" => "Unknown action."], 400);
}

