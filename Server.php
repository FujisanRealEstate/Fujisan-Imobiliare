<?php
// Simulăm filtrarea datelor pe server
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $rooms = $_GET['rooms'];
    $floor = $_GET['floor'];
    $location = $_GET['location'];

    // Aici poți să-ți implementezi logica reală de filtrare pe baza parametrilor primiți
    // De exemplu, poți accesa o bază de date și să selectezi anunțurile imobiliare corespunzătoare
    // În acest exemplu, returnăm doar un array simplu de rezultate simulate
    $results = array(
        'Location' => $location,
        'Rooms' => $rooms,
        'Floor' => $floor
    );

    // Returnăm rezultatele sub formă de JSON
    header('Content-Type: application/json');
    echo json_encode($results);
}
?>
