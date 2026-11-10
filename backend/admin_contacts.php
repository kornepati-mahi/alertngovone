<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

function contactAdminRespond($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
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
    contactAdminRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

if (!$conn) {
    contactAdminRespond(["success" => false, "message" => "Database connection unavailable. Check MySQL in XAMPP."], 503);
}

// 1. Ensure tables exist
try {
    $conn->exec("CREATE TABLE IF NOT EXISTS `contacts` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(150) NOT NULL,
        `email` VARCHAR(150) NOT NULL,
        `phone` VARCHAR(50) NULL,
        `subject` VARCHAR(255) NOT NULL,
        `office` VARCHAR(150) NULL,
        `message` TEXT NOT NULL,
        `status` ENUM('new', 'read', 'in_progress', 'resolved') DEFAULT 'new',
        `notes` TEXT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $conn->exec("CREATE TABLE IF NOT EXISTS `contact_settings` (
        `id` INT PRIMARY KEY DEFAULT 1,
        `settings_json` LONGTEXT NOT NULL,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
} catch (Exception $e) {
    contactAdminRespond(["success" => false, "message" => "Database init error: " . $e->getMessage()], 500);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?: [];

// Helper to extract iframe src if user pastes raw <iframe> HTML
function extractMapSrc($raw) {
    $t = trim((string)$raw);
    if (preg_match('/<iframe\s+[^>]*src=[\'"]([^\'"]+)[\'"]/i', $t, $m)) {
        return $m[1];
    }
    return $t;
}

// ── GET REQUESTS ─────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $action = $_GET['action'] ?? 'leads';

    if ($action === 'settings') {
        $stmt = $conn->query("SELECT settings_json FROM contact_settings WHERE id = 1 LIMIT 1");
        $row = $stmt ? $stmt->fetch() : null;
        $settings = ($row && !empty($row['settings_json'])) ? json_decode($row['settings_json'], true) : [];
        contactAdminRespond(["success" => true, "data" => $settings]);
    }

    // Default: List leads
    $search = trim($_GET['search'] ?? '');
    $statusFilter = trim($_GET['status'] ?? 'all');

    $sql = "SELECT * FROM contacts WHERE 1=1";
    $params = [];

    if ($statusFilter !== '' && strtolower($statusFilter) !== 'all') {
        $sql .= " AND LOWER(status) = LOWER(?)";
        $params[] = $statusFilter;
    }

    if ($search !== '') {
        $sql .= " AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR subject LIKE ? OR message LIKE ?)";
        $wild = '%' . $search . '%';
        $params[] = $wild;
        $params[] = $wild;
        $params[] = $wild;
        $params[] = $wild;
        $params[] = $wild;
    }

    $sql .= " ORDER BY id DESC";

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $leads = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Summary counts
    $totalCount = (int)$conn->query("SELECT COUNT(*) FROM contacts")->fetchColumn();
    $newCount = (int)$conn->query("SELECT COUNT(*) FROM contacts WHERE status = 'new'")->fetchColumn();
    $inProgressCount = (int)$conn->query("SELECT COUNT(*) FROM contacts WHERE status = 'in_progress'")->fetchColumn();
    $resolvedCount = (int)$conn->query("SELECT COUNT(*) FROM contacts WHERE status = 'resolved'")->fetchColumn();

    // Also fetch current settings so dashboard can have both in one call
    $stStmt = $conn->query("SELECT settings_json FROM contact_settings WHERE id = 1 LIMIT 1");
    $stRow = $stStmt ? $stStmt->fetch() : null;
    $settings = ($stRow && !empty($stRow['settings_json'])) ? json_decode($stRow['settings_json'], true) : null;

    contactAdminRespond([
        "success" => true,
        "data" => $leads,
        "counts" => [
            "total" => $totalCount,
            "new" => $newCount,
            "in_progress" => $inProgressCount,
            "resolved" => $resolvedCount
        ],
        "settings" => $settings
    ]);
}

// ── POST REQUESTS ────────────────────────────────────────────────────────────
if ($method === 'POST') {
    $action = $input['action'] ?? ($_POST['action'] ?? '');

    // 1. SAVE CONTACT PAGE SETTINGS (HEAD OFFICE, MAP, DROPDOWNS)
    if ($action === 'save_settings') {
        $settingsPayload = $input['settings'] ?? [];
        if (!is_array($settingsPayload)) {
            contactAdminRespond(["success" => false, "message" => "Settings payload must be an object."], 422);
        }

        // Clean map URL if iframe tag pasted
        if (isset($settingsPayload['map_iframe_url'])) {
            $settingsPayload['map_iframe_url'] = extractMapSrc($settingsPayload['map_iframe_url']);
        }

        $json = json_encode($settingsPayload, JSON_UNESCAPED_UNICODE);
        $stmt = $conn->prepare("INSERT INTO contact_settings (id, settings_json) VALUES (1, ?) ON DUPLICATE KEY UPDATE settings_json = VALUES(settings_json)");
        $stmt->execute([$json]);

        contactAdminRespond(["success" => true, "message" => "Contact page settings and map configuration saved successfully!", "data" => $settingsPayload]);
    }

    // 2. DELETE OR TOGGLE GOOGLE MAP
    if ($action === 'delete_map') {
        $stmt = $conn->query("SELECT settings_json FROM contact_settings WHERE id = 1 LIMIT 1");
        $row = $stmt ? $stmt->fetch() : null;
        $current = ($row && !empty($row['settings_json'])) ? json_decode($row['settings_json'], true) : [];
        $current['map_enabled'] = 0;
        $current['map_iframe_url'] = '';

        $json = json_encode($current, JSON_UNESCAPED_UNICODE);
        $up = $conn->prepare("UPDATE contact_settings SET settings_json = ? WHERE id = 1");
        $up->execute([$json]);

        contactAdminRespond(["success" => true, "message" => "Google Map removed from contact page.", "data" => $current]);
    }

    // 3. UPDATE LEAD STATUS & ADMIN NOTES
    if ($action === 'update_lead') {
        $id = (int)($input['id'] ?? 0);
        $status = trim((string)($input['status'] ?? 'new'));
        $notes = trim((string)($input['notes'] ?? ''));

        if ($id <= 0) {
            contactAdminRespond(["success" => false, "message" => "Lead ID is required."], 422);
        }

        $stmt = $conn->prepare("UPDATE contacts SET status = ?, notes = ? WHERE id = ?");
        $stmt->execute([$status, $notes, $id]);

        contactAdminRespond(["success" => true, "message" => "Lead #{$id} updated successfully!"]);
    }

    // 4. DELETE LEAD
    if ($action === 'delete_lead') {
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) {
            contactAdminRespond(["success" => false, "message" => "Lead ID is required."], 422);
        }

        $stmt = $conn->prepare("DELETE FROM contacts WHERE id = ?");
        $stmt->execute([$id]);

        contactAdminRespond(["success" => true, "message" => "Lead #{$id} deleted successfully."]);
    }

    contactAdminRespond(["success" => false, "message" => "Unknown action: {$action}"], 400);
}

