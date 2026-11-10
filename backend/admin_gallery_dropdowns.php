<?php
require_once __DIR__ . '/config.php';

function dropdownRespond($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

$adminKey = getenv('ADMIN_KEY') ?: 'alertngo@123';
$validKeys = array_unique(array_filter([$adminKey, 'alertngo@123', 'alertngo-admin']));
$providedKey = $_SERVER['HTTP_X_ADMIN_KEY'] ?? ($_POST['admin_key'] ?? ($_GET['admin_key'] ?? ''));

$authorized = false;
foreach ($validKeys as $vk) {
    if ($vk !== '' && hash_equals($vk, $providedKey)) {
        $authorized = true;
        break;
    }
}
if (!$authorized) {
    dropdownRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

if (!$conn) {
    dropdownRespond(["success" => false, "message" => "Database connection unavailable."], 503);
}

// 1. Ensure table exists
try {
    $createSql = "CREATE TABLE IF NOT EXISTS `gallery_dropdowns` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `parent_label` VARCHAR(100) NOT NULL DEFAULT 'Videos & Images',
        `section` VARCHAR(100) NOT NULL DEFAULT 'Photos & Images',
        `label` VARCHAR(150) NOT NULL,
        `path` VARCHAR(255) NOT NULL,
        `sort_order` INT DEFAULT 0,
        `is_active` TINYINT(1) DEFAULT 1,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    $conn->exec($createSql);
} catch (PDOException $e) {
    dropdownRespond(["success" => false, "message" => "Failed to initialize table: " . $e->getMessage()], 500);
}

function seedDropdownDefaults($conn, $force = false) {
    $count = (int)$conn->query("SELECT COUNT(*) FROM gallery_dropdowns")->fetchColumn();
    if ($count > 0 && !$force) {
        return $count;
    }

    if ($force) {
        $conn->exec("TRUNCATE TABLE gallery_dropdowns");
    }

    $defaultDropdowns = [
        ["section" => "Photos & Images", "label" => "All Photos", "path" => "/gallery-9?filter=Photos"],
        ["section" => "Photos & Images", "label" => "Community & Forest Rights", "path" => "/gallery-9?filter=Photos&cat=Community"],
        ["section" => "Photos & Images", "label" => "Flood Relief & Operations", "path" => "/gallery-9?filter=Photos&cat=Relief"],
        ["section" => "Photos & Images", "label" => "Education & Livelihood", "path" => "/gallery-9?filter=Photos&cat=Education"],
        
        ["section" => "Field Videos", "label" => "All Videos", "path" => "/gallery-9?filter=Videos"],
        ["section" => "Field Videos", "label" => "Field Reels & Stories", "path" => "/gallery-9?filter=Videos"],
        ["section" => "Field Videos", "label" => "Community & Youth Videos", "path" => "/gallery-9?filter=Videos&cat=Education"],

        ["section" => "Events & Albums", "label" => "All Event Media", "path" => "/gallery-9?cat=Events"],
        ["section" => "Events & Albums", "label" => "Event Photos", "path" => "/gallery-9?cat=Events&filter=Photos"],
        ["section" => "Events & Albums", "label" => "Event Videos", "path" => "/gallery-9?cat=Events&filter=Videos"],
        ["section" => "Events & Albums", "label" => "Conferences & Conventions", "path" => "/gallery-9?cat=Events"],
    ];

    $stmt = $conn->prepare("INSERT INTO gallery_dropdowns (parent_label, section, label, path, sort_order, is_active) VALUES ('Videos & Images', ?, ?, ?, ?, 1)");
    $order = 1;
    foreach ($defaultDropdowns as $d) {
        $stmt->execute([$d['section'], $d['label'], $d['path'], $order++]);
    }
    return count($defaultDropdowns);
}

seedDropdownDefaults($conn, false);

$rawBody = file_get_contents("php://input");
$input = [];
if (!empty($rawBody)) {
    $decoded = json_decode($rawBody, true);
    if (is_array($decoded)) $input = $decoded;
}
$action = $_REQUEST['action'] ?? ($input['action'] ?? 'list');

switch ($action) {
    case 'list': {
        $section = trim($_GET['section'] ?? ($input['section'] ?? ''));
        $search = trim($_GET['search'] ?? ($input['search'] ?? ''));

        $sql = "SELECT * FROM gallery_dropdowns WHERE 1=1";
        $params = [];

        if ($section !== '' && $section !== 'All') {
            $sql .= " AND section = ?";
            $params[] = $section;
        }
        if ($search !== '') {
            $sql .= " AND (label LIKE ? OR path LIKE ? OR section LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        $sql .= " ORDER BY sort_order ASC, id ASC";
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Grouping
        $grouped = [];
        foreach ($items as $it) {
            $sec = $it['section'] ?? 'Photos & Images';
            if (!isset($grouped[$sec])) $grouped[$sec] = [];
            $grouped[$sec][] = $it;
        }

        dropdownRespond([
            "success" => true,
            "total" => count($items),
            "data" => $items,
            "grouped" => $grouped
        ]);
    }

    case 'create': {
        $section = trim($input['section'] ?? ($_POST['section'] ?? 'Photos & Images'));
        $label = trim($input['label'] ?? ($_POST['label'] ?? ''));
        $path = trim($input['path'] ?? ($_POST['path'] ?? '/gallery-9'));
        $sort_order = isset($input['sort_order']) ? (int)$input['sort_order'] : (isset($_POST['sort_order']) ? (int)$_POST['sort_order'] : 0);
        $is_active = isset($input['is_active']) ? ((int)$input['is_active'] ? 1 : 0) : 1;

        if ($label === '' || $path === '') {
            dropdownRespond(["success" => false, "message" => "Label and Target Path/URL are required."], 400);
        }

        if ($sort_order === 0) {
            $maxOrder = (int)$conn->query("SELECT MAX(sort_order) FROM gallery_dropdowns")->fetchColumn();
            $sort_order = $maxOrder + 1;
        }

        $stmt = $conn->prepare("INSERT INTO gallery_dropdowns (parent_label, section, label, path, sort_order, is_active) VALUES ('Videos & Images', ?, ?, ?, ?, ?)");
        $stmt->execute([$section, $label, $path, $sort_order, $is_active]);

        $newId = (int)$conn->lastInsertId();
        dropdownRespond([
            "success" => true,
            "message" => "Dropdown item created successfully.",
            "id" => $newId
        ]);
    }

    case 'update': {
        $id = (int)($input['id'] ?? ($_POST['id'] ?? 0));
        if ($id <= 0) {
            dropdownRespond(["success" => false, "message" => "Valid item ID required."], 400);
        }

        $section = trim($input['section'] ?? ($_POST['section'] ?? 'Photos & Images'));
        $label = trim($input['label'] ?? ($_POST['label'] ?? ''));
        $path = trim($input['path'] ?? ($_POST['path'] ?? '/gallery-9'));
        $sort_order = isset($input['sort_order']) ? (int)$input['sort_order'] : (isset($_POST['sort_order']) ? (int)$_POST['sort_order'] : null);
        $is_active = isset($input['is_active']) ? ((int)$input['is_active'] ? 1 : 0) : null;

        if ($label === '' || $path === '') {
            dropdownRespond(["success" => false, "message" => "Label and Target Path/URL are required."], 400);
        }

        $fields = ["section = ?", "label = ?", "path = ?"];
        $params = [$section, $label, $path];

        if ($sort_order !== null) {
            $fields[] = "sort_order = ?";
            $params[] = $sort_order;
        }
        if ($is_active !== null) {
            $fields[] = "is_active = ?";
            $params[] = $is_active;
        }

        $params[] = $id;
        $sql = "UPDATE gallery_dropdowns SET " . implode(", ", $fields) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);

        dropdownRespond([
            "success" => true,
            "message" => "Dropdown item updated successfully."
        ]);
    }

    case 'toggle_active': {
        $id = (int)($input['id'] ?? ($_POST['id'] ?? 0));
        if ($id <= 0) {
            dropdownRespond(["success" => false, "message" => "Valid item ID required."], 400);
        }
        $val = isset($input['is_active']) ? (int)$input['is_active'] : null;
        if ($val !== null) {
            $stmt = $conn->prepare("UPDATE gallery_dropdowns SET is_active = ? WHERE id = ?");
            $stmt->execute([$val ? 1 : 0, $id]);
        } else {
            $stmt = $conn->prepare("UPDATE gallery_dropdowns SET is_active = IF(is_active = 1, 0, 1) WHERE id = ?");
            $stmt->execute([$id]);
        }
        dropdownRespond([
            "success" => true,
            "message" => "Dropdown item visibility toggled."
        ]);
    }

    case 'delete': {
        $id = (int)($input['id'] ?? ($_POST['id'] ?? 0));
        if ($id <= 0) {
            dropdownRespond(["success" => false, "message" => "Valid item ID required."], 400);
        }

        $stmt = $conn->prepare("DELETE FROM gallery_dropdowns WHERE id = ?");
        $stmt->execute([$id]);

        dropdownRespond([
            "success" => true,
            "message" => "Dropdown item deleted successfully."
        ]);
    }

    case 'reorder': {
        $ids = $input['ids'] ?? ($_POST['ids'] ?? []);
        if (!is_array($ids) || empty($ids)) {
            dropdownRespond(["success" => false, "message" => "Array of IDs required for reorder."], 400);
        }

        $stmt = $conn->prepare("UPDATE gallery_dropdowns SET sort_order = ? WHERE id = ?");
        $order = 1;
        foreach ($ids as $id) {
            $cleanId = (int)$id;
            if ($cleanId > 0) {
                $stmt->execute([$order++, $cleanId]);
            }
        }
        dropdownRespond([
            "success" => true,
            "message" => "Sort order updated successfully."
        ]);
    }

    case 'seed_defaults': {
        $seeded = seedDropdownDefaults($conn, true);
        dropdownRespond([
            "success" => true,
            "message" => "Successfully restored {$seeded} default dropdown links."
        ]);
    }

    default:
        dropdownRespond(["success" => false, "message" => "Unknown action: {$action}"], 400);
}

