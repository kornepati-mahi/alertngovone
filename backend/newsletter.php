<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed. Use POST."]);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);
$email = isset($input['email']) ? filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL) : '';

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(["success" => false, "message" => "Please enter a valid email address."]);
    exit();
}

try {
    $stmt = $conn->prepare("INSERT IGNORE INTO newsletters (email) VALUES (:email)");
    $stmt->execute([':email' => $email]);

    echo json_encode([
        "success" => true,
        "message" => "Thank you for subscribing to ALERT NGO updates!"
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Subscription failed: " . $e->getMessage()]);
}
