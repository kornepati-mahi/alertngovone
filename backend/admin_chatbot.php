<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

function chatbotAdminRespond($payload, $status = 200) {
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
    chatbotAdminRespond(["success" => false, "message" => "Invalid admin key."], 401);
}

// 1. Ensure MySQL table exists
if ($conn) {
    try {
        $conn->exec("CREATE TABLE IF NOT EXISTS `chatbot_settings` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `provider` VARCHAR(50) NOT NULL DEFAULT 'groq',
            `api_key` VARCHAR(255) NOT NULL,
            `model_name` VARCHAR(100) NOT NULL DEFAULT 'llama-3.3-70b-versatile',
            `label` VARCHAR(150) NULL,
            `is_active` TINYINT(1) DEFAULT 1,
            `status` VARCHAR(50) DEFAULT 'untested',
            `last_tested_at` DATETIME NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        // Seed if table is empty
        $count = (int)$conn->query("SELECT COUNT(*) FROM `chatbot_settings`")->fetchColumn();
        if ($count === 0) {
            $defaultKey = getenv('GROQ_API_KEY') ?: '';
            $defaultModel = getenv('GROQ_MODEL') ?: 'llama-3.3-70b-versatile';
            $stmt = $conn->prepare("INSERT INTO `chatbot_settings` (provider, api_key, model_name, label, is_active, status) VALUES (:p, :k, :m, :l, 1, 'active')");
            $stmt->execute([
                ':p' => 'groq',
                ':k' => $defaultKey,
                ':m' => $defaultModel,
                ':l' => 'Default Production Key'
            ]);
        }
    } catch (Exception $e) {
        // Table creation will retry or fallback
    }
}

// Helper to update .env safely
function updateEnvFile(array $updates) {
    $envPath = __DIR__ . DIRECTORY_SEPARATOR . '.env';
    $lines = file_exists($envPath) ? file($envPath, FILE_IGNORE_NEW_LINES) : [];
    $keysFound = [];
    $newLines = [];

    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || $trimmed[0] === '#' || $trimmed[0] === ';') {
            $newLines[] = $line;
            continue;
        }
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $k = trim($parts[0]);
            if (array_key_exists($k, $updates)) {
                $newLines[] = "{$k}=" . $updates[$k];
                $keysFound[$k] = true;
                continue;
            }
        }
        $newLines[] = $line;
    }

    foreach ($updates as $k => $v) {
        if (!isset($keysFound[$k])) {
            $newLines[] = "{$k}={$v}";
        }
    }

    $success = @file_put_contents($envPath, implode(PHP_EOL, $newLines) . PHP_EOL);

    foreach ($updates as $k => $v) {
        putenv("{$k}={$v}");
        $_ENV[$k] = $v;
    }

    return $success !== false;
}

// Helper to mask key for safe display
function maskApiKey($key) {
    $len = strlen($key);
    if ($len <= 8) return str_repeat('•', $len);
    $prefix = substr($key, 0, 8);
    $suffix = substr($key, -4);
    return $prefix . str_repeat('•', max(4, $len - 12)) . $suffix;
}

// Helper to test Groq API key
function testGroqKey($key) {
    if (empty($key)) {
        return ["ok" => false, "error" => "API key is empty."];
    }
    
    $ch = curl_init('https://api.groq.com/openai/v1/models');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . trim($key),
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $startTime = microtime(true);
    $response = curl_exec($ch);
    $latencyMs = round((microtime(true) - $startTime) * 1000);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        return ["ok" => false, "error" => "Curl error: " . $err, "latency_ms" => $latencyMs];
    }

    $json = json_decode((string)$response, true);

    if ($httpCode === 200 && is_array($json) && isset($json['data'])) {
        return [
            "ok" => true,
            "latency_ms" => $latencyMs,
            "models_count" => count($json['data']),
            "message" => "Connection successful! Groq API authenticated and responded in " . $latencyMs . "ms."
        ];
    }

    $errMsg = $json['error']['message'] ?? ("Groq returned HTTP code " . $httpCode);
    return [
        "ok" => false,
        "latency_ms" => $latencyMs,
        "http_code" => $httpCode,
        "error" => $errMsg
    ];
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?: [];

