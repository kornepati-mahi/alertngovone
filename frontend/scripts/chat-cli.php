<?php
// CLI harness: feeds a JSON chat request through backend/chat.php
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['REMOTE_ADDR'] = '127.0.0.1';
require __DIR__ . '/../../backend/chat.php';
