<?php
use App\Middleware\AuthMiddleware;
use App\Area\Controllers\AreaController;

$path   = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
$method = $_SERVER['REQUEST_METHOD'];

try {
    // 🔒 Todas estas rutas requieren token. Si alguna debe ser pública, muévela ANTES de este try/catch.
    $payload = AuthMiddleware::verificarToken();
    $usr = $payload['usr'] ?? null;

    if ($method === 'GET' && $path === '/api/sitev/area/obtenerTodas') {
        AreaController::index($usr); // listar todas
    } elseif ($method === 'POST' && $path === '/api/sitev/area/crear') {
        AreaController::crear($usr);
    } elseif ($method === 'GET' && $path === '/api/sitev/area/buscar') {
        AreaController::buscar($usr); // ?q=
    } elseif ($method === 'PUT' && $path === '/api/sitev/area/editar') {
        AreaController::editar($usr);
    } elseif ($method === 'DELETE' && $path === '/api/sitev/area/eliminar') {
        AreaController::eliminar($usr);
    } elseif ($method === 'GET' && $path === '/api/sitev/area/mostrarNombre') {
        AreaController::mostrarNombre($usr); // ?id_area=
    } elseif ($method === 'GET' && $path === '/api/sitev/area/usuarios') {
        AreaController::usuarios($usr); // usuarios por área
    } elseif ($method === 'GET' && $path === '/api/sitev/area/tramites') {
        AreaController::tramites($usr); // trámites por área
    } elseif ($method === 'GET' && $path === '/api/sitev/area/obtenerAreaPorUsuario') {
        AreaController::obtenerAreaPorUsuario($usr); // usa $usr del token
    } else {
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Ruta no encontrada']);
    }
} catch (\RuntimeException $ex) {
    http_response_code($ex->getCode() ?: 401);
    echo json_encode(['ok' => false, 'error' => $ex->getMessage()]);
}
