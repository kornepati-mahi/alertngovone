<?php
require_once __DIR__ . '/config.php';

function programRespond($payload, $status = 200) {
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
    programRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

if (!$conn) {
    programRespond(["success" => false, "message" => "Database connection unavailable. Check MySQL in XAMPP."], 503);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmtP = $conn->query("SELECT id, category, title, description, img, details, link_url, sort_order, is_active FROM key_programs ORDER BY sort_order ASC, id ASC");
        $programs = $stmtP->fetchAll();
        foreach ($programs as &$p) {
            if (!empty($p['details'])) {
                $dec = json_decode($p['details'], true);
                $p['details'] = is_array($dec) ? $dec : [$p['details']];
            } else {
                $p['details'] = [];
            }
            $p['cat'] = $p['category'];
        }
        unset($p);

        $stmtC = $conn->query("SELECT id, category_name, display_name, subtitle, sort_order FROM key_programs_categories ORDER BY sort_order ASC, id ASC");
        $categories = $stmtC->fetchAll();

        $stmtS = $conn->query("SELECT setting_key, setting_value FROM key_programs_settings");
        $settingsRows = $stmtS->fetchAll();
        $settings = [];
        foreach ($settingsRows as $sr) {
            $settings[$sr['setting_key']] = $sr['setting_value'];
        }

        programRespond([
            "success" => true,
            "data" => $programs,
            "categories" => $categories,
            "settings" => $settings
        ]);
    } catch (PDOException $e) {
        programRespond(["success" => false, "message" => "Failed to fetch programs: " . $e->getMessage()], 500);
    }
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $action = $input['action'] ?? 'update';

    // 1. CREATE PROGRAM
    if ($action === 'create') {
        $title = trim($input['title'] ?? '');
        $category = trim($input['category'] ?? $input['cat'] ?? 'Forest Rights');
        $desc = trim($input['description'] ?? $input['desc'] ?? '');
        $img = trim($input['img'] ?? $input['image_url'] ?? '/uploads/programs/PHOTO-2023-02-15-19-20-55_1.jpg');
        $linkUrl = trim($input['link_url'] ?? '/la-rr');
        $sortOrder = isset($input['sort_order']) ? (int)$input['sort_order'] : 0;
        $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;

        if ($title === '') {
            programRespond(["success" => false, "message" => "Program title is required."], 422);
        }

        $details = $input['details'] ?? [];
        if (is_array($details)) {
            $detailsJson = json_encode(array_values(array_filter(array_map('trim', $details))));
        } else {
            $detailsJson = json_encode([trim((string)$details)]);
        }

        if ($sortOrder === 0) {
            $maxOrder = (int)$conn->query("SELECT MAX(sort_order) FROM key_programs")->fetchColumn();
            $sortOrder = $maxOrder + 1;
        }

        try {
            $stmt = $conn->prepare("INSERT INTO key_programs (category, title, description, img, details, link_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$category, $title, $desc, $img, $detailsJson, $linkUrl, $sortOrder, $isActive]);
            $newId = (int)$conn->lastInsertId();

            programRespond([
                "success" => true,
                "message" => "Program added successfully.",
                "data" => [
                    "id" => $newId,
                    "category" => $category,
                    "cat" => $category,
                    "title" => $title,
                    "description" => $desc,
                    "img" => $img,
                    "details" => json_decode($detailsJson, true),
                    "link_url" => $linkUrl,
                    "sort_order" => $sortOrder,
                    "is_active" => $isActive
                ]
            ]);
        } catch (PDOException $e) {
            programRespond(["success" => false, "message" => "Database error: " . $e->getMessage()], 500);
        }
    }

    // 2. UPDATE PROGRAM
    if ($action === 'update') {
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) {
            programRespond(["success" => false, "message" => "Valid program ID is required."], 422);
        }

        $title = trim($input['title'] ?? '');
        $category = trim($input['category'] ?? $input['cat'] ?? '');
        $desc = trim($input['description'] ?? $input['desc'] ?? '');
        $img = trim($input['img'] ?? $input['image_url'] ?? '');
        $linkUrl = trim($input['link_url'] ?? '/la-rr');
        $sortOrder = isset($input['sort_order']) ? (int)$input['sort_order'] : null;
        $isActive = isset($input['is_active']) ? (int)$input['is_active'] : null;

        $fields = [];
        $params = [];

        if ($title !== '') { $fields[] = "title = ?"; $params[] = $title; }
        if ($category !== '') { $fields[] = "category = ?"; $params[] = $category; }
        if ($desc !== '') { $fields[] = "description = ?"; $params[] = $desc; }
        if ($img !== '') { $fields[] = "img = ?"; $params[] = $img; }
        if ($linkUrl !== '') { $fields[] = "link_url = ?"; $params[] = $linkUrl; }
        if ($sortOrder !== null) { $fields[] = "sort_order = ?"; $params[] = $sortOrder; }
        if ($isActive !== null) { $fields[] = "is_active = ?"; $params[] = $isActive; }

        if (isset($input['details'])) {
            $details = $input['details'];
            if (is_array($details)) {
                $detailsJson = json_encode(array_values(array_filter(array_map('trim', $details))));
            } else {
                $detailsJson = json_encode([trim((string)$details)]);
            }
            $fields[] = "details = ?";
            $params[] = $detailsJson;
        }

        if (empty($fields)) {
            programRespond(["success" => false, "message" => "No fields to update."], 422);
        }

        $params[] = $id;
        try {
            $sql = "UPDATE key_programs SET " . implode(", ", $fields) . " WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);

            $updatedRow = $conn->query("SELECT id, category, title, description, img, details, link_url, sort_order, is_active FROM key_programs WHERE id = {$id}")->fetch();
            if ($updatedRow) {
                $updatedRow['details'] = json_decode($updatedRow['details'] ?? '[]', true) ?: [];
                $updatedRow['cat'] = $updatedRow['category'];
            }

            programRespond([
                "success" => true,
                "message" => "Program updated successfully.",
                "data" => $updatedRow
            ]);
        } catch (PDOException $e) {
            programRespond(["success" => false, "message" => "Database update failed: " . $e->getMessage()], 500);
        }
    }

    // 3. DELETE PROGRAM
    if ($action === 'delete') {
        $id = (int)($input['id'] ?? 0);
        if ($id <= 0) {
            programRespond(["success" => false, "message" => "Valid program ID is required."], 422);
        }
        try {
            $stmt = $conn->prepare("DELETE FROM key_programs WHERE id = ?");
            $stmt->execute([$id]);
            programRespond(["success" => true, "message" => "Program deleted successfully.", "deleted_id" => $id]);
        } catch (PDOException $e) {
            programRespond(["success" => false, "message" => "Failed to delete: " . $e->getMessage()], 500);
        }
    }

    // 4. REORDER PROGRAMS
    if ($action === 'reorder') {
        $orderedIds = $input['ordered_ids'] ?? [];
        if (!is_array($orderedIds) || empty($orderedIds)) {
            programRespond(["success" => false, "message" => "ordered_ids array required."], 422);
        }
        try {
            $stmt = $conn->prepare("UPDATE key_programs SET sort_order = ? WHERE id = ?");
            foreach ($orderedIds as $pos => $pid) {
                $stmt->execute([$pos + 1, (int)$pid]);
            }
            programRespond(["success" => true, "message" => "Programs order updated successfully."]);
        } catch (PDOException $e) {
            programRespond(["success" => false, "message" => "Reorder failed: " . $e->getMessage()], 500);
        }
    }

    // 5. UPDATE OR CREATE CATEGORY
    if ($action === 'update_category' || $action === 'create_category') {
        $catName = trim($input['category_name'] ?? '');
        $dispName = trim($input['display_name'] ?? $catName);
        $subtitle = trim($input['subtitle'] ?? '');
        $sortOrder = isset($input['sort_order']) ? (int)$input['sort_order'] : null;

        if ($catName === '') {
            programRespond(["success" => false, "message" => "category_name is required."], 422);
        }

        try {
            $exists = (int)$conn->query("SELECT COUNT(*) FROM key_programs_categories WHERE category_name = " . $conn->quote($catName))->fetchColumn();
            if ($exists > 0) {
                $stmt = $conn->prepare("UPDATE key_programs_categories SET display_name = ?, subtitle = ?, sort_order = COALESCE(?, sort_order) WHERE category_name = ?");
                $stmt->execute([$dispName, $subtitle, $sortOrder, $catName]);
            } else {
                if ($sortOrder === null) {
                    $maxOrder = (int)$conn->query("SELECT MAX(sort_order) FROM key_programs_categories")->fetchColumn();
                    $sortOrder = $maxOrder + 1;
                }
                $stmt = $conn->prepare("INSERT INTO key_programs_categories (category_name, display_name, subtitle, sort_order) VALUES (?, ?, ?, ?)");
                $stmt->execute([$catName, $dispName, $subtitle, $sortOrder]);
            }

            programRespond([
                "success" => true,
                "message" => "Category saved successfully.",
                "data" => [
                    "category_name" => $catName,
                    "display_name" => $dispName,
                    "subtitle" => $subtitle,
                    "sort_order" => $sortOrder
                ]
            ]);
        } catch (PDOException $e) {
            programRespond(["success" => false, "message" => "Category save failed: " . $e->getMessage()], 500);
        }
    }

    // 5B. DELETE CATEGORY
    if ($action === 'delete_category') {
        $catName = trim($input['category_name'] ?? '');
        if ($catName === '') {
            programRespond(["success" => false, "message" => "category_name is required."], 422);
        }
        try {
            $stmt = $conn->prepare("DELETE FROM key_programs_categories WHERE category_name = ?");
            $stmt->execute([$catName]);
            
            // Optionally delete programs or mark inactive
            $delProgs = !empty($input['delete_programs']);
            if ($delProgs) {
                $stmtP = $conn->prepare("DELETE FROM key_programs WHERE category = ?");
                $stmtP->execute([$catName]);
            }

            programRespond(["success" => true, "message" => "Category deleted successfully."]);
        } catch (PDOException $e) {
            programRespond(["success" => false, "message" => "Failed to delete category: " . $e->getMessage()], 500);
        }
    }

    // 6. SAVE SETTINGS (Antyodaya & CTA)
    if ($action === 'save_settings') {
        $settings = $input['settings'] ?? [];
        if (!is_array($settings)) {
            programRespond(["success" => false, "message" => "settings map required."], 422);
        }
        try {
            $stmt = $conn->prepare("INSERT INTO key_programs_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
            foreach ($settings as $k => $v) {
                if (is_array($v)) {
                    $v = json_encode($v);
                }
                $stmt->execute([(string)$k, (string)$v]);
            }
            programRespond(["success" => true, "message" => "Settings saved successfully."]);
        } catch (PDOException $e) {
            programRespond(["success" => false, "message" => "Failed to save settings: " . $e->getMessage()], 500);
        }
    }

    programRespond(["success" => false, "message" => "Unknown action."], 400);
}

