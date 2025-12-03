<?php
namespace App\Instancia\Controllers;

use App\Instancia\Services\InstanciaService;
use App\Middleware\AuthMiddleware;

class InstanciaController
{
    /** POST /api/sitev/instancia/crear  Body: { id_tramite, maestro_nombre } */
    public static function crear()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $payload = AuthMiddleware::verificarToken();
            $userId = (int)($payload['usr']['id'] ?? 0);

            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $id_tramite = (int)($input['id_tramite'] ?? 0);
            $maestro    = (string)($input['maestro_nombre'] ?? '');

            $id = InstanciaService::crear($id_tramite, $maestro, $userId ?: null);
            http_response_code(201);
            echo json_encode(['ok'=>true,'id_instancia'=>$id], JSON_UNESCAPED_UNICODE);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 400);
            echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['ok'=>false,'error'=>'Error interno']);
        }
    }

    /** GET /api/sitev/instancia/detalle?id= */
    public static function detalle()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            AuthMiddleware::verificarToken();
            $id = (int)($_GET['id'] ?? 0);
            if ($id <= 0) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'ID inválido']); return; }

            $inst = InstanciaService::obtener($id);
            $reqs = InstanciaService::requisitosConValores($id);

            echo json_encode(['ok'=>true,'instancia'=>$inst,'requisitos'=>$reqs], JSON_UNESCAPED_UNICODE);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 400);
            echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['ok'=>false,'error'=>'Error interno']);
        }
    }

    /** POST /api/sitev/instancia/llenar  Body: { id_instancia, id_requisito, valor } */
    public static function llenar()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            AuthMiddleware::verificarToken();
            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $id_instancia = (int)($input['id_instancia'] ?? 0);
            $id_requisito = (int)($input['id_requisito'] ?? 0);
            $valor        = (string)($input['valor'] ?? '');

            if ($id_instancia <= 0 || $id_requisito <= 0) {
                throw new \RuntimeException('Parámetros inválidos', 400);
            }
            $ok = InstanciaService::upsertValor($id_instancia, $id_requisito, $valor);
            echo json_encode(['ok'=>$ok]);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 400);
            echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['ok'=>false,'error'=>'Error interno']);
        }
    }

    /** GET /api/sitev/instancia/buscar?q= */
    public static function buscar()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            AuthMiddleware::verificarToken();
            $q = trim($_GET['q'] ?? '');
            if ($q === '') { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Falta parámetro q']); return; }

            $res = InstanciaService::buscarPorMaestro($q);
            echo json_encode(['ok'=>true,'data'=>$res], JSON_UNESCAPED_UNICODE);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 400);
            echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['ok'=>false,'error'=>'Error interno']);
        }
    }

    /** GET /api/sitev/instancia/mis */
    public static function mis()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $payload = AuthMiddleware::verificarToken();
            $userId = (int)($payload['usr']['id'] ?? 0);
            if ($userId <= 0) { http_response_code(401); echo json_encode(['ok'=>false,'error'=>'No autenticado']); return; }

            $res = InstanciaService::listarPorUsuario($userId);
            echo json_encode(['ok'=>true,'data'=>$res], JSON_UNESCAPED_UNICODE);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 400);
            echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['ok'=>false,'error'=>'Error interno']);
        }
    }

    public static function porTramite()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            AuthMiddleware::verificarToken();
            $id_tramite = (int)($_GET['id_tramite'] ?? 0);
            if ($id_tramite <= 0) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'id_tramite inválido']); return; }
            $res = InstanciaService::listarPorTramite($id_tramite);
            echo json_encode(['ok'=>true,'data'=>$res], JSON_UNESCAPED_UNICODE);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 400);
            echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['ok'=>false,'error'=>'Error interno']);
        }
    }
}
