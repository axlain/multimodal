<?php
namespace App\Maestro\Controllers;

use App\Maestro\Services\MaestroService;

class MaestroController
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

   /** POST /api/sitev/maestro/crear */
    public static function crear(): void
    {
        try {
            $id = MaestroService::crear(self::jsonInput());
            self::ok(['id_maestro' => $id], 201);
        } catch (\Throwable $e) {
            self::fail($e->getMessage(), 400);
        }
    }

    /** PUT /api/sitev/maestro/editar?id_maestro=123 */
    public static function editar(): void
    {
        $id = (int)($_GET['id_maestro'] ?? 0);
        if ($id <= 0) { self::fail('Falta id_maestro', 422); return; }
        try {
            $ok = MaestroService::editar($id, self::jsonInput());
            self::ok(['updated' => $ok]);
        } catch (\Throwable $e) {
            self::fail($e->getMessage(), 400);
        }
    }

    /** DELETE /api/sitev/maestro/eliminar?id_maestro=123 */
    public static function eliminar(): void
    {
        $id = (int)($_GET['id_maestro'] ?? 0);
        if ($id <= 0) { self::fail('Falta id_maestro', 422); return; }
        try {
            $ok = MaestroService::eliminar($id);
            self::ok(['deleted' => $ok]);
        } catch (\Throwable $e) {
            self::fail($e->getMessage(), 400);
        }
    }

    /** GET /api/sitev/maestro/buscar?q=juan&limit=20&offset=0 */
    public static function buscar(): void
    {
        $q = (string)($_GET['q'] ?? '');
        $limit = max(1, (int)($_GET['limit'] ?? 20));
        $offset = max(0, (int)($_GET['offset'] ?? 0));
        try {
            $rows = MaestroService::buscar($q, $limit, $offset);
            self::ok($rows);
        } catch (\Throwable $e) {
            self::fail($e->getMessage(), 400);
        }
    }

    /** GET /api/sitev/maestro/todos?limit=100&offset=0 */
    public static function todos(): void
    {
        $limit = max(1, (int)($_GET['limit'] ?? 100));
        $offset = max(0, (int)($_GET['offset'] ?? 0));
        try {
            $rows = MaestroService::obtenerTodos($limit, $offset);
            self::ok($rows);
        } catch (\Throwable $e) {
            self::fail($e->getMessage(), 400);
        }
    }

    /** GET /api/sitev/maestro/detalle?id_maestro=123 */
    public static function detalle(): void
    {
        $id = (int)($_GET['id_maestro'] ?? 0);
        if ($id <= 0) { self::fail('Falta id_maestro', 422); return; }
        try {
            $row = MaestroService::detalle($id);
            if (!$row) { self::fail('No encontrado', 404); return; }
            self::ok($row);
        } catch (\Throwable $e) {
            self::fail($e->getMessage(), 400);
        }
    }
}