// ── GET REQUEST ──────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $action = $_GET['action'] ?? 'get';

    if ($action === 'test') {
        $testKey = $_GET['key'] ?? (getenv('GROQ_API_KEY') ?: '');
        $res = testGroqKey($testKey);
        chatbotAdminRespond([
            "success" => $res['ok'],
            "data" => $res
        ]);
    }

    $keys = [];
    $activeKey = null;

    if ($conn) {
        try {
            $stmt = $conn->query("SELECT * FROM `chatbot_settings` ORDER BY id DESC");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($rows as $r) {
                $r['masked_key'] = maskApiKey($r['api_key']);
                $keys[] = $r;
                if ((int)$r['is_active'] === 1 && !$activeKey) {
                    $activeKey = $r;
                }
            }
        } catch (Exception $e) {}
    }

    // Fallback if database had no rows
    if (!$activeKey) {
        $envKey = getenv('GROQ_API_KEY') ?: '';
        $envModel = getenv('GROQ_MODEL') ?: 'llama-3.3-70b-versatile';
        $activeKey = [
            "id" => 1,
            "provider" => "groq",
            "api_key" => $envKey,
            "masked_key" => maskApiKey($envKey),
            "model_name" => $envModel,
            "label" => "Default Production Key (.env)",
            "is_active" => 1,
            "status" => "active",
            "last_tested_at" => null,
            "updated_at" => date("Y-m-d H:i:s")
        ];
        if (empty($keys)) {
            $keys[] = $activeKey;
        }
    }

    $envPath = __DIR__ . DIRECTORY_SEPARATOR . '.env';

    chatbotAdminRespond([
        "success" => true,
        "data" => [
            "active" => $activeKey,
            "keys" => $keys,
            "env_info" => [
                "path" => $envPath,
                "exists" => file_exists($envPath),
                "writable" => is_writable($envPath),
                "groq_api_key_set" => !empty(getenv('GROQ_API_KEY')),
                "groq_model" => getenv('GROQ_MODEL') ?: 'llama-3.3-70b-versatile'
            ]
        ]
    ]);
}

