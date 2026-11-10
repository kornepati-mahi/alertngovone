<?php
require_once __DIR__ . '/config.php';

function featureRespond($payload, $status = 200) {
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
    featureRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

if (!$conn) {
    featureRespond(["success" => false, "message" => "Database is not available. Check MySQL in XAMPP."], 503);
}

function ensureFeaturesTable($conn) {
    try {
        $conn->exec("CREATE TABLE IF NOT EXISTS home_features (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            description TEXT NOT NULL,
            link_url VARCHAR(255) DEFAULT '/about',
            icon_name VARCHAR(100) DEFAULT 'bank',
            is_active TINYINT(1) DEFAULT 1,
            sort_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $count = $conn->query("SELECT COUNT(*) FROM home_features")->fetchColumn();
        if ((int)$count === 0) {
            $defaults = [
                ['Our Work', 'ALERT, established in 2004, specializes in empowering Adivasis in the Fifth Scheduled Areas of Andhra Pradesh through rights-based approaches.', '/about', 'bank', 1, 1],
                ['Our Vision', 'Empowerment of socially excluded and marginalized communities towards prosperity and peace through constitutional rights-based development.', '/about', 'note', 1, 2],
                ['Our Mission', 'To awaken, sensitize, organize and mobilize Adivasi communities for Self-governance, self-reliance, and sustainable environment.', '/about', 'target', 1, 3]
            ];
            $ins = $conn->prepare("INSERT INTO home_features (title, description, link_url, icon_name, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
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
    ensureFeaturesTable($conn);

    if ($method === 'GET') {
        $rows = $conn->query("SELECT id, title, description, link_url, icon_name, is_active, sort_order, created_at, updated_at FROM home_features ORDER BY sort_order ASC, id ASC")->fetchAll();
        featureRespond(["success" => true, "data" => $rows]);
    }

    if ($method === 'POST') {
        $title = trim((string)($input['title'] ?? ''));
        $description = trim((string)($input['description'] ?? ''));
        if ($title === '') {
            featureRespond(["success" => false, "message" => "Title is required."], 422);
        }
        if ($description === '') {
            featureRespond(["success" => false, "message" => "Description is required."], 422);
        }

        $linkUrl = trim((string)($input['link_url'] ?? '/about')) ?: '/about';
        $iconName = trim((string)($input['icon_name'] ?? 'university')) ?: 'university';
        $isActive = array_key_exists('is_active', $input) ? ((int)$input['is_active'] ? 1 : 0) : 1;
        $sortOrder = array_key_exists('sort_order', $input) ? (int)$input['sort_order'] : 0;

        $stmt = $conn->prepare("INSERT INTO home_features (title, description, link_url, icon_name, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$title, $description, $linkUrl, $iconName, $isActive, $sortOrder]);

        featureRespond(["success" => true, "data" => ["id" => (int)$conn->lastInsertId()]], 201);
    }

    if ($method === 'PUT' || $method === 'PATCH') {
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) {
            featureRespond(["success" => false, "message" => "A valid id is required."], 422);
        }

        $fields = [];
        $params = [];

        if (array_key_exists('title', $input)) {
            $title = trim((string)$input['title']);
            if ($title === '') {
                featureRespond(["success" => false, "message" => "Title cannot be empty."], 422);
            }
            $fields[] = "title = ?";
            $params[] = $title;
        }
        if (array_key_exists('description', $input)) {
            $description = trim((string)$input['description']);
            if ($description === '') {
                featureRespond(["success" => false, "message" => "Description cannot be empty."], 422);
            }
            $fields[] = "description = ?";
            $params[] = $description;
        }
        if (array_key_exists('link_url', $input)) {
            $fields[] = "link_url = ?";
            $params[] = trim((string)$input['link_url']) ?: '/about';
        }
        if (array_key_exists('icon_name', $input)) {
            $fields[] = "icon_name = ?";
            $params[] = trim((string)$input['icon_name']) ?: 'university';
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
            featureRespond(["success" => false, "message" => "Nothing to update."], 422);
        }

        $params[] = $id;
        $stmt = $conn->prepare("UPDATE home_features SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($params);

        featureRespond(["success" => true, "message" => "Feature card updated."]);
    }

    if ($method === 'DELETE') {
        $id = (int)($_GET['id'] ?? ($input['id'] ?? 0));
        if ($id <= 0) {
            featureRespond(["success" => false, "message" => "A valid id is required."], 422);
        }

        $stmt = $conn->prepare("DELETE FROM home_features WHERE id = ?");
        $stmt->execute([$id]);

        featureRespond(["success" => true, "message" => "Feature card deleted."]);
    }

    featureRespond(["success" => false, "message" => "Method not allowed."], 405);
} catch (PDOException $e) {
    if ($method === 'GET') {
        $defaults = [
            ["id" => 1, "title" => "Our Work", "description" => "ALERT, established in 2004, specializes in empowering Adivasis in the Fifth Scheduled Areas of Andhra Pradesh through rights-based approaches.", "link_url" => "/about", "icon_name" => "bank", "is_active" => 1, "sort_order" => 1],
            ["id" => 2, "title" => "Our Vision", "description" => "Empowerment of socially excluded and marginalized communities towards prosperity and peace through constitutional rights-based development.", "link_url" => "/about", "icon_name" => "note", "is_active" => 1, "sort_order" => 2],
            ["id" => 3, "title" => "Our Mission", "description" => "To awaken, sensitize, organize and mobilize Adivasi communities for Self-governance, self-reliance, and sustainable environment.", "link_url" => "/about", "icon_name" => "target", "is_active" => 1, "sort_order" => 3]
        ];
        featureRespond(["success" => true, "data" => $defaults]);
    }
    featureRespond(["success" => false, "message" => "Database error: " . $e->getMessage()], 500);
}
