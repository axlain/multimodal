<?php
namespace App\Archivo\Services;

use App\Archivo\Models\Archivo;

class ArchivoService
{
    /** Guarda el archivo físicamente */
    public static function almacenarFisico(array $file, string $subdir = 'requisitos'): array
    {
        // 1. Validar que no haya errores
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new \Exception('Error al subir archivo: ' . $file['error']);
        }

        $tmp  = $file['tmp_name'];
        $size = (int)$file['size'];
        $orig = basename($file['name']);

        // 2. Configuración desde ENV
        $allowedExtensions = array_map('trim', explode(',', getenv('UPLOAD_EXTENSIONS') ?: ''));
        $allowedMime       = array_map('trim', explode(',', getenv('UPLOAD_MIME') ?: ''));
        $maxSize           = (int)(getenv('UPLOAD_MAX_SIZE') ?: 20 * 1024 * 1024);

        // 3. Extensión real
        $ext = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
        if (!in_array($ext, $allowedExtensions, true)) {
            throw new \Exception("Extensión no permitida: .$ext");
        }

        // 4. MIME real del archivo
        $mime = mime_content_type($tmp) ?: ($file['type'] ?? '');
        if (!in_array($mime, $allowedMime, true)) {
            throw new \Exception("Tipo de archivo no permitido (MIME: $mime)");
        }

        // 5. Validar tamaño
        if ($size > $maxSize) {
            $mb = round($maxSize / 1024 / 1024);
            throw new \Exception("El archivo es demasiado grande (máx {$mb}MB)");
        }

        // 6. Crear carpeta si no existe
        $baseDir = __DIR__ . "/../../../public/uploads/{$subdir}";
        if (!is_dir($baseDir)) {
            mkdir($baseDir, 0775, true);
        }

        // 7. Crear nombre seguro y único
        $safe = preg_replace('/[^a-zA-Z0-9_\.-]/', '_', pathinfo($orig, PATHINFO_FILENAME));
        $unique = bin2hex(random_bytes(8));
        $new = "{$safe}_{$unique}.{$ext}";
        $dest = "{$baseDir}/{$new}";

        // 8. Mover archivo
        if (!move_uploaded_file($tmp, $dest)) {
            throw new \Exception('No se pudo mover el archivo');
        }

        // 9. URL pública
        $url = "/uploads/{$subdir}/{$new}";

        return [$new, $url, $mime, $size];
    }


    /** Crea el archivo, lo vincula y verifica instancia */
    public static function procesarArchivo(
        int $id_tramite,
        int $id_instancia,
        int $id_requisito,
        string $filename,
        string $mime,
        int $size,
        string $url
    ): array {
        // 1️⃣ Registrar archivo
        $id_archivo = Archivo::crear($id_tramite, $id_requisito, $filename, $mime, $size, $url);

        // 2️⃣ Vincular archivo con la instancia
        Archivo::vincularAInstancia($id_instancia, $id_requisito, $id_archivo);

        // 3️⃣ Verificar si la instancia se completa
        Archivo::verificarYCompletarInstancia($id_instancia);

        // 4️⃣ Retornar estado actualizado
        $estado = Archivo::obtenerEstadoInstancia($id_instancia);

        return [
            'id_archivo' => $id_archivo,
            'url' => $url,
            'filename' => $filename,
            'estado_instancia' => $estado,
        ];
    }
}
