<?php

namespace App\middleware;

class Cors
{
    public static function handle()
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        // Leer lista desde .env
        $envOrigins = getenv('ALLOWED_ORIGINS') ?: '';
        $allowed = array_map('trim', explode(',', $envOrigins));

        // Si el origen está en la allowlist, lo permitimos
        if ($origin && in_array($origin, $allowed, true)) {
            header("Access-Control-Allow-Origin: $origin");
        } else {
          
            header("Access-Control-Allow-Origin: 'null'");
        }

        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Vary: Origin');

        // Preflight de CORS
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
