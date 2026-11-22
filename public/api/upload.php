<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Password');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Nincs kijelölt fájl vagy feltöltési hiba történt.']);
    exit;
}

$file = $_FILES['file'];
$maxSize = 15 * 1024 * 1024; // 15 MB
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'A fájl túl nagy (maximum 15 MB).']);
    exit;
}

$origName = basename($file['name']);
$ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif'];

if (!in_array($ext, $allowed, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Csak képfájlok tölthetők fel (JPG, PNG, WEBP, GIF, SVG).']);
    exit;
}

$uploadDir = __DIR__ . '/../uploads';
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0755, true);
}

$safeName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $origName);
$fileName = round(microtime(true) * 1000) . '_' . $safeName;
$targetPath = $uploadDir . '/' . $fileName;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Nem sikerült menteni a képet a szerverre.']);
    exit;
}

echo json_encode([
    'success' => true,
    'url' => '/uploads/' . $fileName
]);
