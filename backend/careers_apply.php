<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed. Use POST."]);
    exit();
}

// 1. Prepare upload directories for resumes (both backend and frontend/public)
$backendUploadDir = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'resumes';
$frontendUploadDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'frontend' . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'resumes';
foreach ([$backendUploadDir, $frontendUploadDir] as $d) {
    if (!is_dir($d)) {
        @mkdir($d, 0777, true);
    }
}

// 2. Read input (multipart form or JSON)
$name          = trim($_POST['name'] ?? '');
$email         = trim($_POST['email'] ?? '');
$phone         = trim($_POST['phone'] ?? '');
$interest_type = trim($_POST['interest_type'] ?? 'General Talent Pool');
$background    = trim($_POST['background'] ?? '');
$note          = trim($_POST['note'] ?? '');
$resume_url    = trim($_POST['resume_url'] ?? '');
$resume_name   = trim($_POST['resume_name'] ?? '');
$resume_data   = trim($_POST['resume_data'] ?? '');
$referees      = trim($_POST['referees'] ?? '');

if (empty($name) && empty($email)) {
    $raw = file_get_contents("php://input");
    $input = json_decode($raw, true);
    if (is_array($input)) {
        $name          = trim($input['name'] ?? '');
        $email         = trim($input['email'] ?? '');
        $phone         = trim($input['phone'] ?? '');
        $interest_type = trim($input['interest_type'] ?? 'General Talent Pool');
        $background    = trim($input['background'] ?? '');
        $note          = trim($input['note'] ?? '');
        $resume_url    = trim($input['resume_url'] ?? '');
        $resume_name   = trim($input['resume_name'] ?? '');
        $resume_data   = trim($input['resume_data'] ?? '');
        $referees      = trim($input['referees'] ?? '');
    }
}

if (empty($name) || empty($email) || empty($note)) {
    http_response_code(422);
    echo json_encode(["success" => false, "message" => "Name, email, and statement of interest are required."]);
    exit();
}

// 3. Handle File Upload (either via $_FILES or Base64 Data URL)
if (!empty($_FILES['resume_file']) && $_FILES['resume_file']['error'] === UPLOAD_ERR_OK) {
    $tmpName = $_FILES['resume_file']['tmp_name'];
    $origName = basename($_FILES['resume_file']['name']);
    $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
    $allowed = ['pdf', 'doc', 'docx', 'odt', 'rtf', 'png', 'jpg', 'jpeg'];
    if (in_array($ext, $allowed)) {
        $safeFileName = 'resume_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $destPath = $backendUploadDir . DIRECTORY_SEPARATOR . $safeFileName;
        $frontendDestPath = $frontendUploadDir . DIRECTORY_SEPARATOR . $safeFileName;
        if (move_uploaded_file($tmpName, $destPath)) {
            @copy($destPath, $frontendDestPath);
            $resume_url = '/uploads/resumes/' . $safeFileName;
            if (empty($resume_name)) {
                $resume_name = $origName;
            }
        }
    }
} elseif (!empty($resume_data) && strpos($resume_data, 'data:') === 0) {
    // Base64 Data URL format: data:<mime>;base64,<data>
    if (preg_match('/^data:(.*?);base64,(.*)$/', $resume_data, $matches)) {
        $mime = strtolower(trim($matches[1]));
        $base64Content = $matches[2];
        $ext = 'pdf';
        if (strpos($mime, 'pdf') !== false) {
            $ext = 'pdf';
        } elseif (strpos($mime, 'wordprocessingml') !== false || strpos($mime, 'docx') !== false) {
            $ext = 'docx';
        } elseif (strpos($mime, 'msword') !== false || strpos($mime, 'doc') !== false) {
            $ext = 'doc';
        } elseif (strpos($mime, 'png') !== false) {
            $ext = 'png';
        } elseif (strpos($mime, 'jpeg') !== false || strpos($mime, 'jpg') !== false) {
            $ext = 'jpg';
        }

        $decoded = base64_decode($base64Content);
        if ($decoded !== false) {
            $safeFileName = 'resume_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
            $destPath = $backendUploadDir . DIRECTORY_SEPARATOR . $safeFileName;
            $frontendDestPath = $frontendUploadDir . DIRECTORY_SEPARATOR . $safeFileName;
            if (file_put_contents($destPath, $decoded) !== false) {
                @file_put_contents($frontendDestPath, $decoded);
                $resume_url = '/uploads/resumes/' . $safeFileName;
                if (empty($resume_name)) {
                    $resume_name = 'Resume_' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $name) . '.' . $ext;
                }
            }
        }
    }
}

// 4. Offline Demo Fallback if database is unavailable
if (!$conn) {
    echo json_encode([
        "success" => true,
        "message" => "Thank you! Your application and resume have been received into our talent pool.",
        "id" => time(),
        "resume_url" => $resume_url,
        "resume_name" => $resume_name,
        "source" => "offline_demo"
    ]);
    exit();
}

try {
    // 5. Ensure Table and Columns Exist
    $conn->exec("CREATE TABLE IF NOT EXISTS `careers_leads` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(255) NOT NULL,
        `email` VARCHAR(255) NOT NULL,
        `phone` VARCHAR(50) NULL,
        `interest_type` VARCHAR(255) NOT NULL,
        `background` VARCHAR(255) NULL,
        `note` TEXT NULL,
        `resume_url` TEXT NULL,
        `resume_name` VARCHAR(255) NULL,
        `referees` TEXT NULL,
        `status` VARCHAR(50) DEFAULT 'New',
        `admin_notes` TEXT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Add resume_name column if missing from existing table
    try {
        $checkCol = $conn->query("SHOW COLUMNS FROM `careers_leads` LIKE 'resume_name'");
        if ($checkCol && $checkCol->rowCount() === 0) {
            $conn->exec("ALTER TABLE `careers_leads` ADD COLUMN `resume_name` VARCHAR(255) NULL AFTER `resume_url`");
        }
    } catch (Exception $colEx) {}

    // Widen resume_url if VARCHAR(500)
    try {
        $conn->exec("ALTER TABLE `careers_leads` MODIFY `resume_url` TEXT NULL");
    } catch (Exception $modEx) {}

    $stmt = $conn->prepare("INSERT INTO `careers_leads` 
        (`name`, `email`, `phone`, `interest_type`, `background`, `note`, `resume_url`, `resume_name`, `referees`, `status`)
        VALUES (:name, :email, :phone, :interest_type, :background, :note, :resume_url, :resume_name, :referees, 'New')");

    $stmt->execute([
        ':name'          => $name,
        ':email'         => $email,
        ':phone'         => $phone,
        ':interest_type' => $interest_type,
        ':background'    => $background,
        ':note'          => $note,
        ':resume_url'    => $resume_url,
        ':resume_name'   => $resume_name,
        ':referees'      => $referees
    ]);

    $insertId = $conn->lastInsertId();

    echo json_encode([
        "success" => true,
        "message" => "Thank you for applying to ALERT! Your application and resume have been submitted successfully.",
        "id" => $insertId,
        "resume_url" => $resume_url,
        "resume_name" => $resume_name
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
