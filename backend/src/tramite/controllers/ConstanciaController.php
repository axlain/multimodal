<?php
namespace App\Tramite\Controllers;

use App\Tramite\Services\ConstanciaService;

class ConstanciaController
{
    public static function generar(int $id_instancia)
    {
        try {
            $res = ConstanciaService::generarConstancia($id_instancia);

            $filePath = $res['path'];
            if (!file_exists($filePath)) {
                http_response_code(404);
                echo json_encode(['ok' => false, 'error' => 'Archivo no encontrado']);
                return;
            }

            // ⚡ Limpieza y headers correctos
            while (ob_get_level()) ob_end_clean();
            ini_set('zlib.output_compression', '0');

            header('Content-Description: File Transfer');
            header('Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
            header('Content-Length: ' . filesize($filePath));
            header('Cache-Control: must-revalidate');
            header('Pragma: public');

            flush();
            readfile($filePath);
            exit;

        } catch (\RuntimeException $e) {
            if (ob_get_length()) ob_end_clean();
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
        } catch (\Throwable $e) {
            if (ob_get_length()) ob_end_clean();
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => 'Error interno: ' . $e->getMessage()]);
        }
    }

    public static function descargarConstancia(int $id)
    {
        $db = db();
        $stmt = $db->prepare("SELECT constancia_path FROM tramites_instancias WHERE id_instancia=?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();

        if (!$row || empty($row['constancia_path'])) {
            http_response_code(404);
            echo json_encode(['ok' => false, 'error' => 'Constancia no encontrada']);
            return;
        }

        $filePath = __DIR__ . '/../../../public' . $row['constancia_path'];
        if (!file_exists($filePath)) {
            http_response_code(404);
            echo json_encode(['ok' => false, 'error' => 'Archivo no encontrado']);
            return;
        }

        while (ob_get_level()) ob_end_clean();
        ini_set('zlib.output_compression', '0');

        header('Content-Description: File Transfer');
        header('Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
        header('Content-Length: ' . filesize($filePath));
        flush();
        readfile($filePath);
        exit;
    }
}
