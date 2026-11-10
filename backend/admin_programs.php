<?php
require_once __DIR__ . '/config.php';

function progRespond($payload, $status = 200) {
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
    progRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

if (!$conn) {
    progRespond(["success" => false, "message" => "Database connection unavailable. Check MySQL in XAMPP."], 503);
}

function ensureProgramsTables($conn) {
    try {
        $conn->exec("CREATE TABLE IF NOT EXISTS home_programs_header (
            id INT AUTO_INCREMENT PRIMARY KEY,
            badge VARCHAR(100) DEFAULT 'What We Do',
            title VARCHAR(255) DEFAULT 'Our Key Programs',
            subtitle TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $conn->exec("CREATE TABLE IF NOT EXISTS home_programs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            category VARCHAR(100) NOT NULL,
            description TEXT NOT NULL,
            image_url LONGTEXT NOT NULL,
            link_url VARCHAR(255) DEFAULT '/programs',
            sort_order INT DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $hCount = (int)$conn->query("SELECT COUNT(*) FROM home_programs_header")->fetchColumn();
        if ($hCount === 0) {
            $stmtH = $conn->prepare("INSERT INTO home_programs_header (badge, title, subtitle) VALUES (?, ?, ?)");
            $stmtH->execute([
                "What We Do",
                "Our Key Programs",
                "Comprehensive programs addressing the needs of Adivasi and marginalized communities"
            ]);
        }

        $pCount = (int)$conn->query("SELECT COUNT(*) FROM home_programs")->fetchColumn();
        if ($pCount === 0) {
            $defaults = [
                ["Forest Rights & Land Advocacy", "Forest Rights", "Securing individual (IFR) and community forest rights (CFR) for Adivasi families under the Forest Rights Act, protecting thousands of acres.", "/uploads/PHOTO-2023-02-15-19-20-56_2-1.jpg", "/programs", 1, 1],
                ["Self-Governance & PESA Act", "Governance", "Mobilizing Adivasi communities for self-governance through Gram Sabha empowerment and PESA Act implementation.", "/uploads/PHOTO-2023-02-15-19-20-52_1.jpg", "/programs", 2, 1],
                ["Land Acquisition & R&R Advocacy", "Polavaram PIP", "Defending rights of 1,05,000+ Project Displaced Families across 371 habitations under the RFCTLARR Act 2013.", "/uploads/submergence-area-map-1.jpg", "/programs", 3, 1],
                ["Matsya Mithra Women Federation", "Empowerment", "Forming and strengthening women-led cooperatives for Yenadi tribal women across 6 coastal mandals of Krishna District.", "/uploads/PHOTO-2023-02-15-19-21-00_1.jpg", "/programs", 4, 1],
                ["Godavari Flood Relief Missions", "Disaster Relief", "Essential grocery provisions, rescue boat operations, and emergency supplies to flood-affected Adivasi communities.", "/uploads/all2023.jpeg", "/programs", 5, 1],
                ["Project Green Energy: Solar Lighting", "Clean Energy", "Installing solar street poles and distributing solar home lanterns in remote off-grid tribal villages.", "/uploads/WhatsApp-Image-2021-09-16-at-7.50.55-PM-1024x461.jpeg", "/programs", 6, 1]
            ];
            $stmtP = $conn->prepare("INSERT INTO home_programs (title, category, description, image_url, link_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)");
            foreach ($defaults as $dp) {
                $stmtP->execute($dp);
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
    ensureProgramsTables($conn);

    if ($method === 'GET') {
        $rows = $conn->query("SELECT id, title, category, description, image_url, link_url, sort_order, is_active, created_at, updated_at FROM home_programs ORDER BY sort_order ASC, id ASC")->fetchAll();
        $header = $conn->query("SELECT badge, title, subtitle FROM home_programs_header ORDER BY id DESC LIMIT 1")->fetch() ?: [
            "badge" => "What We Do",
            "title" => "Our Key Programs",
            "subtitle" => "Comprehensive programs addressing the needs of Adivasi and marginalized communities"
        ];
        progRespond([
            "success" => true,
            "data" => $rows,
            "header" => $header
        ]);
    }

    if ($method === 'POST') {
        $action = $input['action'] ?? ($_GET['action'] ?? '');

        // Update header settings
        if ($action === 'header' || isset($input['save_header'])) {
            $badge = trim((string)($input['badge'] ?? 'What We Do'));
            $title = trim((string)($input['title'] ?? 'Our Key Programs'));
            $subtitle = trim((string)($input['subtitle'] ?? ''));

            $hCount = (int)$conn->query("SELECT COUNT(*) FROM home_programs_header")->fetchColumn();
            if ($hCount > 0) {
                $stmt = $conn->prepare("UPDATE home_programs_header SET badge = ?, title = ?, subtitle = ? WHERE id = 1");
                $stmt->execute([$badge, $title, $subtitle]);
            } else {
                $stmt = $conn->prepare("INSERT INTO home_programs_header (badge, title, subtitle) VALUES (?, ?, ?)");
                $stmt->execute([$badge, $title, $subtitle]);
            }
            progRespond(["success" => true, "message" => "Programs header updated successfully."]);
        }

        // Reorder programs
        if ($action === 'reorder' || (isset($input['programs']) && is_array($input['programs']))) {
            $items = $input['programs'] ?? $input['items'] ?? [];
            if (is_array($items)) {
                $stmt = $conn->prepare("UPDATE home_programs SET sort_order = ? WHERE id = ?");
                foreach ($items as $idx => $item) {
                    $itemId = is_array($item) ? ($item['id'] ?? 0) : $item;
                    if ($itemId) {
                        $stmt->execute([$idx + 1, $itemId]);
                    }
                }
                progRespond(["success" => true, "message" => "Programs display order updated."]);
            }
        }

        // Create new program
        $title       = trim((string)($input['title'] ?? ''));
        $category    = trim((string)($input['category'] ?? $input['cat'] ?? 'General'));
        $description = trim((string)($input['description'] ?? $input['desc'] ?? ''));
        $imageUrl    = trim((string)($input['image_url'] ?? $input['img'] ?? ''));
        $linkUrl     = trim((string)($input['link_url'] ?? $input['link'] ?? '/programs'));
        $sortOrder   = array_key_exists('sort_order', $input) ? (int)$input['sort_order'] : 0;
        $isActive    = array_key_exists('is_active', $input) ? ((int)$input['is_active'] ? 1 : 0) : 1;

        if ($title === '') {
            progRespond(["success" => false, "message" => "Program title is required."], 422);
        }

        if ($sortOrder === 0) {
            $maxOrder = (int)$conn->query("SELECT MAX(sort_order) FROM home_programs")->fetchColumn();
            $sortOrder = $maxOrder + 1;
        }

        $stmt = $conn->prepare("INSERT INTO home_programs (title, category, description, image_url, link_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$title, $category, $description, $imageUrl, $linkUrl, $sortOrder, $isActive]);

        progRespond([
            "success" => true,
            "data" => [
                "id" => (int)$conn->lastInsertId(),
                "title" => $title,
                "category" => $category,
                "description" => $description,
                "image_url" => $imageUrl,
                "link_url" => $linkUrl,
                "sort_order" => $sortOrder,
                "is_active" => $isActive
            ]
        ], 201);
    }

    if ($method === 'PUT' || $method === 'PATCH') {
        $action = $input['action'] ?? ($_GET['action'] ?? '');

        // Header update
        if ($action === 'header' || isset($input['save_header'])) {
            $badge = trim((string)($input['badge'] ?? 'What We Do'));
            $title = trim((string)($input['title'] ?? 'Our Key Programs'));
            $subtitle = trim((string)($input['subtitle'] ?? ''));

            $hCount = (int)$conn->query("SELECT COUNT(*) FROM home_programs_header")->fetchColumn();
            if ($hCount > 0) {
                $stmt = $conn->prepare("UPDATE home_programs_header SET badge = ?, title = ?, subtitle = ? WHERE id = 1");
                $stmt->execute([$badge, $title, $subtitle]);
            } else {
                $stmt = $conn->prepare("INSERT INTO home_programs_header (badge, title, subtitle) VALUES (?, ?, ?)");
                $stmt->execute([$badge, $title, $subtitle]);
            }
            progRespond(["success" => true, "message" => "Programs header updated successfully."]);
        }

        // Reorder
        if ($action === 'reorder' || (isset($input['programs']) && is_array($input['programs']))) {
            $items = $input['programs'] ?? $input['items'] ?? [];
            if (is_array($items)) {
                $stmt = $conn->prepare("UPDATE home_programs SET sort_order = ? WHERE id = ?");
                foreach ($items as $idx => $item) {
                    $itemId = is_array($item) ? ($item['id'] ?? 0) : $item;
                    if ($itemId) {
                        $stmt->execute([$idx + 1, $itemId]);
                    }
                }
                progRespond(["success" => true, "message" => "Programs display order updated."]);
            }
        }

        // Single program update
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) {
            progRespond(["success" => false, "message" => "Valid program ID required."], 422);
        }

        $fields = [];
        $params = [];
        $allowed = ['title', 'category', 'description', 'image_url', 'link_url', 'sort_order', 'is_active'];

        foreach ($allowed as $f) {
            if (array_key_exists($f, $input)) {
                $fields[] = "$f = ?";
                $params[] = $input[$f];
            }
        }

        if (empty($fields)) {
            progRespond(["success" => false, "message" => "No fields provided to update."], 422);
        }

        $params[] = $id;
        $stmt = $conn->prepare("UPDATE home_programs SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($params);

        progRespond(["success" => true, "message" => "Program updated successfully."]);
    }

    if ($method === 'DELETE') {
        $id = (int)($_GET['id'] ?? ($input['id'] ?? 0));
        if ($id <= 0) {
            progRespond(["success" => false, "message" => "Valid program ID required."], 422);
        }

        $stmt = $conn->prepare("DELETE FROM home_programs WHERE id = ?");
        $stmt->execute([$id]);

        progRespond(["success" => true, "message" => "Program deleted successfully."]);
    }

    progRespond(["success" => false, "message" => "Method not supported."], 405);
} catch (PDOException $e) {
    progRespond(["success" => false, "message" => "Database error: " . $e->getMessage()], 500);
}
