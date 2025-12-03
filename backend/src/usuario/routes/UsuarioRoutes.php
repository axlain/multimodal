<?php
use App\Usuario\Controllers\UsuarioController;
use App\Middleware\AuthMiddleware;

$path   = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
$method = $_SERVER['REQUEST_METHOD'];

// 🔓 público
if ($method === 'POST' && $path === '/api/sitev/usuario/login') {
    UsuarioController::login(); // debe devolver { ok, token, user }
    return;
}

try {
    // 🔒 desde aquí, todo requiere token
    $payload = AuthMiddleware::verificarToken();
    $usr = $payload['usr'] ?? null;

    if ($method === "GET"  && $path === '/api/sitev/usuario/obtenerTodos') {
        UsuarioController::index($usr);

    } elseif ($method === 'POST' && $path === '/api/sitev/usuario/crear') {
        UsuarioController::crearUsuario($usr);

    } elseif ($method === 'POST' && $path === '/api/sitev/usuario/registrar') {
        UsuarioController::registrar($usr);

    } elseif ($method === 'GET'  && $path === '/api/sitev/usuario/buscar') {
        UsuarioController::buscar($usr);

    } elseif ($method === 'PUT'  && $path === '/api/sitev/usuario/editar') {
        UsuarioController::editar($usr);

    } elseif ($method === 'DELETE' && $path === '/api/sitev/usuario/eliminar') {
        UsuarioController::eliminar($usr);

    } elseif ($method === 'GET'  && $path === '/api/sitev/usuario/mostrarNombre') {
        UsuarioController::mostrarNombre($usr); // ?id_usuario=

    } elseif ($method === 'PUT'  && $path === '/api/sitev/usuario/cambiarPassword') {
        UsuarioController::cambiarPassword($usr);

    } elseif ($method === 'GET'  && $path === '/api/sitev/usuario/me') {
        UsuarioController::me($usr); // opcional: devuelve el usuario del token

    } else {
        http_response_code(404);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok'=>false,'error'=>'Ruta no encontrada'], JSON_UNESCAPED_UNICODE);
    }
} catch (\RuntimeException $ex) {
    http_response_code($ex->getCode() ?: 401);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok'=>false,'error'=>$ex->getMessage()], JSON_UNESCAPED_UNICODE);
}
