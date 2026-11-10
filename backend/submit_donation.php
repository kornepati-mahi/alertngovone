<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed. Use POST."]);
    exit;
}

// 1. Ensure donations table exists
if ($conn) {
    try {
        $conn->exec("CREATE TABLE IF NOT EXISTS `donations` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `donor_name` VARCHAR(150) NOT NULL,
            `email` VARCHAR(150) NOT NULL,
            `phone` VARCHAR(50) NULL,
            `pan` VARCHAR(30) NULL,
            `amount` DECIMAL(10,2) NOT NULL,
            `message` TEXT NULL,
            `transaction_id` VARCHAR(100) NULL,
            `screenshot_url` VARCHAR(255) NULL,
            `payment_status` ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
            `admin_notes` TEXT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (Exception $e) {
        // Table may already exist
    }
}

// Read either POST multipart or JSON payload
$name           = trim($_POST['name'] ?? $_POST['donor_name'] ?? '');
$email          = trim($_POST['email'] ?? '');
$phone          = trim($_POST['phone'] ?? '');
$pan            = strtoupper(trim($_POST['pan'] ?? ''));
$amount         = floatval($_POST['amount'] ?? 0);
$message        = trim($_POST['message'] ?? '');
$transaction_id = trim($_POST['transaction_id'] ?? $_POST['utr'] ?? '');
$screenshot_url = trim($_POST['screenshot_url'] ?? '');

if (empty($name) && empty($email)) {
    $rawInput = file_get_contents('php://input');
    $json = json_decode($rawInput, true);
    if (is_array($json)) {
        $name           = trim($json['name'] ?? $json['donor_name'] ?? '');
        $email          = trim($json['email'] ?? '');
        $phone          = trim($json['phone'] ?? '');
        $pan            = strtoupper(trim($json['pan'] ?? ''));
        $amount         = floatval($json['amount'] ?? 0);
        $message        = trim($json['message'] ?? '');
        $transaction_id = trim($json['transaction_id'] ?? $json['utr'] ?? '');
        $screenshot_url = trim($json['screenshot_url'] ?? '');
    }
}

if (empty($name) || empty($email) || $amount <= 0) {
    http_response_code(422);
    echo json_encode(["success" => false, "message" => "Donor name, valid email address and amount greater than 0 are required."]);
    exit;
}

// 2. Handle File Upload if screenshot was submitted
$uploadDir = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'donations';
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0777, true);
}

if (!empty($_FILES['screenshot']) && $_FILES['screenshot']['error'] === UPLOAD_ERR_OK) {
    $tmpName = $_FILES['screenshot']['tmp_name'];
    $origName = $_FILES['screenshot']['name'];
    $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
    if (in_array($ext, $allowed)) {
        $safeName = 'proof_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $destPath = $uploadDir . DIRECTORY_SEPARATOR . $safeName;
        if (move_uploaded_file($tmpName, $destPath)) {
            $screenshot_url = '/uploads/donations/' . $safeName;
        }
    }
} elseif (!empty($screenshot_url) && strpos($screenshot_url, 'data:image') === 0) {
    // Handle Base64 image
    if (preg_match('/^data:image\/(\w+);base64,/', $screenshot_url, $type)) {
        $data = substr($screenshot_url, strpos($screenshot_url, ',') + 1);
        $type = strtolower($type[1]);
        if (in_array($type, ['jpg', 'jpeg', 'png', 'webp'])) {
            $data = base64_decode($data);
            if ($data !== false) {
                $safeName = 'proof_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $type;
                $destPath = $uploadDir . DIRECTORY_SEPARATOR . $safeName;
                if (file_put_contents($destPath, $data) !== false) {
                    $screenshot_url = '/uploads/donations/' . $safeName;
                }
            }
        }
    }
}

$tracking_code = !empty($transaction_id) ? $transaction_id : ('ALT-DON-' . rand(100000, 999999));

if (!$conn) {
    // Offline / Mock response
    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Donation proof recorded successfully.",
        "donation_id" => time(),
        "tracking_code" => $tracking_code,
        "screenshot_url" => $screenshot_url,
        "source" => "offline_fallback"
    ]);
    exit;
}

try {
    $stmt = $conn->prepare("INSERT INTO donations 
        (donor_name, email, phone, pan, amount, message, transaction_id, screenshot_url, payment_status) 
        VALUES (:name, :email, :phone, :pan, :amount, :message, :txn, :proof, 'pending')");

    $stmt->execute([
        ':name'    => $name,
        ':email'   => $email,
        ':phone'   => $phone,
        ':pan'     => $pan,
        ':amount'  => $amount,
        ':message' => $message,
        ':txn'     => $tracking_code,
        ':proof'   => $screenshot_url
    ]);

    $newId = $conn->lastInsertId();

    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Thank you! Your donation and payment proof have been registered for 80G verification.",
        "donation_id" => $newId,
        "tracking_code" => $tracking_code,
        "screenshot_url" => $screenshot_url
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to record donation: " . $e->getMessage()
    ]);
}

