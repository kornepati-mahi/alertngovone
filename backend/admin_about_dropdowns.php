<?php
require_once __DIR__ . '/config.php';

function aboutDropdownRespond($payload, $status = 200) {
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
    aboutDropdownRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

if (!$conn) {
    aboutDropdownRespond(["success" => false, "message" => "Database connection unavailable."], 503);
}

$defaultAboutDropdowns = [
    [
        "label" => "About ALERT",
        "path" => "/about",
        "sub_items_json" => "[]",
        "sort_order" => 1,
        "is_active" => 1
    ],
    [
        "label" => "Governing Body",
        "path" => "/governing-body",
        "sub_items_json" => "[]",
        "sort_order" => 2,
        "is_active" => 1
    ],
    [
        "label" => "Vision & Mission",
        "path" => "/vision-mission-2",
        "sub_items_json" => "[]",
        "sort_order" => 3,
        "is_active" => 1
    ],
    [
        "label" => "Core Values",
        "path" => "/core-values",
        "sub_items_json" => "[]",
        "sort_order" => 4,
        "is_active" => 1
    ],
    [
        "label" => "Org Profile",
        "path" => "/organizational-profile",
        "sub_items_json" => "[]",
        "sort_order" => 5,
        "is_active" => 1
    ],
    [
        "label" => "Organogram",
        "path" => "/organogram",
        "sub_items_json" => "[]",
        "sort_order" => 6,
        "is_active" => 1
    ],
    [
        "label" => "ALERT Policies",
        "path" => "/alert-policies",
        "sub_items_json" => "[]",
        "sort_order" => 7,
        "is_active" => 1
    ],
    [
        "label" => "Area of Operation",
        "path" => "/area-of-operation",
        "sub_items_json" => "[]",
        "sort_order" => 8,
        "is_active" => 1
    ]
];

try {
    $conn->exec("CREATE TABLE IF NOT EXISTS `about_dropdowns` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `label` VARCHAR(150) NOT NULL,
        `path` VARCHAR(255) NOT NULL,
        `parent_id` INT NULL DEFAULT NULL,
        `sub_items_json` LONGTEXT NULL,
        `sort_order` INT DEFAULT 0,
        `is_active` TINYINT(1) DEFAULT 1,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    try {
        $conn->exec("ALTER TABLE `about_dropdowns` ADD COLUMN `parent_id` INT NULL DEFAULT NULL AFTER `path`");
    } catch (Exception $ignored) {}
} catch (PDOException $e) {
    aboutDropdownRespond(["success" => false, "message" => "Database table error: " . $e->getMessage()], 500);
}

function seedAboutDefaults($conn) {
    global $defaultAboutDropdowns;
    $conn->exec("TRUNCATE TABLE `about_dropdowns`");
    $insert = $conn->prepare("INSERT INTO `about_dropdowns` (`label`, `path`, `sub_items_json`, `sort_order`, `is_active`) VALUES (:label, :path, :sub_items_json, :sort_order, :is_active)");
    foreach ($defaultAboutDropdowns as $d) {
        $insert->execute([
            ':label' => $d['label'],
            ':path' => $d['path'],
            ':sub_items_json' => $d['sub_items_json'] ?? '[]',
            ':sort_order' => $d['sort_order'],
            ':is_active' => $d['is_active']
        ]);
    }
}

$rawInput = file_get_contents('php://input');
$inputData = json_decode($rawInput, true) ?: $_POST;
$action = $_GET['action'] ?? ($inputData['action'] ?? 'list');

switch ($action) {
    case 'list':
        $count = (int)$conn->query("SELECT COUNT(*) FROM `about_dropdowns`")->fetchColumn();
        if ($count === 0) {
            seedAboutDefaults($conn);
        }
        $stmt = $conn->query("SELECT * FROM `about_dropdowns` ORDER BY `sort_order` ASC, `id` ASC");
        $items = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
        aboutDropdownRespond(["success" => true, "data" => $items]);
        break;

    case 'save':
        $id = !empty($inputData['id']) ? (int)$inputData['id'] : null;
        $label = trim($inputData['label'] ?? '');
        $path = trim($inputData['path'] ?? '');
        $parent_id = !empty($inputData['parent_id']) ? (int)$inputData['parent_id'] : null;
        $sub_items_json = is_string($inputData['sub_items_json'] ?? null)
            ? $inputData['sub_items_json']
            : json_encode($inputData['sub_items'] ?? [], JSON_UNESCAPED_UNICODE);
        $sort_order = isset($inputData['sort_order']) ? (int)$inputData['sort_order'] : 0;
        $is_active = isset($inputData['is_active']) ? (int)$inputData['is_active'] : 1;

        if (empty($label) || empty($path)) {
            aboutDropdownRespond(["success" => false, "message" => "Label and Path are required."], 400);
        }

        if ($id) {
            $stmt = $conn->prepare("UPDATE `about_dropdowns` SET `label` = :label, `path` = :path, `parent_id` = :parent_id, `sub_items_json` = :sub_items_json, `sort_order` = :sort_order, `is_active` = :is_active WHERE `id` = :id");
            $stmt->execute([
                ':label' => $label,
                ':path' => $path,
                ':parent_id' => $parent_id,
                ':sub_items_json' => $sub_items_json,
                ':sort_order' => $sort_order,
                ':is_active' => $is_active,
                ':id' => $id
            ]);
            aboutDropdownRespond(["success" => true, "message" => "Dropdown item updated successfully.", "id" => $id]);
        } else {
            if ($sort_order === 0) {
                $maxOrder = (int)$conn->query("SELECT MAX(sort_order) FROM `about_dropdowns`")->fetchColumn();
                $sort_order = $maxOrder + 1;
            }
            $stmt = $conn->prepare("INSERT INTO `about_dropdowns` (`label`, `path`, `parent_id`, `sub_items_json`, `sort_order`, `is_active`) VALUES (:label, :path, :parent_id, :sub_items_json, :sort_order, :is_active)");
            $stmt->execute([
                ':label' => $label,
                ':path' => $path,
                ':parent_id' => $parent_id,
                ':sub_items_json' => $sub_items_json,
                ':sort_order' => $sort_order,
                ':is_active' => $is_active
            ]);
            $newId = (int)$conn->lastInsertId();
            aboutDropdownRespond(["success" => true, "message" => "Dropdown item created successfully.", "id" => $newId]);
        }
        break;

    case 'delete':
        $id = (int)($inputData['id'] ?? ($_GET['id'] ?? 0));
        if (!$id) {
            aboutDropdownRespond(["success" => false, "message" => "Valid item ID is required."], 400);
        }
        $stmt = $conn->prepare("DELETE FROM `about_dropdowns` WHERE `id` = :id");
        $stmt->execute([':id' => $id]);
        aboutDropdownRespond(["success" => true, "message" => "Dropdown item deleted successfully."]);
        break;

    case 'toggle':
        $id = (int)($inputData['id'] ?? 0);
        $active = !empty($inputData['is_active']) ? 1 : 0;
        if (!$id) {
            aboutDropdownRespond(["success" => false, "message" => "Valid item ID is required."], 400);
        }
        $stmt = $conn->prepare("UPDATE `about_dropdowns` SET `is_active` = :active WHERE `id` = :id");
        $stmt->execute([':active' => $active, ':id' => $id]);
        aboutDropdownRespond(["success" => true, "message" => "Item visibility updated."]);
        break;

    case 'reorder':
        $items = $inputData['items'] ?? [];
        if (!is_array($items)) {
            aboutDropdownRespond(["success" => false, "message" => "Invalid items array."], 400);
        }
        $stmt = $conn->prepare("UPDATE `about_dropdowns` SET `sort_order` = :order WHERE `id` = :id");
        foreach ($items as $idx => $it) {
            $itemId = (int)($it['id'] ?? 0);
            if ($itemId > 0) {
                $stmt->execute([':order' => $idx + 1, ':id' => $itemId]);
            }
        }
        aboutDropdownRespond(["success" => true, "message" => "Order updated successfully."]);
        break;

    case 'reset':
        seedAboutDefaults($conn);
        $stmt = $conn->query("SELECT * FROM `about_dropdowns` ORDER BY `sort_order` ASC, `id` ASC");
        $items = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
        aboutDropdownRespond(["success" => true, "message" => "About dropdowns restored to factory defaults.", "data" => $items]);
        break;

    default:
        aboutDropdownRespond(["success" => false, "message" => "Unknown action: " . $action], 400);
}

