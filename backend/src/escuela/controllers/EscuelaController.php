<?php
namespace App\Escuela\Controllers;

use App\Escuela\Services\EscuelaService;

class EscuelaController
{
    private static function jsonInput(): array
    {
        $raw = file_get_contents('php://input') ?: '';
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    private static function ok($data = null, int $code = 200): void
    {
        http_response_code($code);
        echo json_encode(['ok' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
    }

    private static function fail(string $msg, int $code = 400): void
    {
        http_response_code($code);
        echo json_encode(['ok' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
    }

    /** POST /api/sitev/escuela/crear */
    public static function crear(): void
    {
        try {
            $id = EscuelaService::crear(self::jsonInput());
            self::ok(['id_escuela' => $id], 201);
        } catch (\Throwable $e) {
            self::fail($e->getMessage(), 400);
        }
    }

    /** PUT /api/sitev/escuela/editar?id_escuela=1 */
    public static function editar(): void
    {
        $id = (int)($_GET['id_escuela'] ?? 0);
        if ($id <= 0) { self::fail('Falta id_escuela', 422); return; }
        try {
            $ok = EscuelaService::editar($id, self::jsonInput());
            self::ok(['updated' => $ok]);
        } catch (\Throwable $e) {
            self::fail($e->getMessage(), 400);
        }
    }

    /** DELETE /api/sitev/escuela/eliminar?id_escuela=1 */
    public static function eliminar(): void
    {
        $id = (int)($_GET['id_escuela'] ?? 0);
        if ($id <= 0) { self::fail('Falta id_escuela', 422); return; }
        try {
            $ok = EscuelaService::eliminar($id);
            self::ok(['deleted' => $ok]);
        } catch (\Throwable $e) {
            self::fail($e->getMessage(), 400);
        }
    }

    /** GET /api/sitev/escuela/buscar?q=...&limit=20&offset=0 */
    public static function buscar(): void
    {
        $q = (string)($_GET['q'] ?? '');
        $limit = max(1, (int)($_GET['limit'] ?? 20));
        $offset = max(0, (int)($_GET['offset'] ?? 0));
        try {
            self::ok(EscuelaService::buscar($q, $limit, $offset));
        } catch (\Throwable $e) {
            self::fail($e->getMessage(), 400);
        }
    }

    /** GET /api/sitev/escuela/todos?limit=100&offset=0 */
    public static function todos(): void
    {
        $limit = max(1, (int)($_GET['limit'] ?? 100));
        $offset = max(0, (int)($_GET['offset'] ?? 0));
        try {
            self::ok(EscuelaService::obtenerTodos($limit, $offset));
        } catch (\Throwable $e) {
            self::fail($e->getMessage(), 400);
        }
    }

    /** GET /api/sitev/escuela/detalle?id_escuela=1 */
    public static function detalle(): void
    {
        $id = (int)($_GET['id_escuela'] ?? 0);
        if ($id <= 0) { self::fail('Falta id_escuela', 422); return; }
        try {
            $row = EscuelaService::detalle($id);
            if (!$row) { self::fail('No encontrado', 404); return; }
            self::ok($row);
        } catch (\Throwable $e) {
            self::fail($e->getMessage(), 400);
        }
    }

    /** GET /api/sitev/escuela/porClave?clave=ABC123 */
    public static function porClave(): void
    {
        $clave = (string)($_GET['clave'] ?? '');
        if ($clave === '') { self::fail('Falta clave', 422); return; }
        try {
            $row = EscuelaService::porClave($clave);
            if (!$row) { self::fail('No encontrado', 404); return; }
            self::ok($row);
        } catch (\Throwable $e) {
            self::fail($e->getMessage(), 400);
        }
    }
}
