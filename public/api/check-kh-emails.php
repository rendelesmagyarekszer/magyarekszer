<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$GMAIL_USER = 'magyarekszer@gmail.com';
$GMAIL_APP_PASSWORD = 'ryiuydrxvpinayoa';
$ordersFile = __DIR__ . '/orders.json';

function getOrders($file) {
    if (!file_exists($file)) return [];
    $c = @file_get_contents($file);
    if (empty($c)) return [];
    $d = json_decode($c, true);
    return is_array($d) ? $d : [];
}

function saveOrders($file, $orders) {
    return @file_put_contents($file, json_encode($orders, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

// Function to fetch emails via standard IMAP extension
function fetch_kh_emails_imap($user, $pass) {
    if (!function_exists('imap_open')) return null;

    $mbox = @imap_open('{imap.gmail.com:993/imap/ssl}INBOX', $user, $pass);
    if (!$mbox) return null;

    // Search for emails from K&H or with credit/transfer subjects
    $msgIds = @imap_search($mbox, 'UNSEEN FROM "kh.hu"');
    if (!$msgIds) {
        $msgIds = @imap_search($mbox, 'FROM "kh.hu"');
    }
    if (!$msgIds) {
        // Fallback: search for emails with "K&H" in subject received recently
        $msgIds = @imap_search($mbox, 'SINCE "' . date('j-M-Y', strtotime('-7 days')) . '"');
    }

    $emails = [];
    if (!empty($msgIds)) {
        // Limit to most recent 20 emails
        $msgIds = array_slice(array_reverse($msgIds), 0, 20);
        foreach ($msgIds as $id) {
            $header = @imap_headerinfo($mbox, $id);
            $subject = isset($header->subject) ? @imap_utf8($header->subject) : '';
            $from = isset($header->fromaddress) ? $header->fromaddress : '';
            $body = @imap_body($mbox, $id);

            $emails[] = [
                'subject' => $subject,
                'from' => $from,
                'body' => $body,
                'date' => isset($header->date) ? $header->date : ''
            ];
        }
    }
    @imap_close($mbox);
    return $emails;
}

// Fallback: Function to fetch emails via raw SSL socket
function fetch_kh_emails_socket($user, $pass) {
    $timeout = 10;
    $fp = @fsockopen('ssl://imap.gmail.com', 993, $errno, $errstr, $timeout);
    if (!$fp) return [];

    $read = function() use ($fp) {
        $out = '';
        while ($line = fgets($fp, 2048)) {
            $out .= $line;
            if (preg_match('/^TAG\d+ (OK|NO|BAD)/i', $line)) break;
        }
        return $out;
    };

    $write = function($tag, $cmd) use ($fp) {
        fputs($fp, "{$tag} {$cmd}\r\n");
    };

    fgets($fp, 1024); // Greeting

    $write('TAG1', "LOGIN \"{$user}\" \"{$pass}\"");
    $res = $read();
    if (strpos($res, 'TAG1 OK') === false) {
        @fclose($fp);
        return [];
    }

    $write('TAG2', 'SELECT INBOX');
    $res = $read();

    $write('TAG3', 'SEARCH UNSEEN FROM "kh.hu"');
    $res = $read();

    // Parse search results
    preg_match('/\* SEARCH (.*)/i', $res, $matches);
    $ids = [];
    if (!empty($matches[1])) {
        $ids = array_filter(explode(' ', trim($matches[1])));
    }

    if (empty($ids)) {
        // Search recent emails
        $write('TAG4', 'SEARCH SINCE "' . date('j-M-Y', strtotime('-7 days')) . '"');
        $res = $read();
        preg_match('/\* SEARCH (.*)/i', $res, $matches);
        if (!empty($matches[1])) {
            $ids = array_filter(explode(' ', trim($matches[1])));
        }
    }

    $emails = [];
    $ids = array_slice(array_reverse($ids), 0, 15);

    $i = 10;
    foreach ($ids as $id) {
        $tag = 'TAG' . (++$i);
        $write($tag, "FETCH {$id} (BODY[HEADER.FIELDS (SUBJECT FROM DATE)] BODY[TEXT])");
        $body = $read();

        $emails[] = [
            'raw' => $body,
            'subject' => '',
            'from' => '',
            'body' => $body
        ];
    }

    $write('TAG99', 'LOGOUT');
    $read();
    @fclose($fp);

    return $emails;
}

// Parse K&H notification text
function parse_kh_transfer($text) {
    // 1. Extract amount
    // K&H format example: "Jóváírás: 25 000 HUF" or "Összeg: 25.000,00 Ft" or "Összeg: 25000 HUF"
    $amount = 0;
    if (preg_match('/(?:összeg|osszeg|jóváírás|jovairas|érték|ertek)[^\d]*([\d\s\.\,]+)\s*(?:HUF|Ft|forint)/iu', $text, $m)) {
        $clean = preg_replace('/[^\d]/', '', explode(',', $m[1])[0]);
        $amount = (float)$clean;
    } else if (preg_match('/([\d\s]{2,})\s*(?:HUF|Ft)/i', $text, $m)) {
        $clean = preg_replace('/[^\d]/', '', $m[1]);
        $amount = (float)$clean;
    }

    // 2. Extract sender partner
    $sender = '';
    if (preg_match('/(?:partner|megbízó|megbizo|feladó|felado)[^\:\n]*\:\s*([^\r\n<]+)/iu', $text, $m)) {
        $sender = trim($m[1]);
    }

    // 3. Extract remark / közlemény
    $reference = '';
    if (preg_match('/(?:közlemény|kozlemeny|megjegyzés|megjegyzes)[^\:\n]*\:\s*([^\r\n<]+)/iu', $text, $m)) {
        $reference = trim($m[1]);
    }

    return [
        'amount' => $amount,
        'sender' => $sender,
        'reference' => $reference
    ];
}

$orders = getOrders($ordersFile);
$matchedOrders = [];
$checkedEmails = 0;

// Check if simulated/manual test data was sent in POST
$rawInput = file_get_contents('php://input');
$postData = json_decode($rawInput, true);

$transfers = [];

if (!empty($postData['testTransfer'])) {
    $transfers[] = [
        'amount' => (float)($postData['testTransfer']['amount'] ?? 0),
        'sender' => $postData['testTransfer']['sender'] ?? '',
        'reference' => $postData['testTransfer']['reference'] ?? ''
    ];
} else {
    // Attempt real email fetch
    $emails = fetch_kh_emails_imap($GMAIL_USER, $GMAIL_APP_PASSWORD);
    if ($emails === null) {
        $emails = fetch_kh_emails_socket($GMAIL_USER, $GMAIL_APP_PASSWORD);
    }

    $checkedEmails = count($emails);

    foreach ($emails as $em) {
        $content = ($em['subject'] ?? '') . ' ' . ($em['body'] ?? '') . ' ' . ($em['raw'] ?? '');
        $parsed = parse_kh_transfer($content);
        if ($parsed['amount'] > 0) {
            $transfers[] = $parsed;
        }
    }
}

// Match extracted bank transfers with pending orders
$hasChanges = false;
foreach ($transfers as $tr) {
    if ($tr['amount'] <= 0) continue;

    foreach ($orders as &$order) {
        // Only match bank transfer orders that are still pending
        if (($order['paymentStatus'] ?? '') === 'pending' || (empty($order['paymentStatus']) && stripos($order['paymentMethod'] ?? '', 'utal') !== false)) {
            $orderTotal = (float)($order['total'] ?? 0);

            // Check if amount matches
            if (abs($orderTotal - $tr['amount']) <= 1) {
                $custName = mb_strtolower($order['customerInfo']['fullName'] ?? '', 'UTF-8');
                $senderName = mb_strtolower($tr['sender'], 'UTF-8');
                $ref = mb_strtolower($tr['reference'], 'UTF-8');
                $orderId = mb_strtolower($order['id'] ?? '', 'UTF-8');
                $phone = preg_replace('/[^\d]/', '', $order['customerInfo']['phone'] ?? '');

                // Check match criteria:
                // 1. Order ID appears in reference
                // 2. Customer name matches sender
                // 3. Customer name appears in reference
                // 4. Customer phone appears in reference
                $nameParts = array_filter(explode(' ', $custName), function($p) { return mb_strlen($p) > 2; });
                $nameMatches = false;
                foreach ($nameParts as $part) {
                    if (strpos($senderName, $part) !== false || strpos($ref, $part) !== false) {
                        $nameMatches = true;
                        break;
                    }
                }

                $idMatches = (!empty($orderId) && strpos($ref, $orderId) !== false);
                $phoneMatches = (!empty($phone) && strlen($phone) >= 7 && strpos($ref, $phone) !== false);

                // If exact amount matches and at least one identifier matches (or single pending order with this exact amount)
                if ($nameMatches || $idMatches || $phoneMatches || empty($tr['sender'])) {
                    $order['paymentStatus'] = 'paid';
                    $order['paidAt'] = date('Y-m-d H:i:s');
                    $order['paidVia'] = 'K&H Bank jóváírás' . (!empty($tr['sender']) ? " ({$tr['sender']})" : '');
                    $matchedOrders[] = [
                        'orderId' => $order['id'],
                        'customer' => $order['customerInfo']['fullName'] ?? '',
                        'amount' => $orderTotal,
                        'sender' => $tr['sender']
                    ];
                    $hasChanges = true;
                    break;
                }
            }
        }
    }
}

if ($hasChanges) {
    saveOrders($ordersFile, $orders);
}

echo json_encode([
    'success' => true,
    'checkedEmails' => $checkedEmails,
    'detectedTransfers' => count($transfers),
    'matchedOrders' => $matchedOrders,
    'matchedCount' => count($matchedOrders),
    'message' => count($matchedOrders) > 0 
        ? (count($matchedOrders) . ' db utalás sikeresen jóváírva és azonosítva!')
        : 'Az ellenőrzés lefutott. Nincs új azonosítható K&H jóváírás.'
], JSON_UNESCAPED_UNICODE);
