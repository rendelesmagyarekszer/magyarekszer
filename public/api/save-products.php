<?php
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Password');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$ADMIN_PASS = 'GabMar5048';
$productsFile = __DIR__ . '/../data/products.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!file_exists($productsFile)) {
        echo json_encode([]);
        exit;
    }
    $content = @file_get_contents($productsFile);
    echo !empty($content) ? $content : '[]';
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $providedPass = $_SERVER['HTTP_X_ADMIN_PASSWORD'] ?? '';
    if ($providedPass !== $ADMIN_PASS) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorized']);
        exit;
    }

    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (!$data || !isset($data['products']) || !is_array($data['products'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid products data']);
        exit;
    }

    $dir = dirname($productsFile);
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }

    // Write atomically via temp file
    $json = json_encode($data['products'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    $written = @file_put_contents($productsFile, $json, LOCK_EX);

    if ($written === false) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to write products.json on server']);
        exit;
    }

    echo json_encode([
        'success' => true,
        'count' => count($data['products'])
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
