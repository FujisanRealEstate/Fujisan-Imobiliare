<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nume = $_POST['nume'];
    $email = $_POST['email'];
    $continut = $_POST['continut'];

    // Adresa de email către care trimiți mesajul
    $to = "fujisanimobiliare@gmail.com";

    // Subiectul mesajului
    $subject = "Mesaj nou de la $nume";

    // Construiește conținutul mesajului
    $message = "Nume: $nume\n";
    $message .= "Email: $email\n";
    $message .= "Mesaj:\n$continut";

    // Setează antetele emailului
    $headers = "From: $email";

    // Trimite emailul
    if (mail($to, $subject, $message, $headers)) {
        echo "Mesajul a fost trimis cu succes!";
    } else {
        echo "Eroare la trimiterea mesajului. Vă rugăm încercați din nou.";
    }
}
?>