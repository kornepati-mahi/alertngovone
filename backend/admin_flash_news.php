<?php
require_once __DIR__ . '/config.php';

function flashRespond($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function flashMessageLength($text) {
    return function_exists('mb_strlen') ? mb_strlen($text) : strlen($text);
}

// ---- Simple admin authentication (shared key from backend/.env or admin login) ----
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
    flashRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

if (!$conn) {
    flashRespond(["success" => false, "message" => "Database is not available. Check MySQL in XAMPP."], 503);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$rawBody = file_get_contents('php://input');
$input = json_decode($rawBody, true);
if (!is_array($input)) {
    $input = [];
}

try {
    if ($method === 'GET') {
        $rows = $conn->query("SELECT id, message, is_active, sort_order, created_at, updated_at FROM flash_news ORDER BY sort_order ASC, id ASC")->fetchAll();
        flashRespond(["success" => true, "data" => $rows]);
    }

    if ($method === 'POST') {
        $message = trim((string)($input['message'] ?? ''));
        if ($message === '') {
            flashRespond(["success" => false, "message" => "Message is required."], 422);
        }
        if (flashMessageLength($message) > 500) {
            flashRespond(["success" => false, "message" => "Message must be 500 characters or fewer."], 422);
        }

        $isActive = array_key_exists('is_active', $input) ? ((int)$input['is_active'] ? 1 : 0) : 1;
        $sortOrder = array_key_exists('sort_order', $input) ? (int)$input['sort_order'] : 0;

        $stmt = $conn->prepare("INSERT INTO flash_news (message, is_active, sort_order) VALUES (?, ?, ?)");
        $stmt->execute([$message, $isActive, $sortOrder]);

        flashRespond(["success" => true, "data" => ["id" => (int)$conn->lastInsertId()]], 201);
    }

    if ($method === 'PUT' || $method === 'PATCH') {
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) {
            flashRespond(["success" => false, "message" => "A valid id is required."], 422);
        }

        $fields = [];
        $params = [];

        if (array_key_exists('message', $input)) {
            $message = trim((string)$input['message']);
            if ($message === '') {
                flashRespond(["success" => false, "message" => "Message cannot be empty."], 422);
            }
            if (flashMessageLength($message) > 500) {
                flashRespond(["success" => false, "message" => "Message must be 500 characters or fewer."], 422);
            }
            $fields[] = "message = ?";
            $params[] = $message;
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
            flashRespond(["success" => false, "message" => "Nothing to update."], 422);
        }

        $params[] = $id;
        $stmt = $conn->prepare("UPDATE flash_news SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($params);

        if ($stmt->rowCount() === 0) {
            $exists = $conn->prepare("SELECT id FROM flash_news WHERE id = ?");
            $exists->execute([$id]);
            if (!$exists->fetch()) {
                flashRespond(["success" => false, "message" => "Announcement not found."], 404);
            }
        }

        flashRespond(["success" => true, "data" => ["id" => $id]]);
    }

    if ($method === 'DELETE') {
        $id = (int)($input['id'] ?? ($_GET['id'] ?? 0));
        if ($id <= 0) {
            flashRespond(["success" => false, "message" => "A valid id is required."], 422);
        }

        $stmt = $conn->prepare("DELETE FROM flash_news WHERE id = ?");
        $stmt->execute([$id]);

        flashRespond(["success" => true, "data" => ["id" => $id]]);
    }

    flashRespond(["success" => false, "message" => "Method not allowed."], 405);
} catch (PDOException $e) {
    flashRespond(["success" => false, "message" => "Database error: " . $e->getMessage()], 500);
}
