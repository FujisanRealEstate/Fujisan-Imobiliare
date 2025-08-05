<?php
$ip = $_SERVER['REMOTE_ADDR'];
$date = date("Y-m-d");
$logFile = "visits.log";
$counterFile = "counter.txt";

$alreadyCounted = false;

// Citește toate intrările din fișierul visits.log
if (file_exists($logFile)) {
    $lines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        list($loggedIp, $loggedDate) = explode('|', $line);
        if ($loggedIp == $ip && $loggedDate == $date) {
            $alreadyCounted = true;
            break;
        }
    }
}

// Dacă nu a mai fost numărat azi, crește contorul
if (!$alreadyCounted) {
    $count = file_exists($counterFile) ? (int)file_get_contents($counterFile) : 0;
    $count++;
    file_put_contents($counterFile, $count);
    file_put_contents($logFile, "$ip|$date\n", FILE_APPEND);
} else {
    // Dacă a fost deja contorizat azi, doar afișează valoarea
    $count = file_exists($counterFile) ? file_get_contents($counterFile) : 0;
}

echo "Acest site a fost vizitat de $count persoane unice azi.";
?>
