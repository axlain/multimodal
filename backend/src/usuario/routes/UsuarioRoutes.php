<?php
use App\Usuario\Controllers\UsuarioController;

$request_uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_method = $_SERVER['REQUEST_METHOD'];

if ($request_method === "GET"  && $request_uri === '/api/sitev/usuario/obtenerTodos') {
    UsuarioController::index();
} elseif ($request_method === 'POST' && $request_uri === '/api/sitev/usuario/crear') {
    UsuarioController::crearUsuario();
} elseif ($request_method === 'POST' && $request_uri === '/api/sitev/usuario/registrar') {
    UsuarioController::registrar();   
} elseif ($request_method === 'GET'  && $request_uri === '/api/sitev/usuario/buscar') {
    UsuarioController::buscar();
} elseif ($request_method === 'PUT'  && $request_uri === '/api/sitev/usuario/editar') {
    UsuarioController::editar();
} elseif ($request_method === 'DELETE' && $request_uri === '/api/sitev/usuario/eliminar') {
    UsuarioController::eliminar();
} elseif ($request_method === 'GET'  && $request_uri === '/api/sitev/usuario/mostrarNombre') {
    UsuarioController::mostrarNombre();
} elseif ($request_method === 'POST' && $request_uri === '/api/sitev/usuario/login') {
    UsuarioController::login();
} elseif ($request_method === 'PUT'  && $request_uri === '/api/sitev/usuario/cambiarPassword') {
    UsuarioController::cambiarPassword();
} else {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok'=>false,'error'=>'Ruta no encontrada'], JSON_UNESCAPED_UNICODE);
}
