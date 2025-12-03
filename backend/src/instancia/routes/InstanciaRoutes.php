<?php
// src/instancia/routes/InstanciaRoutes.php
use App\Middleware\AuthMiddleware;
use App\Instancia\Controllers\InstanciaController;

$path   = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
$method = $_SERVER['REQUEST_METHOD'];

try {
    // 🔒 Todas estas rutas requieren JWT
    $payload = AuthMiddleware::verificarToken();
    $usr = $payload['usr'] ?? null; // ['id_usuario','nombre','correo','rol', ...]

    // 🧱 Crear instancia
    if ($method === 'POST' && $path === '/api/sitev/instancia/crear') {
        InstanciaController::crear($usr);
        return;
    }

    // 🧱 Detalle de instancia
    if ($method === 'GET' && $path === '/api/sitev/instancia/detalle') {
        InstanciaController::detalle($usr);
        return;
    }

    // 🧱 Llenar datos de instancia
    if ($method === 'POST' && $path === '/api/sitev/instancia/llenar') {
        InstanciaController::llenar($usr);
        return;
    }

    // 🧱 Buscar instancia
    if ($method === 'GET' && $path === '/api/sitev/instancia/buscar') {
        InstanciaController::buscar($usr);
        return;
    }

    // 🧱 Mis instancias (según token)
    if ($method === 'GET' && $path === '/api/sitev/instancia/mis') {
        InstanciaController::mis($usr);
        return;
    }

    // 🧱 Instancias de un trámite específico
    if ($method === 'GET' && $path === '/api/sitev/instancia/porTramite') {
        InstanciaController::porTramite($usr);
        return;
    }

    // 🧱 Listar todas (admin)
    if ($method === 'GET' && $path === '/api/sitev/instancias') {
        InstanciaController::listar($usr);
        return;
    }

    // ✅ NUEVA RUTA: historial del usuario autenticado
    if ($method === 'GET' && $path === '/api/sitev/instancia/porUsuario') {
        InstanciaController::porUsuario($usr);
        return;
    }

    // ✅ Ruta para finalizar una instancia
    if ($method === 'POST' && $path === '/api/sitev/instancia/finalizar') {
        InstanciaController::finalizar($usr);
        return;
    }

    // ❌ Si ninguna coincide
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'Ruta no encontrada']);

} catch (\RuntimeException $ex) {
    http_response_code($ex->getCode() ?: 401);
    echo json_encode(['ok' => false, 'error' => $ex->getMessage()]);
}
