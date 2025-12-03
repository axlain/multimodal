<?php
namespace App\Tramite\Controllers;

use App\Tramite\Services\TramiteService;
use App\Middleware\AuthMiddleware;

class TramiteController
{
    // Crear tramite
    public static function crear()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $payload = AuthMiddleware::verificarToken();
            $esAdmin = (($payload['usr']['rol'] ?? '') === 'administrador');
            if (!$esAdmin) { http_response_code(403); echo json_encode(['ok'=>false,'error'=>'Prohibido']); return; }

            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $id = TramiteService::crearTramite($input);
            http_response_code(201);
            echo json_encode(['ok'=>true,'id'=>$id], JSON_UNESCAPED_UNICODE);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 400); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        }
    }

    // Editar tramite
    public static function editar()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $payload = AuthMiddleware::verificarToken();
            $esAdmin = (($payload['usr']['rol'] ?? '') === 'administrador');
            if (!$esAdmin) { http_response_code(403); echo json_encode(['ok'=>false,'error'=>'Prohibido']); return; }

            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $id = (int)($_GET['id'] ?? ($input['id'] ?? 0));
            if ($id <= 0) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'ID inválido']); return; }

            $payloadBody = $input; unset($payloadBody['id']);
            if (empty($payloadBody)) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'No hay campos para actualizar']); return; }

            $ok = TramiteService::editarTramite($id, $payloadBody);
            echo json_encode(['ok'=>$ok]);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 401); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        }
    }

    // Eliminar tramite
    public static function eliminar()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $payload = AuthMiddleware::verificarToken();
            $esAdmin = (($payload['usr']['rol'] ?? '') === 'administrador');
            if (!$esAdmin) { http_response_code(403); echo json_encode(['ok'=>false,'error'=>'Prohibido']); return; }

            $id = (int)($_GET['id'] ?? 0);
            if ($id <= 0) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'ID inválido']); return; }

            $ok = TramiteService::eliminarTramite($id);
            if (!$ok) { http_response_code(404); echo json_encode(['ok'=>false,'error'=>'Tramite no encontrado']); return; }
            echo json_encode(['ok'=>true]);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 400); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        }
    }

    // Buscar tramite
    public static function buscar()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $payload = AuthMiddleware::verificarToken();
            $term = trim($_GET['q'] ?? '');
            if ($term === '') { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Falta parámetro q']); return; }
            $res = TramiteService::buscarTramite($term);
            echo json_encode(['ok'=>true,'data'=>$res], JSON_UNESCAPED_UNICODE);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 401); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        }
    }

    // Ver todos los tramites
    public static function todos()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            AuthMiddleware::verificarToken();
            $tramites = TramiteService::obtenerTodosTramites();
            echo json_encode(['ok'=>true,'data'=>$tramites], JSON_UNESCAPED_UNICODE);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 401); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        }
    }

    // Ver tramites por área
    public static function porArea()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            AuthMiddleware::verificarToken();
            $id_area = (int)($_GET['id'] ?? 0);
            if ($id_area <= 0) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'ID de área inválido']); return; }

            $tramites = TramiteService::obtenerTramitesPorArea($id_area);
            if (empty($tramites)) { http_response_code(404); echo json_encode(['ok'=>false,'error'=>'No se encontraron trámites para esta área']); return; }

            echo json_encode(['ok'=>true,'data'=>$tramites], JSON_UNESCAPED_UNICODE);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 401); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        }
    }



}
