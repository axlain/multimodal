<?php
use App\Tramite\Controllers\TramiteController;
use App\Tramite\Controllers\RequisitoController;

$request_uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_method = $_SERVER['REQUEST_METHOD'];

// Rutas para Tramites
if ($request_method === "POST" && $request_uri === '/api/sitev/tramite/crear') {
    TramiteController::crear();
} elseif ($request_method === "PUT" && $request_uri === '/api/sitev/tramite/editar') {
    TramiteController::editar();
} elseif ($request_method === "DELETE" && $request_uri === '/api/sitev/tramite/eliminar') {
    TramiteController::eliminar();
} elseif ($request_method === "GET" && $request_uri === '/api/sitev/tramite/buscar') {
    TramiteController::buscar();
} elseif ($request_method === "GET" && $request_uri === '/api/sitev/tramite/todos') {
    TramiteController::todos();
} elseif ($request_method === "GET" && $request_uri === '/api/sitev/tramite/porArea') {
    TramiteController::porArea();
}

// Rutas para Requisitos
elseif ($request_method === "POST" && $request_uri === '/api/sitev/requisito/agregar') {
    RequisitoController::agregar();  // Agregar un nuevo requisito a un trámite
} elseif ($request_method === "PUT" && $request_uri === '/api/sitev/requisito/editar') {
    RequisitoController::editar();  // Editar un requisito existente
} elseif ($request_method === "DELETE" && $request_uri === '/api/sitev/requisito/eliminar') {
    RequisitoController::eliminar();  // Eliminar un requisito
} elseif ($request_method === "POST" && $request_uri === '/api/sitev/requisito/llenar') {
    RequisitoController::llenar();  // Llenar un requisito con un valor específico
} elseif ($request_method === "GET" && $request_uri === '/api/sitev/requisito/porTramite') {
    RequisitoController::porTramite();  // Ver todos los requisitos por un trámite
}