// ── POST / PUT REQUEST ───────────────────────────────────────────────────────
if ($method === 'POST') {
    $action = $input['action'] ?? ($_POST['action'] ?? 'save');

    // TEST KEY ACTION
    if ($action === 'test') {
        $testKey = trim($input['api_key'] ?? ($_POST['api_key'] ?? ''));
        if (empty($testKey)) {
            $testKey = getenv('GROQ_API_KEY') ?: '';
        }
        $testResult = testGroqKey($testKey);

        if ($conn && !empty($input['id'])) {
            try {
                $statusVal = $testResult['ok'] ? 'valid' : 'invalid';
                $stmt = $conn->prepare("UPDATE `chatbot_settings` SET `status` = :st, `last_tested_at` = NOW() WHERE `id` = :id");
                $stmt->execute([':st' => $statusVal, ':id' => (int)$input['id']]);
            } catch (Exception $e) {}
        }

        chatbotAdminRespond([
            "success" => $testResult['ok'],
            "data" => $testResult
        ]);
    }

    // SET ACTIVE KEY ACTION
    if ($action === 'set_active') {
        $id = (int)($input['id'] ?? ($_POST['id'] ?? 0));
        if ($id <= 0) {
            chatbotAdminRespond(["success" => false, "message" => "Valid key ID required."], 400);
        }

        if ($conn) {
            try {
                $conn->beginTransaction();
                $conn->exec("UPDATE `chatbot_settings` SET `is_active` = 0");
                $stmt = $conn->prepare("UPDATE `chatbot_settings` SET `is_active` = 1, `updated_at` = NOW() WHERE `id` = :id");
                $stmt->execute([':id' => $id]);

                $fetchStmt = $conn->prepare("SELECT * FROM `chatbot_settings` WHERE `id` = :id");
                $fetchStmt->execute([':id' => $id]);
                $selected = $fetchStmt->fetch(PDO::FETCH_ASSOC);
                $conn->commit();

                if ($selected) {
                    updateEnvFile([
                        'GROQ_API_KEY' => $selected['api_key'],
                        'GROQ_MODEL' => $selected['model_name']
                    ]);
                }

                chatbotAdminRespond([
                    "success" => true,
                    "message" => "Active key updated and synchronized to .env!",
                    "active" => $selected
                ]);
            } catch (Exception $e) {
                if ($conn->inTransaction()) $conn->rollBack();
                chatbotAdminRespond(["success" => false, "message" => "Failed to activate key: " . $e->getMessage()], 500);
            }
        }
    }

    // DELETE KEY ACTION
    if ($action === 'delete') {
        $id = (int)($input['id'] ?? ($_POST['id'] ?? 0));
        if ($id <= 0) {
            chatbotAdminRespond(["success" => false, "message" => "Valid key ID required."], 400);
        }

        if ($conn) {
            try {
                $chkStmt = $conn->prepare("SELECT is_active FROM `chatbot_settings` WHERE `id` = :id");
                $chkStmt->execute([':id' => $id]);
                $isAct = (int)$chkStmt->fetchColumn();
                if ($isAct === 1) {
                    chatbotAdminRespond(["success" => false, "message" => "Cannot delete the currently active key. Activate another key first."], 400);
                }

                $stmt = $conn->prepare("DELETE FROM `chatbot_settings` WHERE `id` = :id");
                $stmt->execute([':id' => $id]);

                chatbotAdminRespond([
                    "success" => true,
                    "message" => "API key removed from history table."
                ]);
            } catch (Exception $e) {
                chatbotAdminRespond(["success" => false, "message" => "Failed to delete: " . $e->getMessage()], 500);
            }
        }
    }

    // SAVE / UPDATE KEY ACTION
    $apiKey = trim($input['api_key'] ?? ($_POST['api_key'] ?? ''));
    $modelName = trim($input['model_name'] ?? ($_POST['model_name'] ?? 'llama-3.3-70b-versatile'));
    $provider = trim($input['provider'] ?? ($_POST['provider'] ?? 'groq'));
    $label = trim($input['label'] ?? ($_POST['label'] ?? ''));
    $editId = !empty($input['id']) ? (int)$input['id'] : 0;

    if (empty($apiKey)) {
        chatbotAdminRespond(["success" => false, "message" => "API key cannot be empty."], 422);
    }

    if (empty($modelName)) {
        $modelName = 'llama-3.3-70b-versatile';
    }

    // 1. Update backend/.env file directly
    $envUpdated = updateEnvFile([
        'GROQ_API_KEY' => $apiKey,
        'GROQ_MODEL' => $modelName
    ]);

    // 2. Update MySQL database table
    $insertedId = 0;
    if ($conn) {
        try {
            $conn->beginTransaction();
            // Deactivate all old keys
            $conn->exec("UPDATE `chatbot_settings` SET `is_active` = 0");

            if ($editId > 0) {
                $stmt = $conn->prepare("UPDATE `chatbot_settings` SET 
                    `provider` = :p,
                    `api_key` = :k,
                    `model_name` = :m,
                    `label` = :l,
                    `is_active` = 1,
                    `status` = 'active',
                    `updated_at` = NOW()
                    WHERE `id` = :id");
                $stmt->execute([
                    ':p' => $provider,
                    ':k' => $apiKey,
                    ':m' => $modelName,
                    ':l' => $label ?: 'Admin Key ' . date("Y-m-d"),
                    ':id' => $editId
                ]);
                $insertedId = $editId;
            } else {
                $stmt = $conn->prepare("INSERT INTO `chatbot_settings` 
                    (`provider`, `api_key`, `model_name`, `label`, `is_active`, `status`)
                    VALUES (:p, :k, :m, :l, 1, 'active')");
                $stmt->execute([
                    ':p' => $provider,
                    ':k' => $apiKey,
                    ':m' => $modelName,
                    ':l' => $label ?: 'Admin Key ' . date("Y-m-d H:i")
                ]);
                $insertedId = (int)$conn->lastInsertId();
            }

            $conn->commit();
        } catch (Exception $e) {
            if ($conn->inTransaction()) $conn->rollBack();
        }
    }

    chatbotAdminRespond([
        "success" => true,
        "message" => "Chatbot API Key updated and synchronized to .env successfully!",
        "data" => [
            "id" => $insertedId,
            "provider" => $provider,
            "model_name" => $modelName,
            "api_key" => $apiKey,
            "masked_key" => maskApiKey($apiKey),
            "env_updated" => $envUpdated,
            "updated_at" => date("Y-m-d H:i:s")
        ]
    ]);
}

chatbotAdminRespond(["success" => false, "message" => "Method not allowed."], 405);

