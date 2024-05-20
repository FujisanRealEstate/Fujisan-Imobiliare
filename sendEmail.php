<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $message = $_POST['message'];

    $to = 'fujisanimobiliare@gmail.com';
    $subject = 'Mesaj nou de la ' . $name;
    $body = "Nume: $name\n";
    $body .= "E-mail: $email\n";
    $body .= "Mesaj:\n$message";

    $headers = "From: $email";

    if (mail($to, $subject, $body, $headers)) {
        http_response_code(200); // Răspuns OK către JavaScript
    } else {
        http_response_code(500); // Eroare server
        echo "Eroare la trimiterea e-mailului: " . error_get_last()['message'];
    }
} else {
    http_response_code(403); // Interzis accesul direct
}
?>
