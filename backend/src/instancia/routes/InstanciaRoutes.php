<?php
use App\Instancia\Controllers\InstanciaController;
$request_uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_method = $_SERVER['REQUEST_METHOD'];
// --- Instancias de trámite ---
if ($request_method === "POST" && $request_uri === '/api/sitev/instancia/crear') {
    InstanciaController::crear(); // Body: { id_tramite, maestro_nombre }
} elseif ($request_method === "GET" && $request_uri === '/api/sitev/instancia/detalle') {
    InstanciaController::detalle(); // ?id=ID_INSTANCIA
} elseif ($request_method === "POST" && $request_uri === '/api/sitev/instancia/llenar') {
    InstanciaController::llenar();  // Body: { id_instancia, id_requisito, valor }
} elseif ($request_method === "GET" && $request_uri === '/api/sitev/instancia/buscar') {
    InstanciaController::buscar();  // ?q=Nombre Maestro
} elseif ($request_method === "GET" && $request_uri === '/api/sitev/instancia/mis') {
    InstanciaController::mis();     // instancias del usuario autenticado
}elseif ($request_method === "GET" && $request_uri === '/api/sitev/instancia/porTramite') {
    InstanciaController::porTramite(); // ?id_tramite=...
}

