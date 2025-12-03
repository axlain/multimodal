<?php
use App\Middleware\AuthMiddleware;
use App\Escuela\Controllers\EscuelaController;

$path   = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
$method = $_SERVER['REQUEST_METHOD'];

try {
    // 🔒 todas estas rutas requieren token
    $payload = AuthMiddleware::verificarToken();
    $usr = $payload['usr'] ?? null;

    if ($method === 'POST' && $path === '/api/sitev/escuela/crear') {
        EscuelaController::crear($usr);

    } elseif ($method === 'PUT' && $path === '/api/sitev/escuela/editar') {
        EscuelaController::editar($usr);

    } elseif ($method === 'DELETE' && $path === '/api/sitev/escuela/eliminar') {
        EscuelaController::eliminar($usr);

    } elseif ($method === 'GET' && $path === '/api/sitev/escuela/buscar') {
        EscuelaController::buscar($usr);   // ?q=

    } elseif ($method === 'GET' && $path === '/api/sitev/escuela/todos') {
        EscuelaController::todos($usr);

    } elseif ($method === 'GET' && $path === '/api/sitev/escuela/detalle') {
        EscuelaController::detalle($usr);  // ?id=

    } elseif ($method === 'GET' && $path === '/api/sitev/escuela/porClave') {
        EscuelaController::porClave($usr); // ?clave=

    } else {
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Ruta no encontrada en escuela'], JSON_UNESCAPED_UNICODE);
    }
} catch (\RuntimeException $ex) {
    http_response_code($ex->getCode() ?: 401);
    echo json_encode(['ok' => false, 'error' => $ex->getMessage()], JSON_UNESCAPED_UNICODE);
}
