<?php
require_once __DIR__ . '/config.php';

function achieveRespond($payload, $status = 200) {
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
    achieveRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

if (!$conn) {
    achieveRespond(["success" => false, "message" => "Database connection unavailable. Check MySQL in XAMPP."], 503);
}

$method = $_SERVER['REQUEST_METHOD'];

// Ensure table exists
require_once __DIR__ . '/get_achievements_pages.php';

$achHasParentSlug = false;
try {
    $cols = $conn->query("SHOW COLUMNS FROM achievements_pages LIKE 'parent_slug'")->fetchAll();
    $achHasParentSlug = $cols && count($cols) > 0;
} catch (Exception $e) { $achHasParentSlug = false; }

if ($method === 'GET') {
    try {
        $requestedId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        $requestedSlug = isset($_GET['slug']) ? trim($_GET['slug']) : '';

        if ($requestedId > 0 || $requestedSlug !== '') {
            $sql = $requestedId > 0
                ? "SELECT * FROM achievements_pages WHERE id = ?"
                : "SELECT * FROM achievements_pages WHERE slug = ? OR LOWER(slug) = LOWER(?)";
            $params = $requestedId > 0 ? [$requestedId] : [$requestedSlug, $requestedSlug];

            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            $row = $stmt->fetch();

            if ($row) {
                $content = json_decode($row['content_json'] ?? '{}', true) ?: [];
                $images = $content['images'] ?? [];

                $parentSlug = $row['parent_slug'] ?? ($content['parent_slug'] ?? '');
                $pageContent = [
                    "slug" => $row['slug'],
                    "title" => $row['title'],
                    "nav_label" => $row['nav_label'],
                    "category" => $row['category'],
                    "badge" => $row['badge'],
                    "subtitle" => $row['subtitle'],
                    "parent_slug" => $parentSlug,
                    "paragraphs" => $content['paragraphs'] ?? [],
                    "downloads" => $content['downloads'] ?? [],
                    "tables" => $content['tables'] ?? [],
                    "images" => $images,
                    "videos" => $content['videos'] ?? [],
                    "stats" => $content['stats'] ?? []
                ];

                achieveRespond([
                    "success" => true,
                    "data" => [
                        "id" => (int)$row['id'],
                        "slug" => $row['slug'],
                        "nav_label" => $row['nav_label'],
                        "title" => $row['title'],
                        "category" => $row['category'],
                        "badge" => $row['badge'],
                        "subtitle" => $row['subtitle'],
                        "parent_slug" => $parentSlug,
                        "content" => $pageContent,
                        "updated_at" => $row['updated_at']
                    ]
                ]);
            } else {
                achieveRespond(["success" => false, "message" => "Page not found"], 404);
            }
        } else {
            $stmt = $conn->query("SELECT * FROM achievements_pages WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
            $rows = $stmt->fetchAll();
            $pages = [];
            foreach ($rows as $r) {
                $content = json_decode($r['content_json'] ?? '{}', true) ?: [];
                $pages[] = [
                    "id" => (int)$r['id'],
                    "slug" => $r['slug'],
                    "nav_label" => $r['nav_label'],
                    "title" => $r['title'],
                    "category" => $r['category'],
                    "badge" => $r['badge'],
                    "subtitle" => $r['subtitle'],
                    "sort_order" => (int)$r['sort_order'],
                    "parent_slug" => $r['parent_slug'] ?? ($content['parent_slug'] ?? ''),
                    "is_active" => isset($r['is_active']) ? (int)$r['is_active'] : 1,
                    "docs_count" => count($content['downloads'] ?? []),
                    "images_count" => count($content['images'] ?? []),
                    "videos_count" => count($content['videos'] ?? []),
                    "tables_count" => count($content['tables'] ?? []),
                    "stats_count" => count($content['stats'] ?? []),
                    "updated_at" => $r['updated_at']
                ];
            }
            achieveRespond(["success" => true, "data" => $pages]);
        }
    } catch (PDOException $e) {
        achieveRespond(["success" => false, "message" => $e->getMessage()], 500);
    }
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true) ?: $_POST;
    $action = $input['action'] ?? '';

    // 1. CREATE PAGE
    if ($action === 'create_page') {
        $navLabel = trim($input['nav_label'] ?? ($input['name'] ?? ($input['title'] ?? '')));
        if (!$navLabel) {
            achieveRespond(["success" => false, "message" => "Page Name is required."], 400);
        }

        $rawSlug = trim($input['slug'] ?? '');
        if (!$rawSlug) {
            $rawSlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $navLabel));
            $rawSlug = trim($rawSlug, '-');
        } else {
            $rawSlug = strtolower(preg_replace('/[^a-zA-Z0-9_-]/', '-', $rawSlug));
            $rawSlug = trim($rawSlug, '-');
        }
        if (!$rawSlug) {
            $rawSlug = 'page-' . time();
        }

        $baseSlug = $rawSlug;
        $slug = $baseSlug;
        $suffix = 2;
        while (true) {
            $stmt = $conn->prepare("SELECT id FROM achievements_pages WHERE slug = ?");
            $stmt->execute([$slug]);
            if (!$stmt->fetch()) {
                break;
            }
            $slug = $baseSlug . '-' . $suffix;
            $suffix++;
        }

        $title = trim($input['title'] ?? '');
        if (!$title) {
            $title = $navLabel;
        }

        $category = trim($input['category'] ?? 'Achievements');
        $badge = trim($input['badge'] ?? 'Achievements & Impact');
        $subtitle = trim($input['subtitle'] ?? "Official documentation and impact reports for {$title}.");
        $parentSlug = trim($input['parent_slug'] ?? ($input['parentSlug'] ?? ''));

        $maxOrder = (int)$conn->query("SELECT MAX(sort_order) FROM achievements_pages")->fetchColumn();
        $sortOrder = $maxOrder + 1;

        $contentJson = json_encode([
            "slug" => $slug,
            "title" => $title,
            "nav_label" => $navLabel,
            "category" => $category,
            "badge" => $badge,
            "subtitle" => $subtitle,
            "parent_slug" => $parentSlug,
            "paragraphs" => [],
            "downloads" => [],
            "tables" => [],
            "images" => [],
            "videos" => [],
            "stats" => []
        ], JSON_UNESCAPED_UNICODE);

        try {
            if ($achHasParentSlug) {
                $stmt = $conn->prepare("INSERT INTO achievements_pages (slug, nav_label, title, category, badge, subtitle, content_json, sort_order, is_active, parent_slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)");
                $stmt->execute([$slug, $navLabel, $title, $category, $badge, $subtitle, $contentJson, $sortOrder, $parentSlug]);
            } else {
                $stmt = $conn->prepare("INSERT INTO achievements_pages (slug, nav_label, title, category, badge, subtitle, content_json, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)");
                $stmt->execute([$slug, $navLabel, $title, $category, $badge, $subtitle, $contentJson, $sortOrder]);
            }
            $newId = (int)$conn->lastInsertId();

            achieveRespond([
                "success" => true,
                "message" => "New Achievements dropdown page created successfully.",
                "data" => [
                    "id" => $newId,
                    "slug" => $slug,
                    "nav_label" => $navLabel,
                    "title" => $title,
                    "parent_slug" => $parentSlug
                ]
            ], 201);
        } catch (Exception $e) {
            achieveRespond(["success" => false, "message" => "Failed to create page: " . $e->getMessage()], 500);
        }
    }

    // 2. RENAME / UPDATE METADATA
    if ($action === 'rename_page' || $action === 'update_page') {
        $slug = trim($input['slug'] ?? '');
        $pageId = (int)($input['page_id'] ?? ($input['id'] ?? 0));

        if ($pageId <= 0 && !$slug) {
            achieveRespond(["success" => false, "message" => "Page ID or slug is required."], 400);
        }

        $sql = $pageId > 0 ? "SELECT * FROM achievements_pages WHERE id = ?" : "SELECT * FROM achievements_pages WHERE slug = ? OR LOWER(slug) = LOWER(?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute($pageId > 0 ? [$pageId] : [$slug, $slug]);
        $page = $stmt->fetch();

        if (!$page) {
            achieveRespond(["success" => false, "message" => "Page not found."], 404);
        }

        $navLabel = isset($input['nav_label']) ? trim($input['nav_label']) : $page['nav_label'];
        $title = isset($input['title']) ? trim($input['title']) : $page['title'];
        $category = isset($input['category']) ? trim($input['category']) : $page['category'];
        $badge = isset($input['badge']) ? trim($input['badge']) : $page['badge'];
        $subtitle = isset($input['subtitle']) ? trim($input['subtitle']) : $page['subtitle'];
        $parentSlug = array_key_exists('parent_slug', $input) ? trim($input['parent_slug'] ?? '') : (array_key_exists('parentSlug', $input) ? trim($input['parentSlug'] ?? '') : ($page['parent_slug'] ?? ''));

        $content = json_decode($page['content_json'] ?? '{}', true) ?: [];
        $content['nav_label'] = $navLabel;
        $content['title'] = $title;
        $content['category'] = $category;
        $content['badge'] = $badge;
        $content['subtitle'] = $subtitle;
        $content['parent_slug'] = $parentSlug;

        if ($achHasParentSlug) {
            $stmt = $conn->prepare("UPDATE achievements_pages SET nav_label = ?, title = ?, category = ?, badge = ?, subtitle = ?, parent_slug = ?, content_json = ? WHERE id = ?");
            $stmt->execute([$navLabel, $title, $category, $badge, $subtitle, $parentSlug, json_encode($content, JSON_UNESCAPED_UNICODE), $page['id']]);
        } else {
            $stmt = $conn->prepare("UPDATE achievements_pages SET nav_label = ?, title = ?, category = ?, badge = ?, subtitle = ?, content_json = ? WHERE id = ?");
            $stmt->execute([$navLabel, $title, $category, $badge, $subtitle, json_encode($content, JSON_UNESCAPED_UNICODE), $page['id']]);
        }

        achieveRespond(["success" => true, "message" => "Page updated successfully."]);
    }

    // 3. DELETE PAGE
    if ($action === 'delete_page') {
        $slug = trim($input['slug'] ?? '');
        $pageId = (int)($input['page_id'] ?? ($input['id'] ?? 0));

        if ($pageId <= 0 && !$slug) {
            achieveRespond(["success" => false, "message" => "Page ID or slug is required."], 400);
        }

        $sql = $pageId > 0 ? "SELECT * FROM achievements_pages WHERE id = ?" : "SELECT * FROM achievements_pages WHERE slug = ? OR LOWER(slug) = LOWER(?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute($pageId > 0 ? [$pageId] : [$slug, $slug]);
        $page = $stmt->fetch();

        if (!$page) {
            achieveRespond(["success" => false, "message" => "Page not found."], 404);
        }

        if ($page['slug'] === 'achievements') {
            achieveRespond(["success" => false, "message" => "The primary Achievements overview page cannot be deleted."], 400);
        }

        $stmt = $conn->prepare("DELETE FROM achievements_pages WHERE id = ?");
        $stmt->execute([$page['id']]);

        achieveRespond(["success" => true, "message" => "Page deleted successfully."]);
    }

    // 4. SAVE FULL PAGE CONTENT
    if ($action === 'save_page' || $action === 'update_content') {
        $slug = trim($input['slug'] ?? '');
        $pageId = (int)($input['page_id'] ?? ($input['id'] ?? 0));

        if ($pageId <= 0 && !$slug) {
            achieveRespond(["success" => false, "message" => "Page ID or slug is required."], 400);
        }

        $sql = $pageId > 0 ? "SELECT * FROM achievements_pages WHERE id = ?" : "SELECT * FROM achievements_pages WHERE slug = ? OR LOWER(slug) = LOWER(?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute($pageId > 0 ? [$pageId] : [$slug, $slug]);
        $page = $stmt->fetch();

        $content = $input['content'] ?? [];
        if (is_string($content)) {
            $content = json_decode($content, true) ?: [];
        }

        if (!$page) {
            // Upsert: Create entry if not existing yet
            $title = trim($input['title'] ?? ($content['title'] ?? ucwords(str_replace('-', ' ', $slug))));
            $navLabel = trim($input['nav_label'] ?? ($content['nav_label'] ?? $title));
            $category = trim($input['category'] ?? ($content['category'] ?? 'Achievements'));
            $badge = trim($input['badge'] ?? ($content['badge'] ?? 'Achievements & Impact'));
            $subtitle = trim($input['subtitle'] ?? ($content['subtitle'] ?? "Official documentation and impact reports for {$title}."));
            $parentSlug = trim($input['parent_slug'] ?? ($content['parent_slug'] ?? ($input['parentSlug'] ?? '')));

            $content['title'] = $title;
            $content['nav_label'] = $navLabel;
            $content['category'] = $category;
            $content['badge'] = $badge;
            $content['subtitle'] = $subtitle;
            $content['parent_slug'] = $parentSlug;

            $maxOrder = (int)$conn->query("SELECT MAX(sort_order) FROM achievements_pages")->fetchColumn();
            $sortOrder = $maxOrder + 1;

            if ($achHasParentSlug) {
                $stmt = $conn->prepare("INSERT INTO achievements_pages (slug, nav_label, title, category, badge, subtitle, content_json, sort_order, is_active, parent_slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)");
                $stmt->execute([
                    $slug,
                    $navLabel,
                    $title,
                    $category,
                    $badge,
                    $subtitle,
                    json_encode($content, JSON_UNESCAPED_UNICODE),
                    $sortOrder,
                    $parentSlug
                ]);
            } else {
                $stmt = $conn->prepare("INSERT INTO achievements_pages (slug, nav_label, title, category, badge, subtitle, content_json, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)");
                $stmt->execute([
                    $slug,
                    $navLabel,
                    $title,
                    $category,
                    $badge,
                    $subtitle,
                    json_encode($content, JSON_UNESCAPED_UNICODE),
                    $sortOrder
                ]);
            }

            achieveRespond(["success" => true, "message" => "Page created and content saved successfully."]);
        }

        $title = isset($input['title']) ? trim($input['title']) : ($content['title'] ?? $page['title']);
        $navLabel = isset($input['nav_label']) ? trim($input['nav_label']) : ($content['nav_label'] ?? $page['nav_label']);
        $category = isset($input['category']) ? trim($input['category']) : ($content['category'] ?? $page['category']);
        $badge = isset($input['badge']) ? trim($input['badge']) : ($content['badge'] ?? $page['badge']);
        $subtitle = isset($input['subtitle']) ? trim($input['subtitle']) : ($content['subtitle'] ?? $page['subtitle']);
        $parentSlug = array_key_exists('parent_slug', $input) ? trim($input['parent_slug'] ?? '') : (array_key_exists('parentSlug', $input) ? trim($input['parentSlug'] ?? '') : ($content['parent_slug'] ?? ($page['parent_slug'] ?? '')));

        $content['title'] = $title;
        $content['nav_label'] = $navLabel;
        $content['category'] = $category;
        $content['badge'] = $badge;
        $content['subtitle'] = $subtitle;
        $content['parent_slug'] = $parentSlug;

        if ($achHasParentSlug) {
            $stmt = $conn->prepare("UPDATE achievements_pages SET title = ?, nav_label = ?, category = ?, badge = ?, subtitle = ?, parent_slug = ?, content_json = ? WHERE id = ?");
            $stmt->execute([
                $title,
                $navLabel,
                $category,
                $badge,
                $subtitle,
                $parentSlug,
                json_encode($content, JSON_UNESCAPED_UNICODE),
                $page['id']
            ]);
        } else {
            $stmt = $conn->prepare("UPDATE achievements_pages SET title = ?, nav_label = ?, category = ?, badge = ?, subtitle = ?, content_json = ? WHERE id = ?");
            $stmt->execute([
                $title,
                $navLabel,
                $category,
                $badge,
                $subtitle,
                json_encode($content, JSON_UNESCAPED_UNICODE),
                $page['id']
            ]);
        }

        achieveRespond(["success" => true, "message" => "Page content saved successfully."]);
    }

    // 5. UPLOAD FILE (PDF / Document)
    if ($action === 'upload_file') {
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            achieveRespond(["success" => false, "message" => "No file uploaded or upload error occurred."], 400);
        }

        $f = $_FILES['file'];
        $ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
        $allowed = ['pdf', 'doc', 'docx', 'xlsx', 'xls', 'ppt', 'pptx', 'txt', 'zip', 'jpg', 'jpeg', 'png', 'webp'];
        if (!in_array($ext, $allowed)) {
            achieveRespond(["success" => false, "message" => "File type .{$ext} is not allowed."], 400);
        }

        $safeName = 'achieve_' . time() . '_' . substr(md5(uniqid()), 0, 6) . '.' . $ext;
        $frontDir = dirname(__DIR__) . '/frontend/public/uploads/achievements';
        $backDir = __DIR__ . '/uploads/achievements';

        if (!is_dir($frontDir)) @mkdir($frontDir, 0777, true);
        if (!is_dir($backDir)) @mkdir($backDir, 0777, true);

        $frontDest = $frontDir . '/' . $safeName;
        $backDest = $backDir . '/' . $safeName;

        if (move_uploaded_file($f['tmp_name'], $frontDest)) {
            @copy($frontDest, $backDest);
            $url = '/uploads/achievements/' . $safeName;
            achieveRespond([
                "success" => true,
                "message" => "File uploaded successfully.",
                "url" => $url,
                "filename" => $f['name'],
                "fileSize" => round($f['size'] / 1024) . " KB"
            ]);
        } else {
            achieveRespond(["success" => false, "message" => "Failed to save uploaded file."], 500);
        }
    }

    achieveRespond(["success" => false, "message" => "Unsupported action."], 400);
}

achieveRespond(["success" => false, "message" => "Method not allowed."], 405);

