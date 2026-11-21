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
$settingsFile = __DIR__ . '/../data/settings.json';

function readSettings($file) {
    if (!file_exists($file)) return [];
    $c = @file_get_contents($file);
    if (empty($c)) return [];
    $d = json_decode($c, true);
    return is_array($d) ? $d : [];
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(readSettings($settingsFile), JSON_UNESCAPED_UNICODE);
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
    $incoming = json_decode($raw, true);

    if (!is_array($incoming)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid settings JSON']);
        exit;
    }

    $current = readSettings($settingsFile);
    $merged = array_merge($current, $incoming);

    $dir = dirname($settingsFile);
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }

    $written = @file_put_contents(
        $settingsFile,
        json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
        LOCK_EX
    );

    if ($written === false) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to write settings.json on server']);
        exit;
    }

    echo json_encode([
        'success' => true,
        'settings' => $merged
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
