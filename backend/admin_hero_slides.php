<?php
require_once __DIR__ . '/config.php';

function heroRespond($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

// Simple admin authentication (shared key from backend/.env or admin login)
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
    heroRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

if (!$conn) {
    heroRespond(["success" => false, "message" => "Database is not available. Check MySQL in XAMPP."], 503);
}

function ensureHeroTable($conn) {
    try {
        $conn->exec("CREATE TABLE IF NOT EXISTS hero_slides (
            id INT AUTO_INCREMENT PRIMARY KEY,
            image_url LONGTEXT NOT NULL,
            subtitle VARCHAR(255) DEFAULT '',
            is_active TINYINT(1) DEFAULT 1,
            sort_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $count = $conn->query("SELECT COUNT(*) FROM hero_slides")->fetchColumn();
        if ((int)$count === 0) {
            $defaults = [
                ['/uploads/submergence-area-map-1.jpg', 'Defending Adivasi Forest & Land Rights', 1, 1],
                ['/uploads/all2023.jpeg', 'Flood Relief & Emergency Provisioning', 1, 2],
                ['/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg', 'Empowering Marginalized Communities', 1, 3],
                ['/uploads/PHOTO-2023-02-15-19-20-55_1.jpg', 'Revitalizing Gram Sabha Self-Governance', 1, 4],
                ['/uploads/WhatsApp-Image-2021-09-16-at-7.50.55-PM-1024x461.jpeg', 'Project Green Energy: Solar Future', 1, 5]
            ];
            $ins = $conn->prepare("INSERT INTO hero_slides (image_url, subtitle, is_active, sort_order) VALUES (?, ?, ?, ?)");
            foreach ($defaults as $d) {
                $ins->execute($d);
            }
        }
    } catch (Exception $e) {}
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$rawBody = file_get_contents('php://input');
$input = json_decode($rawBody, true);
if (!is_array($input)) {
    $input = [];
}

try {
    ensureHeroTable($conn);

    if ($method === 'GET') {
        $rows = $conn->query("SELECT id, image_url, subtitle, is_active, sort_order, created_at, updated_at FROM hero_slides ORDER BY sort_order ASC, id ASC")->fetchAll();
        heroRespond(["success" => true, "data" => $rows]);
    }

    if ($method === 'POST') {
        $imageUrl = trim((string)($input['image_url'] ?? ''));
        if ($imageUrl === '') {
            heroRespond(["success" => false, "message" => "Image URL is required."], 422);
        }
        $subtitle = trim((string)($input['subtitle'] ?? ''));
        $isActive = array_key_exists('is_active', $input) ? ((int)$input['is_active'] ? 1 : 0) : 1;
        $sortOrder = array_key_exists('sort_order', $input) ? (int)$input['sort_order'] : 0;

        $stmt = $conn->prepare("INSERT INTO hero_slides (image_url, subtitle, is_active, sort_order) VALUES (?, ?, ?, ?)");
        $stmt->execute([$imageUrl, $subtitle, $isActive, $sortOrder]);

        heroRespond(["success" => true, "data" => ["id" => (int)$conn->lastInsertId()]], 201);
    }

    if ($method === 'PUT' || $method === 'PATCH') {
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) {
            heroRespond(["success" => false, "message" => "A valid id is required."], 422);
        }

        $fields = [];
        $params = [];

        if (array_key_exists('image_url', $input)) {
            $imageUrl = trim((string)$input['image_url']);
            if ($imageUrl === '') {
                heroRespond(["success" => false, "message" => "Image URL cannot be empty."], 422);
            }
            $fields[] = "image_url = ?";
            $params[] = $imageUrl;
        }
        if (array_key_exists('subtitle', $input)) {
            $fields[] = "subtitle = ?";
            $params[] = trim((string)$input['subtitle']);
        }
        if (array_key_exists('is_active', $input)) {
            $fields[] = "is_active = ?";
            $params[] = (int)$input['is_active'] ? 1 : 0;
        }
        if (array_key_exists('sort_order', $input)) {
            $fields[] = "sort_order = ?";
            $params[] = (int)$input['sort_order'];
        }

        if (!$fields) {
            heroRespond(["success" => false, "message" => "Nothing to update."], 422);
        }

        $params[] = $id;
        $stmt = $conn->prepare("UPDATE hero_slides SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($params);

        heroRespond(["success" => true, "message" => "Hero slide updated."]);
    }

    if ($method === 'DELETE') {
        $id = (int)($_GET['id'] ?? ($input['id'] ?? 0));
        if ($id <= 0) {
            heroRespond(["success" => false, "message" => "A valid id is required."], 422);
        }

        $stmt = $conn->prepare("DELETE FROM hero_slides WHERE id = ?");
        $stmt->execute([$id]);

        heroRespond(["success" => true, "message" => "Hero slide deleted."]);
    }

    heroRespond(["success" => false, "message" => "Method not allowed."], 405);
} catch (PDOException $e) {
    if ($method === 'GET') {
        $defaults = [
            ["id" => 1, "image_url" => "/uploads/submergence-area-map-1.jpg", "subtitle" => "Defending Adivasi Forest & Land Rights", "sort_order" => 1, "is_active" => 1],
            ["id" => 2, "image_url" => "/uploads/all2023.jpeg", "subtitle" => "Flood Relief & Emergency Provisioning", "sort_order" => 2, "is_active" => 1],
            ["id" => 3, "image_url" => "/uploads/WhatsApp-Image-2021-08-19-at-6.48.06-PM-1024x768.jpeg", "subtitle" => "Empowering Marginalized Communities", "sort_order" => 3, "is_active" => 1],
            ["id" => 4, "image_url" => "/uploads/PHOTO-2023-02-15-19-20-55_1.jpg", "subtitle" => "Revitalizing Gram Sabha Self-Governance", "sort_order" => 4, "is_active" => 1],
            ["id" => 5, "image_url" => "/uploads/WhatsApp-Image-2021-09-16-at-7.50.55-PM-1024x461.jpeg", "subtitle" => "Project Green Energy: Solar Future", "sort_order" => 5, "is_active" => 1]
        ];
        heroRespond(["success" => true, "data" => $defaults]);
    }
    heroRespond(["success" => false, "message" => "Database error: " . $e->getMessage()], 500);
}
