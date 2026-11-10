<?php
require_once __DIR__ . '/config.php';

function aboutRespond($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

$adminKey = getenv('ADMIN_KEY') ?: 'alertngo@123';
$validKeys = array_unique(array_filter([$adminKey, 'alertngo@123', 'alertngo-admin']));
$providedKey = $_SERVER['HTTP_X_ADMIN_KEY'] ?? '';

$authorized = false;
foreach ($validKeys as $vk) {
    if ($vk !== '' && hash_equals($vk, $providedKey)) {
        $authorized = true;
        break;
    }
}
if (!$authorized) {
    aboutRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

if (!$conn) {
    aboutRespond(["success" => false, "message" => "Database connection unavailable."], 503);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$rawBody = file_get_contents('php://input');
$input = json_decode($rawBody, true);
if (!is_array($input)) {
    $input = [];
}

try {
    if ($method === 'GET') {
        $slug = trim($_GET['slug'] ?? '');
        if ($slug !== '') {
            $stmt = $conn->prepare("SELECT slug, badge, title, subtitle, content_json, banner_image, updated_at FROM about_pages WHERE slug = ?");
            $stmt->execute([$slug]);
            $row = $stmt->fetch();
            if ($row) {
                $row['content'] = json_decode($row['content_json'], true) ?: [];
                aboutRespond(["success" => true, "data" => $row]);
            } else {
                aboutRespond(["success" => false, "message" => "Page not found."], 404);
            }
        }

        $allRows = $conn->query("SELECT slug, badge, title, subtitle, content_json, banner_image, updated_at FROM about_pages ORDER BY id ASC")->fetchAll();
        $pagesMap = [];
        foreach ($allRows as $r) {
            $r['content'] = json_decode($r['content_json'], true) ?: [];
            $pagesMap[$r['slug']] = $r;
        }
        aboutRespond(["success" => true, "data" => $pagesMap]);
    }

    if ($method === 'POST' || $method === 'PUT') {
        $slug = trim((string)($input['slug'] ?? ($_GET['slug'] ?? '')));
        if ($slug === '') {
            aboutRespond(["success" => false, "message" => "Page slug is required."], 422);
        }

        $title = trim((string)($input['title'] ?? ''));
        $badge = trim((string)($input['badge'] ?? 'About Us'));
        $subtitle = trim((string)($input['subtitle'] ?? ''));
        $bannerImage = isset($input['banner_image']) ? trim((string)$input['banner_image']) : null;
        $content = isset($input['content']) && is_array($input['content']) ? $input['content'] : [];
        $contentJson = json_encode($content, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        // Check if exists
        $stmtCheck = $conn->prepare("SELECT id FROM about_pages WHERE slug = ?");
        $stmtCheck->execute([$slug]);
        $existingId = (int)$stmtCheck->fetchColumn();

        if ($existingId > 0) {
            $stmt = $conn->prepare("UPDATE about_pages SET title = ?, badge = ?, subtitle = ?, content_json = ?, banner_image = ? WHERE id = ?");
            $stmt->execute([$title, $badge, $subtitle, $contentJson, $bannerImage, $existingId]);
        } else {
            $stmt = $conn->prepare("INSERT INTO about_pages (slug, title, badge, subtitle, content_json, banner_image) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$slug, $title, $badge, $subtitle, $contentJson, $bannerImage]);
        }

        aboutRespond([
            "success" => true,
            "message" => "About page '{$slug}' updated successfully.",
            "data" => [
                "slug" => $slug,
                "title" => $title,
                "badge" => $badge,
                "subtitle" => $subtitle,
                "content" => $content,
                "banner_image" => $bannerImage
            ]
        ]);
    }

    aboutRespond(["success" => false, "message" => "Method not supported."], 405);
} catch (Exception $e) {
    aboutRespond(["success" => false, "message" => "Server error: " . $e->getMessage()], 500);
}
