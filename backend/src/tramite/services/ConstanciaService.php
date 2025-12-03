<?php
namespace App\Tramite\Services;

use App\Tramite\Models\Tramite;
use App\Tramite\Services\WordService;

class ConstanciaService
{
    public static function generarConstancia(int $id_instancia): array
    {
        $tramite = Tramite::obtenerDatosParaConstancia($id_instancia);

        if (!$tramite) {
            throw new \RuntimeException('Instancia no encontrada');
        }
        if ($tramite['estado'] !== 'finalizado') {
            throw new \RuntimeException('La instancia aún no está finalizada');
        }

        // 📝 Generar documento temporal
        $tempPath = WordService::generarPorTramite($tramite);

        // 📁 Mover al directorio público
        $outputDir = __DIR__ . '/../../../public/constancias';
        if (!is_dir($outputDir)) mkdir($outputDir, 0775, true);

        $nombre = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $tramite['nombre_personal'] ?? 'desconocido');
        $folio  = $tramite['id_instancia'] ?? uniqid();
        $fileName = "Constancia_{$nombre}_Folio{$folio}.docx";
        $finalPath = "{$outputDir}/{$fileName}";

        rename($tempPath, $finalPath);
        $url = "/constancias/{$fileName}";

        // ✅ Guardar la ruta en la instancia
        $mysqli = db();
        $stmt = $mysqli->prepare("
            UPDATE tramites_instancias
            SET constancia_path = ?, updated_at = NOW()
            WHERE id_instancia = ?
        ");
        $stmt->bind_param("si", $url, $id_instancia);
        $stmt->execute();
        $stmt->close();

        return [
            'ok' => true,
            'path' => $finalPath,
            'url' => $url,
            'message' => 'Constancia generada correctamente.'
        ];
    }
}
