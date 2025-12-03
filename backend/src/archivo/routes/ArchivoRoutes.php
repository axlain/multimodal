<?php
use App\Middleware\AuthMiddleware;
use App\Archivo\Controllers\ArchivoController;

$path   = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
$method = $_SERVER['REQUEST_METHOD'];

try {
    // 🔒 protege la subida con JWT (si quieres que sea pública, quita estas 2 líneas)
    $payload = AuthMiddleware::verificarToken();
    $usr = $payload['usr'] ?? null;

    if ($method === 'POST' && $path === '/api/sitev/archivo/subir') {
        // Debe leer $_FILES['file'] y responder { ok, id_archivo, url, filename, mime, size }
        ArchivoController::subir($usr);
    } else {
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Ruta no encontrada']);
    }
} catch (\RuntimeException $ex) {
    http_response_code($ex->getCode() ?: 401);
    echo json_encode(['ok' => false, 'error' => $ex->getMessage()]);
}
