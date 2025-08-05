<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// ImageKit configuration
$imageKitConfig = [
    'publicKey' => 'public_UFJStOhYLxOl6tm4ku61BDsF+uo=',
    'privateKey' => 'private_9V1gOW/GUOzJOSpFoTu8pPoi7MY=',
    'urlEndpoint' => 'https://ik.imagekit.io/biihsnqf1'
];

try {
    // Check if file was uploaded
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('No file uploaded or upload error');
    }

    $file = $_FILES['file'];
    $fileName = $_POST['fileName'] ?? 'upload_' . time();
    $folder = $_POST['folder'] ?? '/fujisan-offers';

    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowedTypes)) {
        throw new Exception('Invalid file type. Only images are allowed.');
    }

    // Validate file size (max 10MB)
    if ($file['size'] > 10 * 1024 * 1024) {
        throw new Exception('File too large. Maximum size is 10MB.');
    }

    // Prepare form data for ImageKit
    $formData = [
        'file' => new CURLFile($file['tmp_name'], $file['type'], $file['name']),
        'publicKey' => $imageKitConfig['publicKey'],
        'privateKey' => $imageKitConfig['privateKey'],
        'fileName' => $fileName,
        'useUniqueFileName' => 'true',
        'folder' => $folder
    ];

    // Upload to ImageKit
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://upload.imagekit.io/api/v1/files/upload');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $formData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        throw new Exception('ImageKit upload failed: ' . $response);
    }

    $result = json_decode($response, true);
    
    if (!$result || !isset($result['url'])) {
        throw new Exception('Invalid response from ImageKit');
    }

    // Return success response
    echo json_encode([
        'success' => true,
        'url' => $result['url'],
        'fileId' => $result['fileId'] ?? null,
        'fileName' => $fileName
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 