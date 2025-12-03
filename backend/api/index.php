<?php

require_once __DIR__ . '/../vendor/autoload.php';

use App\Middleware\Cors;
use App\Middleware\LoggingMiddleware;

Cors::handle();
LoggingMiddleware::logRequest();
header('Content-Type: application/json; charset=utf-8');

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';

if (str_starts_with($path, '/api/sitev/usuario')) {
    require __DIR__ . '/../src/usuario/routes/UsuarioRoutes.php';
    exit;
} elseif (str_starts_with($path, '/api/sitev/area')) {
    require __DIR__ . '/../src/area/routes/AreaRoutes.php';
    exit;
} elseif (str_starts_with($path, '/api/sitev/tramite')) {
    require __DIR__ . '/../src/tramite/routes/TramiteRoutes.php';
    exit;
} elseif (str_starts_with($path, '/api/sitev/requisito')) {
    require __DIR__ . '/../src/tramite/routes/TramiteRoutes.php'; // o RequisitoRoutes.php si lo separas
    exit;
} elseif (str_starts_with($path, '/api/sitev/instancia')) {
    require __DIR__ . '/../src/instancia/routes/InstanciaRoutes.php';
    exit;
} elseif (str_starts_with($path, '/api/sitev/maestro')) {
    require __DIR__ . '/../src/maestro/routes/MaestroRoutes.php';
    exit;
} elseif (str_starts_with($path, '/api/sitev/escuela')) {
    require __DIR__ . '/../src/escuela/routes/EscuelaRoutes.php';
    exit;
} elseif (str_starts_with($path, '/api/sitev/archivo')) {
    require __DIR__ . '/../src/archivo/routes/ArchivoRoutes.php';
    exit;
}

http_response_code(404);
echo json_encode(['ok' => false, 'error' => 'Ruta no encontrada'], JSON_UNESCAPED_UNICODE);
