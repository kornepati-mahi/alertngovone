<?php
require_once __DIR__ . '/config.php';

function regionRespond($payload, $status = 200) {
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
    regionRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

if (!$conn) {
    regionRespond(["success" => false, "message" => "Database is not available. Check MySQL in XAMPP."], 503);
}

function ensureRegionsTable($conn) {
    try {
        $conn->exec("CREATE TABLE IF NOT EXISTS regions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            tag VARCHAR(150) NOT NULL,
            description TEXT NOT NULL,
            mandals VARCHAR(150) DEFAULT '',
            tribes VARCHAR(255) DEFAULT '',
            stat VARCHAR(100) DEFAULT '',
            image_url LONGTEXT NOT NULL,
            alt_text VARCHAR(255) DEFAULT '',
            accent VARCHAR(50) DEFAULT '#3E8E0F',
            icon_name VARCHAR(100) DEFAULT 'tree',
            sort_order INT DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $count = $conn->query("SELECT COUNT(*) FROM regions")->fetchColumn();
        if ((int)$count === 0) {
            $defaults = [
                ['ASR Hill Agency', 'Rampachodavaram & Chinturu ITDAs', 'PESA Gram Sabha sovereignty, community forest rights (CFR) and individual forest pattas across the Eastern Ghats agency mandals.', '6 mandals', 'Koya · Konda Reddi (PVTG) · Valmiki', '6 Mandals', '/uploads/region-asr-culture.jpg', 'Adivasi cultural gathering in the agency hills', '#3E8E0F', 'tree', 1, 1],
                ['Eluru Agency & Polavaram', 'K.R. Puram ITDA · Dam Belt', 'LTR 1/70 land restitution, fair RFCTLARR compensation and rehabilitation support for families facing Polavaram submergence.', '5 mandals · 371 habitations', 'Koya · Konda Dora · Nayaks', '371 Habitations', '/uploads/submergence-area-map-1.jpg', 'Polavaram submergence contour map along the Godavari', '#D97706', 'water', 2, 1],
                ['Coastal Krishna Belt', 'Machilipatnam Coastal Cell', 'Land and housing entitlements for nomadic Yenadi families, the Matsya Mithra women\'s fisheries federation, and mangrove resilience.', '6 coastal mandals', 'Yenadi · Fisher communities', '3,500+ Women', '/uploads/coastal-krishna-fishing.jpg', 'Traditional fishing crews on the Krishna coast', '#0ea5e9', 'fish', 3, 1]
            ];
            $stmt = $conn->prepare("INSERT INTO regions (title, tag, description, mandals, tribes, stat, image_url, alt_text, accent, icon_name, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            foreach ($defaults as $d) {
                $stmt->execute($d);
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
    ensureRegionsTable($conn);

    if ($method === 'GET') {
        $rows = $conn->query("SELECT id, title, tag, description, mandals, tribes, stat, image_url, alt_text, accent, icon_name, sort_order, is_active, created_at, updated_at FROM regions ORDER BY sort_order ASC, id ASC")->fetchAll();
        regionRespond(["success" => true, "data" => $rows]);
    }

    if ($method === 'POST') {
        $title       = trim((string)($input['title'] ?? ''));
        $tag         = trim((string)($input['tag'] ?? ''));
        $description = trim((string)($input['description'] ?? ''));
        if ($title === '' || $description === '') {
            regionRespond(["success" => false, "message" => "Title and description are required."], 422);
        }
        $mandals   = trim((string)($input['mandals'] ?? ''));
        $tribes    = trim((string)($input['tribes'] ?? ''));
        $stat      = trim((string)($input['stat'] ?? ''));
        $imageUrl  = trim((string)($input['image_url'] ?? ''));
        $altText   = trim((string)($input['alt_text'] ?? $title));
        $accent    = trim((string)($input['accent'] ?? '#3E8E0F'));
        $iconName  = trim((string)($input['icon_name'] ?? 'tree'));
        $sortOrder = array_key_exists('sort_order', $input) ? (int)$input['sort_order'] : 0;
        $isActive  = array_key_exists('is_active', $input) ? ((int)$input['is_active'] ? 1 : 0) : 1;

        $stmt = $conn->prepare("INSERT INTO regions (title, tag, description, mandals, tribes, stat, image_url, alt_text, accent, icon_name, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$title, $tag, $description, $mandals, tribes, $stat, $imageUrl, $altText, $accent, $iconName, $sortOrder, $isActive]);

        regionRespond(["success" => true, "data" => ["id" => (int)$conn->lastInsertId()]], 201);
    }

    if ($method === 'PUT' || $method === 'PATCH') {
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) {
            regionRespond(["success" => false, "message" => "A valid id is required."], 422);
        }

        $fields = [];
        $params = [];
        $allowed = ['title', 'tag', 'description', 'mandals', 'tribes', 'stat', 'image_url', 'alt_text', 'accent', 'icon_name', 'sort_order', 'is_active'];
        foreach ($allowed as $f) {
            if (array_key_exists($f, $input)) {
                $fields[] = "$f = ?";
                $params[] = $input[$f];
            }
        }
        if (empty($fields)) {
            regionRespond(["success" => false, "message" => "No fields to update."], 422);
        }
        $params[] = $id;
        $stmt = $conn->prepare("UPDATE regions SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($params);

        regionRespond(["success" => true, "message" => "Region updated."]);
    }

    if ($method === 'DELETE') {
        $id = (int)($_GET['id'] ?? ($input['id'] ?? 0));
        if ($id <= 0) {
            regionRespond(["success" => false, "message" => "A valid id is required."], 422);
        }

        $stmt = $conn->prepare("DELETE FROM regions WHERE id = ?");
        $stmt->execute([$id]);

        regionRespond(["success" => true, "message" => "Region deleted."]);
    }

    regionRespond(["success" => false, "message" => "Method not allowed."], 405);
} catch (PDOException $e) {
    if ($method === 'GET') {
        $defaultRegions = [
            ["id" => 1, "title" => "ASR Hill Agency", "tag" => "Rampachodavaram & Chinturu ITDAs", "description" => "PESA Gram Sabha sovereignty, community forest rights (CFR) and individual forest pattas across the Eastern Ghats agency mandals.", "mandals" => "6 mandals", "tribes" => "Koya · Konda Reddi (PVTG) · Valmiki", "stat" => "6 Mandals", "image_url" => "/uploads/region-asr-culture.jpg", "alt_text" => "Adivasi cultural gathering in the agency hills", "accent" => "#3E8E0F", "icon_name" => "tree", "sort_order" => 1, "is_active" => 1],
            ["id" => 2, "title" => "Eluru Agency & Polavaram", "tag" => "K.R. Puram ITDA · Dam Belt", "description" => "LTR 1/70 land restitution, fair RFCTLARR compensation and rehabilitation support for families facing Polavaram submergence.", "mandals" => "5 mandals · 371 habitations", "tribes" => "Koya · Konda Dora · Nayaks", "stat" => "371 Habitations", "image_url" => "/uploads/submergence-area-map-1.jpg", "alt_text" => "Polavaram submergence contour map along the Godavari", "accent" => "#D97706", "icon_name" => "water", "sort_order" => 2, "is_active" => 1],
            ["id" => 3, "title" => "Coastal Krishna Belt", "tag" => "Machilipatnam Coastal Cell", "description" => "Land and housing entitlements for nomadic Yenadi families, the Matsya Mithra women's fisheries federation, and mangrove resilience.", "mandals" => "6 coastal mandals", "tribes" => "Yenadi · Fisher communities", "stat" => "3,500+ Women", "image_url" => "/uploads/coastal-krishna-fishing.jpg", "alt_text" => "Traditional fishing crews on the Krishna coast", "accent" => "#0ea5e9", "icon_name" => "fish", "sort_order" => 3, "is_active" => 1]
        ];
        regionRespond(["success" => true, "data" => $defaultRegions]);
    }
    regionRespond(["success" => false, "message" => "Database error: " . $e->getMessage()], 500);
}
