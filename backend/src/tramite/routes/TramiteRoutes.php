<?php
use App\Middleware\AuthMiddleware;
use App\Tramite\Controllers\TramiteController;
use App\Tramite\Controllers\RequisitoController;
use App\Tramite\Controllers\ConstanciaController; // opcional si luego usas un controlador separado

// Obtener info de la petición
$request_uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_method = $_SERVER['REQUEST_METHOD'];

try {
    // 🔒 Verificar token JWT para todas las rutas
    $payload = AuthMiddleware::verificarToken();
    $usr = $payload['usr'] ?? null;

    // --- RUTAS PARA TRÁMITES ---
    if ($request_method === "POST" && $request_uri === '/api/sitev/tramite/crear') {
        TramiteController::crear($usr);

    } elseif ($request_method === "PUT" && $request_uri === '/api/sitev/tramite/editar') {
        TramiteController::editar($usr);

    } elseif ($request_method === "DELETE" && $request_uri === '/api/sitev/tramite/eliminar') {
        TramiteController::eliminar($usr);

    } elseif ($request_method === "GET" && $request_uri === '/api/sitev/tramite/buscar') {
        TramiteController::buscar($usr);

    } elseif ($request_method === "GET" && $request_uri === '/api/sitev/tramite/todos') {
        TramiteController::todos($usr);

    } elseif ($request_method === "GET" && $request_uri === '/api/sitev/tramite/porArea') {
        TramiteController::porArea($usr);

    // ✅ NUEVA RUTA: generar constancia Word
    } elseif ($request_method === "GET" && preg_match('/^\/api\/sitev\/tramite\/constancia\/(\d+)$/', $request_uri, $m)) {
        (new TramiteController())->generarConstancia((int)$m[1]);
    }
    elseif ($request_method === 'GET' && preg_match('/^\/api\/sitev\/tramite\/constancia\/descargar\/(\d+)$/', $request_uri, $m)) {
        (new TramiteController())->descargarConstancia((int)$m[1]);

    // --- RUTAS PARA REQUISITOS ---
    } elseif ($request_method === "POST" && $request_uri === '/api/sitev/requisito/agregar') {
        RequisitoController::agregar($usr);

    } elseif ($request_method === "PUT" && $request_uri === '/api/sitev/requisito/editar') {
        RequisitoController::editar($usr);

    } elseif ($request_method === "DELETE" && $request_uri === '/api/sitev/requisito/eliminar') {
        RequisitoController::eliminar($usr);

    } elseif ($request_method === "POST" && $request_uri === '/api/sitev/requisito/llenar') {
        RequisitoController::llenar($usr);

    } elseif ($request_method === "GET" && $request_uri === '/api/sitev/requisito/porTramite') {
        RequisitoController::porTramite($usr);

    // --- SI NINGUNA RUTA COINCIDE ---
    } else {
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Ruta no encontrada']);
    }

} catch (\RuntimeException $ex) {
    http_response_code($ex->getCode() ?: 401);
    echo json_encode(['ok' => false, 'error' => $ex->getMessage()]);
}
