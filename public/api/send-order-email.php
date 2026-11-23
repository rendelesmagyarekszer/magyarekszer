<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$rawInput = file_get_contents('php://input');
$order = json_decode($rawInput, true);

if (!$order) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit;
}

$STORE_EMAIL = 'magyarekszer@gmail.com';
$GMAIL_USER = 'magyarekszer@gmail.com';
$GMAIL_APP_PASSWORD = 'ryiuydrxvpinayoa';

function formatPrice($num) {
    return number_format((float)$num, 0, ',', ' ') . ' Ft';
}

function send_smtp_socket($to, $subject, $htmlBody, $smtpUser, $smtpPass, $fromName = 'MagyarÉkszer') {
    $timeout = 10;
    $socket = @fsockopen('ssl://smtp.gmail.com', 465, $errno, $errstr, $timeout);
    if (!$socket) {
        return false;
    }

    $read = function() use ($socket) {
        $data = '';
        while ($line = fgets($socket, 515)) {
            $data .= $line;
            if (substr($line, 3, 1) === ' ') break;
        }
        return $data;
    };

    $write = function($cmd) use ($socket) {
        fputs($socket, $cmd . "\r\n");
    };

    $res = $read();
    if (substr($res, 0, 3) !== '220') { fclose($socket); return false; }

    $serverHost = isset($_SERVER['SERVER_NAME']) && !empty($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : 'magyarekszer.hu';
    $write("EHLO " . $serverHost);
    $res = $read();

    $write("AUTH LOGIN");
    $res = $read();
    if (substr($res, 0, 3) !== '334') { fclose($socket); return false; }

    $write(base64_encode($smtpUser));
    $res = $read();
    if (substr($res, 0, 3) !== '334') { fclose($socket); return false; }

    $write(base64_encode($smtpPass));
    $res = $read();
    if (substr($res, 0, 3) !== '235') { fclose($socket); return false; }

    $write("MAIL FROM: <" . $smtpUser . ">");
    $res = $read();
    if (substr($res, 0, 3) !== '250') { fclose($socket); return false; }

    $write("RCPT TO: <" . $to . ">");
    $res = $read();
    if (substr($res, 0, 3) !== '250') { fclose($socket); return false; }

    $write("DATA");
    $res = $read();
    if (substr($res, 0, 3) !== '354') { fclose($socket); return false; }

    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $encodedFromName = '=?UTF-8?B?' . base64_encode($fromName) . '?=';

    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "Content-Transfer-Encoding: base64\r\n";
    $headers .= "From: " . $encodedFromName . " <" . $smtpUser . ">\r\n";
    $headers .= "Reply-To: " . $smtpUser . "\r\n";
    $headers .= "To: <" . $to . ">\r\n";
    $headers .= "Subject: " . $encodedSubject . "\r\n";
    $headers .= "Date: " . date('r') . "\r\n";

    $body = chunk_split(base64_encode($htmlBody));

    $write($headers . "\r\n" . $body . "\r\n.");
    $res = $read();

    $write("QUIT");
    $read();
    fclose($socket);

    return (substr($res, 0, 3) === '250');
}

function send_fallback_mail($to, $subject, $htmlBody, $fromEmail, $fromName = 'MagyarÉkszer') {
    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $encodedFromName = '=?UTF-8?B?' . base64_encode($fromName) . '?=';

    $headers = [];
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: text/html; charset=UTF-8';
    $headers[] = 'Content-Transfer-Encoding: base64';
    $headers[] = 'From: ' . $encodedFromName . ' <' . $fromEmail . '>';
    $headers[] = 'Reply-To: ' . $fromEmail;
    $headers[] = 'X-Mailer: PHP/' . phpversion();

    $body = chunk_split(base64_encode($htmlBody));
    return @mail($to, $encodedSubject, $body, implode("\r\n", $headers));
}

function dispatch_order_email($to, $subject, $htmlBody, $smtpUser, $smtpPass, $fromName = 'MagyarÉkszer') {
    $sent = send_smtp_socket($to, $subject, $htmlBody, $smtpUser, $smtpPass, $fromName);
    if (!$sent) {
        $sent = send_fallback_mail($to, $subject, $htmlBody, $smtpUser, $fromName);
    }
    return $sent;
}

// Load products catalog as fallback lookup for SKU / weight if not passed
$productLookup = [];
$catalogFile = __DIR__ . '/../data/products.json';
if (file_exists($catalogFile)) {
    $catalogJson = json_decode(@file_get_contents($catalogFile), true);
    if (is_array($catalogJson)) {
        foreach ($catalogJson as $cp) {
            if (!empty($cp['id'])) {
                $productLookup[(string)$cp['id']] = $cp;
            }
        }
    }
}

// Generate items HTML rows with SKU, weight, customization, unit price & total
$itemRows = '';
if (!empty($order['items']) && is_array($order['items'])) {
    foreach ($order['items'] as $item) {
        $itemId = (string)($item['id'] ?? '');
        $catalogItem = $productLookup[$itemId] ?? null;

        $name = htmlspecialchars($item['name'] ?? '', ENT_QUOTES, 'UTF-8');
        $skuVal = trim($item['sku'] ?? ($catalogItem['sku'] ?? ''));
        $weightVal = trim($item['weight'] ?? ($catalogItem['weight'] ?? ''));
        $customVal = trim($item['selectedCustomization'] ?? '');

        $metaParts = [];
        if ($skuVal !== '') {
            $metaParts[] = '<span style="color:#c9a56a;font-weight:bold;">Cikkszám: ' . htmlspecialchars($skuVal, ENT_QUOTES, 'UTF-8') . '</span>';
        }
        if ($weightVal !== '') {
            $metaParts[] = 'Súly: ' . htmlspecialchars($weightVal, ENT_QUOTES, 'UTF-8');
        }
        $metaHtml = !empty($metaParts) ? '<div style="font-size:11px;color:#aaa;margin-top:3px;">' . implode(' &nbsp;|&nbsp; ', $metaParts) . '</div>' : '';
        $customHtml = $customVal !== '' ? '<div style="font-size:11px;color:#e5c78f;font-style:italic;margin-top:3px;">Opciók: ' . htmlspecialchars($customVal, ENT_QUOTES, 'UTF-8') . '</div>' : '';

        $qty = (int)($item['quantity'] ?? 1);
        $unitPrice = (float)($item['price'] ?? 0);
        $linePrice = formatPrice($unitPrice * $qty);

        $itemRows .= '<tr>'
            . '<td style="padding:10px 12px;border-bottom:1px solid #2a1f08;vertical-align:top;">'
            . '<div style="font-weight:bold;color:#fdfdf3;">' . $name . '</div>'
            . $metaHtml
            . $customHtml
            . '</td>'
            . '<td style="padding:10px 12px;border-bottom:1px solid #2a1f08;text-align:center;vertical-align:top;">' . $qty . ' db</td>'
            . '<td style="padding:10px 12px;border-bottom:1px solid #2a1f08;text-align:right;color:#c9a56a;font-weight:bold;vertical-align:top;white-space:nowrap;">' . $linePrice . '</td>'
            . '</tr>';
    }
}

$premiumBoxRow = '';
if (!empty($order['premiumBox'])) {
    $premiumBoxPrice = !empty($order['premiumBoxPrice']) ? (float)$order['premiumBoxPrice'] : 1500;
    $premiumBoxRow = '<tr><td style="padding:8px 12px;border-bottom:1px solid #2a1f08;">⭐ Prémium Díszdoboz</td><td style="padding:8px 12px;text-align:center;">1</td><td style="padding:8px 12px;text-align:right;color:#c9a56a;font-weight:bold;">+' . formatPrice($premiumBoxPrice) . '</td></tr>';
}

$fullName = htmlspecialchars($order['customerInfo']['fullName'] ?? 'Kedves Vásárló', ENT_QUOTES, 'UTF-8');
$customerEmail = trim($order['customerInfo']['email'] ?? '');
$customerPhone = htmlspecialchars($order['customerInfo']['phone'] ?? '-', ENT_QUOTES, 'UTF-8');
$shippingMethod = htmlspecialchars($order['shipping']['method'] ?? $order['shippingInfo']['method'] ?? '-', ENT_QUOTES, 'UTF-8');
$shipPostcode = trim($order['shipping']['postcode'] ?? $order['shippingInfo']['postcode'] ?? '');
$shipCity = trim($order['shipping']['city'] ?? $order['shippingInfo']['city'] ?? '');
$shipStreet = trim($order['shipping']['address'] ?? $order['shippingInfo']['address'] ?? '');

$isPickup = (($order['shippingType'] ?? $order['shipping']['type'] ?? $order['shippingInfo']['type'] ?? '') === 'local-pickup')
    || (stripos($shippingMethod, 'személyes') !== false)
    || (stripos($shippingMethod, 'üzlet') !== false)
    || (stripos($shippingMethod, 'pickup') !== false);

$deliveryTypeLabel = $isPickup
    ? 'SZEMÉLYES ÁTVÉTEL (Üzletben: 1056 Budapest, Molnár u. 23.)'
    : 'POSTÁZÁS / KISZÁLLÍTÁS (' . $shippingMethod . ')';

if ($isPickup) {
    $fullShippingAddress = 'Személyes átvétel az üzletben (1056 Budapest, Molnár u. 23.)';
} else {
    $prefix = trim($shipPostcode . ' ' . $shipCity);
    if (!empty($prefix) && stripos($shipStreet, $shipPostcode) === false) {
        $fullShippingAddress = trim($prefix . ', ' . $shipStreet, ', ');
    } else {
        $fullShippingAddress = !empty($shipStreet) ? $shipStreet : ($prefix ?: '-');
    }
}
$shippingAddress = htmlspecialchars($fullShippingAddress, ENT_QUOTES, 'UTF-8');

$billName = htmlspecialchars($order['billing']['name'] ?? $order['billingInfo']['name'] ?? $fullName, ENT_QUOTES, 'UTF-8');
$billPostcode = trim($order['billing']['postcode'] ?? $order['billingInfo']['postcode'] ?? '');
$billCity = trim($order['billing']['city'] ?? $order['billingInfo']['city'] ?? '');
$billStreet = trim($order['billing']['address'] ?? $order['billingInfo']['address'] ?? '');
$billTax = htmlspecialchars($order['billing']['taxNumber'] ?? $order['billingInfo']['taxNumber'] ?? '', ENT_QUOTES, 'UTF-8');
$fullBillingAddress = htmlspecialchars(trim(trim($billPostcode . ' ' . $billCity) . ', ' . $billStreet, ', ') ?: '-', ENT_QUOTES, 'UTF-8');

$paymentMethod = htmlspecialchars($order['paymentMethod'] ?? '-', ENT_QUOTES, 'UTF-8');
$orderComment = !empty($order['comment']) ? htmlspecialchars($order['comment'], ENT_QUOTES, 'UTF-8') : '';
$totalFormatted = formatPrice($order['total'] ?? 0);
$isBankTransfer = (stripos($paymentMethod, 'utal') !== false);

// 1. Store email body
$storeEmailHtml = '<!DOCTYPE html>
<html lang="hu">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0d0700;font-family:Georgia,serif;color:#fdfdf3;">
<div style="max-width:640px;margin:0 auto;padding:32px 16px;">
    <div style="background:#150e03;border:1px solid #c9a56a33;padding:40px 32px;border-radius:4px;">
        <div style="text-align:center;border-bottom:1px solid #c9a56a22;padding-bottom:24px;margin-bottom:32px;">
            <p style="color:#c9a56a;font-size:11px;letter-spacing:0.4em;text-transform:uppercase;margin:0 0 8px;">MagyarÉkszer</p>
            <h1 style="color:#fdfdf3;font-size:22px;margin:0;font-weight:normal;">🛒 Új rendelés érkezett!</h1>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#1a1005;border:1px solid #c9a56a22;">
            <tr style="background:#c9a56a11;">
                <th style="padding:10px 12px;text-align:left;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a56a;">Termék</th>
                <th style="padding:10px 12px;text-align:center;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a56a;">Db</th>
                <th style="padding:10px 12px;text-align:right;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a56a;">Ár</th>
            </tr>
            ' . $itemRows . '
            ' . $premiumBoxRow . '
        </table>

        <table style="width:100%;margin-bottom:32px;">
            ' . (!empty($order['id']) ? '<tr><td style="padding:4px 0;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Rendelés azonosító:</td><td style="padding:4px 0;text-align:right;font-size:12px;color:#fdfdf3;font-weight:bold;">' . htmlspecialchars($order['id'], ENT_QUOTES, 'UTF-8') . '</td></tr>' : '') . '
            <tr><td style="padding:4px 0;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Átvétel / Postázás:</td><td style="padding:4px 0;text-align:right;font-size:12px;color:#c9a56a;font-weight:bold;">' . $deliveryTypeLabel . '</td></tr>
            <tr><td style="padding:4px 0;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Szállítási díj:</td><td style="padding:4px 0;text-align:right;font-size:12px;">' . ((isset($order['shippingCost']) && (float)$order['shippingCost'] > 0) ? formatPrice($order['shippingCost']) : 'Díjtalan (0 Ft)') . '</td></tr>
            ' . (!empty($order['discountAmount']) && (float)$order['discountAmount'] > 0 ? '<tr><td style="padding:4px 0;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Kedvezmény' . (!empty($order['couponCode']) ? ' (' . htmlspecialchars($order['couponCode'], ENT_QUOTES, 'UTF-8') . ')' : '') . ':</td><td style="padding:4px 0;text-align:right;font-size:12px;color:#4ade80;font-weight:bold;">-' . formatPrice($order['discountAmount']) . '</td></tr>' : '') . '
            <tr><td colspan="2" style="border-top:1px solid #c9a56a22;padding-top:12px;"></td></tr>
            <tr><td style="padding:4px 0;color:#c9a56a;font-size:18px;font-weight:bold;letter-spacing:0.05em;">Összesen:</td><td style="padding:4px 0;text-align:right;color:#c9a56a;font-size:18px;font-weight:bold;">' . $totalFormatted . '</td></tr>
        </table>

        <div style="margin-bottom:16px;">
            <div style="background:#1a1005;border:1px solid #c9a56a44;padding:20px;border-radius:4px;margin-bottom:16px;">
                <p style="color:#c9a56a;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 10px;">Átvétel / Szállítás módja</p>
                <p style="margin:4px 0;font-size:15px;font-weight:bold;color:#fdfdf3;">' . $deliveryTypeLabel . '</p>
            </div>
            <div style="background:#1a1005;border:1px solid #c9a56a22;padding:20px;border-radius:4px;margin-bottom:16px;">
                <p style="color:#c9a56a;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 12px;">Vásárló adatai</p>
                <p style="margin:4px 0;font-size:13px;"><strong>' . $fullName . '</strong></p>
                <p style="margin:4px 0;font-size:13px;color:#999;">📧 ' . htmlspecialchars($customerEmail, ENT_QUOTES, 'UTF-8') . '</p>
                <p style="margin:4px 0;font-size:13px;color:#999;">📞 ' . $customerPhone . '</p>
            </div>
            <div style="background:#1a1005;border:1px solid #c9a56a22;padding:20px;border-radius:4px;margin-bottom:16px;">
                <p style="color:#c9a56a;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 12px;">' . ($isPickup ? 'Átvétel helye' : 'Szállítási / Postázási cím') . '</p>
                <p style="margin:4px 0;font-size:14px;font-weight:bold;">' . $shippingAddress . '</p>
            </div>
            <div style="background:#1a1005;border:1px solid #c9a56a22;padding:20px;border-radius:4px;margin-bottom:16px;">
                <p style="color:#c9a56a;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 12px;">Vevő címe / Számlázási adatok</p>
                <p style="margin:4px 0;font-size:13px;"><strong>' . $billName . '</strong></p>
                <p style="margin:4px 0;font-size:13px;">' . $fullBillingAddress . '</p>'
                . ($billTax !== '' ? '<p style="margin:4px 0;font-size:13px;color:#c9a56a;">Adószám: ' . $billTax . '</p>' : '') . '
            </div>
            <div style="background:#1a1005;border:1px solid #c9a56a22;padding:20px;border-radius:4px;margin-bottom:16px;">
                <p style="color:#c9a56a;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 12px;">Fizetési mód</p>
                <p style="margin:4px 0;font-size:13px;">' . $paymentMethod . '</p>
            </div>'
            . ($orderComment !== '' ? '<div style="background:#1a1005;border:1px solid #c9a56a22;padding:20px;border-radius:4px;"><p style="color:#c9a56a;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 12px;">Megjegyzés</p><p style="margin:4px 0;font-size:13px;font-style:italic;">' . $orderComment . '</p></div>' : '') . '
        </div>
    </div>
    <p style="text-align:center;color:#555;font-size:10px;margin-top:24px;letter-spacing:0.2em;text-transform:uppercase;">MagyarÉkszer • ' . $STORE_EMAIL . '</p>
</div>
</body>
</html>';

// 2. Customer email body
$transferBlock = '';
if ($isBankTransfer) {
    $transferBlock = '<div style="background:#c9a56a0d;border:1px solid #c9a56a33;padding:20px;border-radius:4px;margin-bottom:24px;">
        <p style="color:#c9a56a;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 12px;">Átutalás adatai</p>
        <p style="margin:4px 0;font-size:12px;">Kedvezményezett: <strong>MARTIN\'S BT.</strong></p>
        <p style="margin:4px 0;font-size:12px;">Bank: <strong>K&H Bank Zrt.</strong></p>
        <p style="margin:4px 0;font-size:12px;">Számlaszám: <strong style="color:#c9a56a;letter-spacing:0.1em;">10404089-50526774-52721009</strong></p>
        <p style="margin:16px 0 0;font-size:11px;color:#777;font-style:italic;">Kérjük, a közlemény rovatba írja be a nevét és telefonszámát az azonosításhoz.</p>
    </div>';
}

$manufacturingText = $isBankTransfer
    ? 'az <strong>utalás beérkezésétől számított <span style="color:#c9a56a;">10 munkanapon belül</span></strong>'
    : 'általában <strong style="color:#c9a56a;">10 munkanapon belül</strong>';

$customerEmailHtml = '<!DOCTYPE html>
<html lang="hu">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0d0700;font-family:Georgia,serif;color:#fdfdf3;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:#150e03;border:1px solid #c9a56a33;padding:40px 32px;border-radius:4px;">
        <div style="text-align:center;border-bottom:1px solid #c9a56a22;padding-bottom:32px;margin-bottom:32px;">
            <p style="color:#c9a56a;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;margin:0 0 12px;">MagyarÉkszer</p>
            <h1 style="color:#fdfdf3;font-size:24px;margin:0 0 8px;font-weight:normal;">Köszönjük a rendelését!</h1>
            <p style="color:#999;font-size:13px;margin:0;font-style:italic;">Rendelését sikeresen rögzítettük.</p>
        </div>

        <p style="font-size:14px;color:#fdfdf3;margin:0 0 24px;">Kedves <strong>' . $fullName . '</strong>!</p>
        <p style="font-size:13px;color:#aaa;line-height:1.8;margin:0 0 32px;">
            Örömmel értesítjük, hogy rendelését megkaptuk és hamarosan elkészítjük az Ön egyedi ékszerét. 
            Minden darabot kézzel, egyedileg készítünk el. A gyártási idő ' . $manufacturingText . ' valósul meg.
        </p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#1a1005;border:1px solid #c9a56a22;">
            <tr style="background:#c9a56a11;">
                <th style="padding:10px 12px;text-align:left;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a56a;">Termék</th>
                <th style="padding:10px 12px;text-align:center;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a56a;">Db</th>
                <th style="padding:10px 12px;text-align:right;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a56a;">Ár</th>
            </tr>
            ' . $itemRows . '
            ' . $premiumBoxRow . '
        </table>

        <table style="width:100%;margin-bottom:32px;">
            <tr><td style="padding:4px 0;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Szállítás:</td><td style="padding:4px 0;text-align:right;font-size:12px;">' . $shippingMethod . '</td></tr>
            <tr><td colspan="2" style="border-top:1px solid #c9a56a22;padding-top:12px;"></td></tr>
            <tr><td style="padding:4px 0;color:#c9a56a;font-size:18px;font-weight:bold;">Végösszeg:</td><td style="padding:4px 0;text-align:right;color:#c9a56a;font-size:18px;font-weight:bold;">' . $totalFormatted . '</td></tr>
        </table>

        ' . $transferBlock . '

        <div style="border-top:1px solid #c9a56a22;padding-top:24px;margin-top:8px;text-align:center;">
            <p style="color:#999;font-size:12px;margin:0 0 8px;">Kérdése van? Keressen minket:</p>
            <p style="color:#c9a56a;font-size:13px;margin:0 0 4px;">📞 +36 20 807 4841</p>
            <p style="color:#c9a56a;font-size:13px;margin:0;">📧 ' . $STORE_EMAIL . '</p>
            <p style="color:#555;font-size:11px;margin:16px 0 0;font-style:italic;">1056 Budapest, Molnár u. 23.</p>
        </div>
    </div>
    <p style="text-align:center;color:#444;font-size:10px;margin-top:24px;letter-spacing:0.2em;text-transform:uppercase;">© MagyarÉkszer • Tradicionális Magyar Ékszer</p>
</div>
</body>
</html>';

$dateStr = date('Y. m. d.');
$deliveryTag = $isPickup ? 'SZEMÉLYES ÁTVÉTEL' : 'POSTÁZÁS';
$storeSubject = "Új rendelés [{$deliveryTag}]: {$fullName} – {$dateStr}";
$customerSubject = 'Köszönjük rendelését! – MagyarÉkszer';

// 1. Dispatch to Store
$storeSent = dispatch_order_email($STORE_EMAIL, $storeSubject, $storeEmailHtml, $GMAIL_USER, $GMAIL_APP_PASSWORD, "MagyarÉkszer Webshop");

// 2. Dispatch to Customer
$customerSent = false;
if (!empty($customerEmail) && filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
    $customerSent = dispatch_order_email($customerEmail, $customerSubject, $customerEmailHtml, $GMAIL_USER, $GMAIL_APP_PASSWORD, "MagyarÉkszer");
}

// 3. Save order record to persistent orders.json
$ordersFile = __DIR__ . '/orders.json';
$existingOrders = [];
if (file_exists($ordersFile)) {
    $content = @file_get_contents($ordersFile);
    if (!empty($content)) {
        $existingOrders = json_decode($content, true) ?: [];
    }
}

$orderId = !empty($order['id']) ? $order['id'] : ('ORD-' . date('Ymd-His') . '-' . rand(100, 999));
$orderRecord = [
    'id' => $orderId,
    'date' => date('c'),
    'items' => $order['items'] ?? [],
    'total' => (float)($order['total'] ?? 0),
    'status' => 'pending', // pending, shipped, delivered
    'paymentMethod' => $paymentMethod,
    'paymentStatus' => $isBankTransfer ? 'pending' : 'cash_on_delivery', // pending, paid, cash_on_delivery
    'paidAt' => null,
    'paidVia' => null,
    'customerInfo' => [
        'fullName' => $fullName,
        'email' => $customerEmail,
        'phone' => $customerPhone
    ],
    'shippingType' => $order['shippingType'] ?? $order['shipping']['type'] ?? (stripos($shippingMethod, 'személyes') !== false || stripos($shippingMethod, 'üzlet') !== false || stripos($shippingMethod, 'pickup') !== false ? 'local-pickup' : 'delivery'),
    'shippingInfo' => [
        'address' => $shippingAddress,
        'method' => $shippingMethod,
        'type' => $order['shippingType'] ?? $order['shipping']['type'] ?? (stripos($shippingMethod, 'személyes') !== false || stripos($shippingMethod, 'üzlet') !== false || stripos($shippingMethod, 'pickup') !== false ? 'local-pickup' : 'delivery'),
        'postcode' => $order['shippingInfo']['postcode'] ?? $order['shipping']['postcode'] ?? '',
        'city' => $order['shippingInfo']['city'] ?? $order['shipping']['city'] ?? ''
    ],
    'billingInfo' => $order['billingInfo'] ?? $order['billing'] ?? [
        'name' => $fullName,
        'address' => $shippingAddress,
        'isCompany' => false
    ],
    'comment' => $orderComment,
    'premiumBox' => !empty($order['premiumBox']),
    'premiumBoxPrice' => $order['premiumBoxPrice'] ?? 1500
];

array_unshift($existingOrders, $orderRecord);
@file_put_contents($ordersFile, json_encode($existingOrders, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

echo json_encode([
    'success' => true,
    'orderId' => $orderId,
    'storeSent' => $storeSent,
    'customerSent' => $customerSent
]);
