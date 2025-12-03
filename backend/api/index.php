<?php
// Errores en dev
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Autoload
require_once __DIR__ . '/../vendor/autoload.php';

use App\Middleware\Cors;
use App\Middleware\LoggingMiddleware;

// Middlewares globales
Cors::handle();
LoggingMiddleware::logRequest();
header('Content-Type: application/json; charset=utf-8');

// Ruteo por prefijo
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';

if (str_starts_with($path, '/api/sitev/usuario')) {
    require __DIR__ . '/../src/usuario/routes/UsuarioRoutes.php'; // ← nombre correcto
    exit;
}else if (str_starts_with($path, '/api/sitev/area')) {
    require __DIR__ . '/../src/area/routes/AreaRoutes.php';
    exit;
} else if (str_starts_with($path, '/api/sitev/tramite')) {
    require __DIR__ . '/../src/tramite/routes/TramiteRoutes.php';
    exit;
} else if (str_starts_with($path, '/api/sitev/requisito')) {
    require __DIR__ . '/../src/tramite/routes/TramiteRoutes.php';
    exit;
<<<<<<< HEAD
=======
} else if (str_starts_with($path, '/api/sitev/instancia')) {
    require __DIR__ . '/../src/instancia/routes/InstanciaRoutes.php';
    exit;
>>>>>>> login-front
} 

// 404 por defecto
http_response_code(404);
echo json_encode(['ok' => false, 'error' => 'Ruta no encontrada'], JSON_UNESCAPED_UNICODE);
