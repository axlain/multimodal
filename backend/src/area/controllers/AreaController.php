<?php
namespace App\Area\Controllers;

use App\Area\Services\AreaService;
use App\Middleware\AuthMiddleware;

class AreaController
{
    public static function crear()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $payload = AuthMiddleware::verificarToken();
            $esAdmin = (($payload['usr']['rol'] ?? '') === 'administrador');
            if (!$esAdmin) { http_response_code(403); echo json_encode(['ok'=>false,'error'=>'Prohibido']); return; }

            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $id = AreaService::crearArea($input);
            http_response_code(201);
            echo json_encode(['ok'=>true,'id'=>$id], JSON_UNESCAPED_UNICODE);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 400); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        }
    }

    public static function index()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            AuthMiddleware::verificarToken();
            $areas = AreaService::obtenerTodasAreas();
            echo json_encode(['ok'=>true,'data'=>$areas], JSON_UNESCAPED_UNICODE);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 401); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        }
    }

    public static function buscar()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            AuthMiddleware::verificarToken();
            $term = trim($_GET['q'] ?? '');
            if ($term === '') { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Falta parámetro q']); return; }
            $res = AreaService::buscarArea($term);
            echo json_encode(['ok'=>true,'data'=>$res], JSON_UNESCAPED_UNICODE);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 401); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        }
    }

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

            $ok = AreaService::editarArea($id, $payloadBody);
            echo json_encode(['ok'=>$ok]);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 401); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        }
    }

    public static function eliminar()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $payload = AuthMiddleware::verificarToken();
            $esAdmin = (($payload['usr']['rol'] ?? '') === 'administrador');
            if (!$esAdmin) { http_response_code(403); echo json_encode(['ok'=>false,'error'=>'Prohibido']); return; }

            $id = (int)($_GET['id'] ?? 0);
            if ($id <= 0) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'ID inválido']); return; }

            $ok = AreaService::eliminarArea($id);
            if (!$ok) { http_response_code(404); echo json_encode(['ok'=>false,'error'=>'Área no encontrada']); return; }
            echo json_encode(['ok'=>true]);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 400); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        }
    }

    public static function mostrarNombre()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            AuthMiddleware::verificarToken();
            $id = (int)($_GET['id'] ?? 0);
            if ($id <= 0) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'ID inválido']); return; }
            $nombre = AreaService::mostrarNombreArea($id);
            if ($nombre === null) { http_response_code(404); echo json_encode(['ok'=>false,'error'=>'Área no encontrada']); return; }
            echo json_encode(['ok'=>true,'nombre'=>$nombre], JSON_UNESCAPED_UNICODE);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 401); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        }
    }

    public static function usuarios()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            AuthMiddleware::verificarToken();
            $id = (int)($_GET['id'] ?? 0);
            if ($id <= 0) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'ID inválido']); return; }
            $lista = AreaService::obtenerUsuariosPorArea($id);
            echo json_encode(['ok'=>true,'data'=>$lista], JSON_UNESCAPED_UNICODE);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 401); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        }
    }

    public static function tramites()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            AuthMiddleware::verificarToken();
            $id = (int)($_GET['id'] ?? 0);
            if ($id <= 0) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'ID inválido']); return; }
            $lista = AreaService::obtenerTramitesPorArea($id);
            echo json_encode(['ok'=>true,'data'=>$lista], JSON_UNESCAPED_UNICODE);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 401); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        }
    }
    public static function obtenerAreaPorUsuario()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            AuthMiddleware::verificarToken();
            $term = trim($_GET['q'] ?? '');
            if ($term === '') { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Falta parámetro q']); return; }
            
            $res = AreaService::obtenerAreaPorUsuario($term);
            if ($res === null) {
                http_response_code(404);
                echo json_encode(['ok'=>false,'error'=>'Usuario no encontrado o sin área asignada']);
                return;
            }
            
            echo json_encode(['ok'=>true,'data'=>$res], JSON_UNESCAPED_UNICODE);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 401); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        }
    }

}
