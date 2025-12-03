<?php
namespace App\Tramite\Controllers;

use App\Tramite\Services\RequisitoService;
use App\Middleware\AuthMiddleware;

class RequisitoController
{
    // Agregar un nuevo requisito
    public static function agregar()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $id_tramite = (int)($input['id_tramite'] ?? 0);
            $titulo = $input['titulo'] ?? '';
            $tipo = $input['tipo'] ?? '';
            $obligatorio = (bool)($input['obligatorio'] ?? true);
            $orden = (int)($input['orden'] ?? 1);

            if ($id_tramite <= 0 || $titulo === '' || $tipo === '') {
                throw new \RuntimeException('Parámetros inválidos', 400);
            }

            $id_requisito = RequisitoService::agregarRequisito($id_tramite, $titulo, $tipo, $obligatorio, $orden);
            echo json_encode(['ok' => true, 'id_requisito' => $id_requisito], JSON_UNESCAPED_UNICODE);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 400);
            echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
        }
    }

    // Editar un requisito
    public static function editar()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $id_requisito = (int)($input['id_requisito'] ?? 0);
            $data = $input['data'] ?? [];

            if ($id_requisito <= 0 || empty($data)) {
                throw new \RuntimeException('Parámetros inválidos', 400);
            }

            $ok = RequisitoService::editarRequisito($id_requisito, $data);
            echo json_encode(['ok' => $ok]);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 400);
            echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
        }
    }

    // Eliminar un requisito
    public static function eliminar()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $id_requisito = (int)($input['id_requisito'] ?? 0);

            if ($id_requisito <= 0) {
                throw new \RuntimeException('Parámetro inválido', 400);
            }

            $ok = RequisitoService::eliminarRequisito($id_requisito);
            echo json_encode(['ok' => $ok]);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 400);
            echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
        }
    }

    // Llenar un requisito
    public static function llenar()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $id_tramite = (int)($input['id_tramite'] ?? 0);
            $id_requisito = (int)($input['id_requisito'] ?? 0);
            $valor = $input['valor'] ?? '';

            if ($id_tramite <= 0 || $id_requisito <= 0 || $valor === '') {
                throw new \RuntimeException('Parámetros inválidos', 400);
            }

            $ok = RequisitoService::llenarRequisito($id_tramite, $id_requisito, $valor);
            echo json_encode(['ok' => $ok]);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 400);
            echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
        }
    }

    // Obtener los requisitos de un trámite
    public static function porTramite()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $id_tramite = (int)($_GET['id_tramite'] ?? 0);

            if ($id_tramite <= 0) {
                throw new \RuntimeException('ID de trámite inválido', 400);
            }

            // Obtener los requisitos agrupados por trámite
            $requisitos = RequisitoService::obtenerRequisitosPorTramite($id_tramite);

            // Si no se encuentran requisitos
            if (empty($requisitos['requisitos'])) {
                http_response_code(404);
                echo json_encode(['ok' => false, 'error' => 'No se encontraron requisitos para este trámite']);
                return;
            }

            // La respuesta ahora incluirá los requisitos agrupados por trámite
            echo json_encode(['ok' => true, 'data' => $requisitos], JSON_UNESCAPED_UNICODE);

        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 400);
            echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
        }
    }
}
