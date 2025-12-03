<?php
namespace App\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

final class AuthMiddleware
{
    private static function cfg(): array {
        $cfg = require __DIR__ . '/../config/jwt.php';
        if (isset($cfg['leeway'])) {
            JWT::$leeway = (int)$cfg['leeway'];
        }
        return $cfg;
    }

    /** Genera un JWT desde el array $user (id, nombre, email, id_area, rol). */
    public static function generarToken(array $user): string
    {
        $cfg = self::cfg();
        $now = time();

        $payload = [
            'iss' => $cfg['issuer'],
            'aud' => $cfg['audience'],
            'iat' => $now,
            'nbf' => $now,
            'exp' => $now + $cfg['ttl'],
            'sub' => (string)($user['id'] ?? ''),
            'usr' => [
                'id'      => (int)($user['id'] ?? 0),
                'nombre'  => $user['nombre'] ?? '',
                'email'   => $user['email'] ?? '',
                'id_area' => (int)($user['id_area'] ?? 0),
                'rol'     => $user['rol'] ?? '',
            ],
        ];

        return JWT::encode($payload, $cfg['secret'], 'HS256');
    }

    /** Devuelve el payload (array) o lanza RuntimeException 401/403. */
    public static function verificarToken(): array
    {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $authHeader = '';
        foreach ($headers as $k => $v) {
            if (strcasecmp($k, 'Authorization') === 0) { $authHeader = $v; break; }
        }
        if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $m)) {
            throw new \RuntimeException('Falta token (Authorization: Bearer <token>)', 401);
        }

        $jwt = trim($m[1]);
        $cfg = self::cfg();

        try {
            $decoded = JWT::decode($jwt, new Key($cfg['secret'], 'HS256'));
            return json_decode(json_encode($decoded), true);
        } catch (\Firebase\JWT\ExpiredException $e) {
            throw new \RuntimeException('Token expirado', 401);
        } catch (\Throwable $e) {
            // error_log('JWT error: '.$e->getMessage());
            throw new \RuntimeException('Token inválido', 403);
        }
    }
}
