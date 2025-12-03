<?php
use App\Area\Controllers\AreaController;

$request_uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_method = $_SERVER['REQUEST_METHOD'];
// ...
if ($request_method === "GET"  && $request_uri === '/api/sitev/area/obtenerTodas') { AreaController::index();
} elseif ($request_method === 'POST' && $request_uri === '/api/sitev/area/crear') { AreaController::crear();
} elseif ($request_method === 'GET'  && $request_uri === '/api/sitev/area/buscar') { AreaController::buscar();
} elseif ($request_method === 'PUT'  && $request_uri === '/api/sitev/area/editar') { AreaController::editar();
} elseif ($request_method === 'DELETE'&& $request_uri === '/api/sitev/area/eliminar') { AreaController::eliminar();
} elseif ($request_method === 'GET'  && $request_uri === '/api/sitev/area/mostrarNombre') { AreaController::mostrarNombre();
} elseif ($request_method === 'GET'  && $request_uri === '/api/sitev/area/usuarios') { AreaController::usuarios();
} elseif ($request_method === 'GET'  && $request_uri === '/api/sitev/area/tramites') { AreaController::tramites();
} elseif ($request_method === 'GET' && $request_uri === '/api/sitev/area/obtenerAreaPorUsuario') { 
    AreaController::obtenerAreaPorUsuario(); 
}

