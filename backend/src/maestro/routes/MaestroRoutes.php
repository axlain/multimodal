<?php
use App\Middleware\AuthMiddleware;
use App\Maestro\Controllers\MaestroController;

$path   = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
$method = $_SERVER['REQUEST_METHOD'];

try {
    // 🔒 todas estas rutas requieren token
    $payload = AuthMiddleware::verificarToken();
    $usr = $payload['usr'] ?? null;

    if ($method === 'POST' && $path === '/api/sitev/maestro/crear') {
        MaestroController::crear($usr);

    } elseif ($method === 'PUT' && $path === '/api/sitev/maestro/editar') {
        MaestroController::editar($usr);

    } elseif ($method === 'DELETE' && $path === '/api/sitev/maestro/eliminar') {
        MaestroController::eliminar($usr);

    } elseif ($method === 'GET' && $path === '/api/sitev/maestro/buscar') {
        MaestroController::buscar($usr);   // ?q=

    } elseif ($method === 'GET' && $path === '/api/sitev/maestro/todos') {
        MaestroController::todos($usr);

    } elseif ($method === 'GET' && $path === '/api/sitev/maestro/detalle') {
        MaestroController::detalle($usr);  // ?id=

    } else {
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Ruta no encontrada en maestro'], JSON_UNESCAPED_UNICODE);
    }
} catch (\RuntimeException $ex) {
    http_response_code($ex->getCode() ?: 401);
    echo json_encode(['ok' => false, 'error' => $ex->getMessage()], JSON_UNESCAPED_UNICODE);
}
