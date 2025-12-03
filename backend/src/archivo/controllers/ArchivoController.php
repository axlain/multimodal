<?php
namespace App\Archivo\Controllers;

use App\Archivo\Services\ArchivoService;
use App\Middleware\AuthMiddleware;

class ArchivoController
{
    public static function subir()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            AuthMiddleware::verificarToken();

            if (!isset($_FILES['file'])) {
                throw new \RuntimeException('No se recibió ningún archivo');
            }

            $id_instancia = (int)($_POST['id_instancia'] ?? 0);
            $id_tramite   = (int)($_POST['id_tramite'] ?? 0);
            $id_requisito = (int)($_POST['id_requisito'] ?? 0);

            if ($id_instancia <= 0 || $id_tramite <= 0 || $id_requisito <= 0) {
                throw new \RuntimeException('Faltan parámetros obligatorios');
            }

            // 📁 Guardar físicamente
            [$storedName, $url, $mime, $size] = ArchivoService::almacenarFisico($_FILES['file']);

            // 🧩 Procesar y vincular archivo
            $resultado = ArchivoService::procesarArchivo(
                $id_tramite,
                $id_instancia,
                $id_requisito,
                $_FILES['file']['name'],
                $mime,
                $size,
                $url
            );

            http_response_code(201);
            echo json_encode(['ok' => true] + $resultado);
        } catch (\Throwable $e) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
        }
    }
}
