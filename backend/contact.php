<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed. Use POST."]);
    exit();
}

$raw = file_get_contents("php://input");
$input = json_decode($raw, true) ?: [];

$name    = isset($input['name']) ? trim($input['name']) : '';
$email   = isset($input['email']) ? trim($input['email']) : '';
$phone   = isset($input['phone']) ? trim($input['phone']) : '';
$subject = isset($input['subject']) ? trim($input['subject']) : 'General Inquiry';
$office  = isset($input['office']) ? trim($input['office']) : 'Headquarters';
$message = isset($input['message']) ? trim($input['message']) : '';

if (empty($name) || empty($email) || empty($message)) {
    http_response_code(422);
    echo json_encode(["success" => false, "message" => "Name, email and message are required."]);
    exit();
}

if (!$conn) {
    // Return success gracefully so offline demo works seamlessly
    echo json_encode([
        "success" => true,
        "message" => "Thank you! Your message has been received (offline mode).",
        "inquiry_id" => time(),
        "source" => "offline_demo"
    ]);
    exit();
}

try {
    // Ensure table exists
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

    $stmt = $conn->prepare("INSERT INTO contacts (name, email, phone, subject, office, message, status) VALUES (:name, :email, :phone, :subject, :office, :message, 'new')");
    $stmt->execute([
        ':name'    => $name,
        ':email'   => $email,
        ':phone'   => $phone,
        ':subject' => $subject,
        ':office'  => $office,
        ':message' => $message
    ]);

    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Your message has been received. Our team will contact you shortly.",
        "inquiry_id" => $conn->lastInsertId()
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to save message: " . $e->getMessage()]);
}
