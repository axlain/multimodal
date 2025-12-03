<?php
require_once __DIR__ .'/../middleware/AuthMiddleware.php';
AuthMiddleware::verificarToken();

require_once __DIR__ .'/../middleware/LoggingMiddleware.php';
LoggingMiddleware::registrarSolicitud();

require_once __DIR__ .'/../middleware/Cors.php';
Cors::permitirOrigen();

require_once __DIR__ . '/routes/AreaRoutes.php';

?>
