<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$ordersFile = __DIR__ . '/orders.json';

function getOrders($ordersFile) {
    if (!file_exists($ordersFile)) {
        return [];
    }
    $content = @file_get_contents($ordersFile);
    if (empty($content)) {
        return [];
    }
    $decoded = json_decode($content, true);
    return is_array($decoded) ? $decoded : [];
}

function saveOrders($ordersFile, $orders) {
    return @file_put_contents($ordersFile, json_encode($orders, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $orders = getOrders($ordersFile);
    echo json_encode([
        'success' => true,
        'orders' => $orders
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (!$data || empty($data['orderId'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing orderId']);
        exit;
    }

    $orders = getOrders($ordersFile);
    $orderId = $data['orderId'];
    $found = false;

    foreach ($orders as &$order) {
        if ($order['id'] === $orderId) {
            $found = true;

            // Update fulfillment status if provided
            if (isset($data['status'])) {
                $order['status'] = $data['status'];
            }

            // Update viewed state if provided
            if (isset($data['viewed'])) {
                $order['viewed'] = (bool)$data['viewed'];
                if ($order['viewed'] && empty($order['viewedAt'])) {
                    $order['viewedAt'] = date('Y-m-d H:i:s');
                }
            }

            // Update payment status if provided
            if (isset($data['paymentStatus'])) {
                $order['paymentStatus'] = $data['paymentStatus'];
                if ($data['paymentStatus'] === 'paid') {
                    $order['paidAt'] = date('Y-m-d H:i:s');
                    $order['paidVia'] = !empty($data['paidVia']) ? $data['paidVia'] : 'Kézi admin jóváhagyás';
                } else if ($data['paymentStatus'] === 'pending') {
                    $order['paidAt'] = null;
                    $order['paidVia'] = null;
                }
            }

            break;
        }
    }

    if ($found) {
        saveOrders($ordersFile, $orders);
        echo json_encode(['success' => true, 'orders' => $orders], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Order not found']);
    }
    exit;
}
