<?php
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate');

$ADMIN_PASS = 'GabMar5048';
$key = $_GET['key'] ?? $_SERVER['HTTP_X_ADMIN_PASSWORD'] ?? '';
if ($key !== $ADMIN_PASS) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$uploadsDir = __DIR__ . '/../uploads';
$productsFile = __DIR__ . '/../data/products.json';
$apply = isset($_GET['apply']) && $_GET['apply'] === '1';

function normalizeStr($s) {
    $s = mb_strtolower($s, 'UTF-8');
    $map = ['á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ö'=>'o','ő'=>'o','ú'=>'u','ü'=>'u','ű'=>'u'];
    $s = strtr($s, $map);
    return preg_replace('/[^a-z0-9]+/', '', $s);
}

function stripTimestamp($filename) {
    $base = pathinfo($filename, PATHINFO_FILENAME);
    return preg_replace('/^\d{10,15}_/', '', $base);
}

$products = [];
if (file_exists($productsFile)) {
    $products = json_decode(file_get_contents($productsFile), true) ?: [];
}

// Find files uploaded since 2026-11-21 12:00:00 (timestamp >= 1795258800 or filename prefix >= 1795200000000)
$cutoffTime = strtotime('2026-11-21 00:00:00');
$recentFiles = [];

if (is_dir($uploadsDir)) {
    foreach (scandir($uploadsDir) as $f) {
        if ($f === '.' || $f === '..') continue;
        $full = $uploadsDir . '/' . $f;
        if (!is_file($full)) continue;
        $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'], true)) continue;

        $mtime = filemtime($full);
        $hasRecentPrefix = preg_match('/^(1795[2-9]\d{8}|1796\d{9})_/', $f);
        if ($hasRecentPrefix || $mtime >= $cutoffTime) {
            $recentFiles[] = [
                'file' => $f,
                'url' => '/uploads/' . $f,
                'mtime' => date('Y-m-d H:i:s', $mtime),
                'sizeKB' => round(filesize($full) / 1024, 1),
                'stem' => stripTimestamp($f),
                'normStem' => normalizeStr(stripTimestamp($f))
            ];
        }
    }
}

usort($recentFiles, function($a, $b) {
    return strcmp($a['file'], $b['file']);
});

$matched = [];
$unmatched = [];

foreach ($recentFiles as $rf) {
    $bestIdx = null;
    $reason = '';

    // 1. Exact normalized stem match with existing product image filename
    foreach ($products as $idx => $p) {
        $existingStem = normalizeStr(stripTimestamp(basename($p['image'] ?? '')));
        if (!empty($existingStem) && $existingStem === $rf['normStem']) {
            $bestIdx = $idx;
            $reason = 'exact_image_stem';
            break;
        }
    }

    // 2. SKU number prefix match (e.g. 501_... -> sku "501.")
    if ($bestIdx === null && preg_match('/^0*(\d{1,4})[\s._-]/', $rf['stem'], $m)) {
        $num = ltrim($m[1], '0');
        foreach ($products as $idx => $p) {
            $skuNum = ltrim(preg_replace('/[^\d]/', '', $p['sku'] ?? ''), '0');
            if ($skuNum !== '' && $skuNum === $num) {
                $bestIdx = $idx;
                $reason = 'sku_match_' . $num;
                break;
            }
        }
    }

    // 3. Product name normalized match
    if ($bestIdx === null && strlen($rf['normStem']) >= 5) {
        foreach ($products as $idx => $p) {
            $pNorm = normalizeStr($p['name'] ?? '');
            if (!empty($pNorm) && (strpos($rf['normStem'], $pNorm) !== false || strpos($pNorm, $rf['normStem']) !== false)) {
                $bestIdx = $idx;
                $reason = 'name_match';
                break;
            }
        }
    }

    if ($bestIdx !== null) {
        $matched[] = [
            'file' => $rf['file'],
            'url' => $rf['url'],
            'sizeKB' => $rf['sizeKB'],
            'productId' => $products[$bestIdx]['id'],
            'productName' => $products[$bestIdx]['name'],
            'oldImage' => $products[$bestIdx]['image'],
            'reason' => $reason
        ];
        if ($apply) {
            $products[$bestIdx]['image'] = $rf['url'];
        }
    } else {
        $unmatched[] = $rf;
    }
}

$saved = false;
if ($apply && count($matched) > 0) {
    @copy($productsFile, __DIR__ . '/../data/products.before_restore.json');
    $saved = (@file_put_contents($productsFile, json_encode($products, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX) !== false);
}

echo json_encode([
    'success' => true,
    'applied' => $apply,
    'saved' => $saved,
    'recentUploadsFound' => count($recentFiles),
    'matchedCount' => count($matched),
    'unmatchedCount' => count($unmatched),
    'matched' => $matched,
    'unmatched' => $unmatched
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
