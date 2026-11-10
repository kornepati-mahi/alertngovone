<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed. Use POST."]);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON payload"]);
    exit();
}

$name    = isset($input['name']) ? trim($input['name']) : '';
$email   = isset($input['email']) ? trim($input['email']) : '';
$phone   = isset($input['phone']) ? trim($input['phone']) : '';
$pan     = isset($input['pan']) ? strtoupper(trim($input['pan'])) : '';
$amount  = isset($input['amount']) ? floatval($input['amount']) : 0;
$message = isset($input['message']) ? trim($input['message']) : '';

if (empty($name) || empty($email) || $amount <= 0) {
    http_response_code(422);
    echo json_encode(["success" => false, "message" => "Name, valid email and an amount greater than 0 are required."]);
    exit();
}

try {
    $stmt = $conn->prepare("INSERT INTO donations (name, email, phone, pan, amount, message, payment_status, transaction_id) VALUES (:name, :email, :phone, :pan, :amount, :message, 'completed', :txn)");
    
    $txnId = "TXN_" . strtoupper(uniqid());
    $stmt->execute([
        ':name'    => $name,
        ':email'   => $email,
        ':phone'   => $phone,
        ':pan'     => $pan,
        ':amount'  => $amount,
        ':message' => $message,
        ':txn'     => $txnId
    ]);

    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Thank you! Your donation was recorded successfully.",
        "donation_id" => $conn->lastInsertId(),
        "transaction_id" => $txnId,
        "amount" => $amount
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to record donation: " . $e->getMessage()]);
}
