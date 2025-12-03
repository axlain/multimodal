<?php
namespace App\Tramite\Services;

use PhpOffice\PhpWord\TemplateProcessor;

class WordService
{
    /**
     * Genera un archivo Word (.docx) basado en la plantilla correspondiente al trámite.
     * Devuelve la ruta completa al archivo generado.
     */
    public static function generarPorTramite(array $tramite): string
    {
        // 📂 Directorio base de plantillas
        $templateDir = __DIR__ . '/../templates/';

        // 🔎 Identificar plantilla según nombre del trámite
        $nombreTramite = strtolower(trim($tramite['nombre_tramite'] ?? $tramite['nombre'] ?? ''));
        $map = [
            'nuevo ingreso' => 'nuevo_ingreso.docx',
            'licencia por gravidez' => 'licencia_por_gravidez.docx',
            'licencia por incapacidad' => 'licencia_por_incapacidad.docx',
            'licencia prejubilatoria' => 'licencia_prejubilatoria.docx',
            'licencia sin goce de sueldo por asuntos particulares' => 'licencia_sin_goce_de_sueldo.docx',
            'plaza adicional' => 'plaza_adicional.docx',
            'reingreso' => 'reingreso.docx',
        ];

        $templateFile = $map[$nombreTramite] ?? 'default_constancia.docx';
        $templatePath = $templateDir . $templateFile;

        if (!file_exists($templatePath)) {
            throw new \RuntimeException("No se encontró la plantilla para el trámite '{$nombreTramite}'");
        }

        // 🧩 Crear instancia del procesador de plantilla
        $tpl = new TemplateProcessor($templatePath);

        // 🧠 Helper: siempre convertir valores a string legible
        $f = fn($v) => trim((string)$v) !== '' ? (string)$v : '____________________';

        // ✏️ Reemplazar los placeholders
        $tpl->setValue('NOMBRE', $f($tramite['nombre_personal'] ?? $tramite['maestro_nombre'] ?? ''));
        $tpl->setValue('RFC', $f($tramite['rfc'] ?? ''));
        $tpl->setValue('ADSCRIPCION', $f($tramite['area_nombre'] ?? ''));
        $tpl->setValue('MUNICIPIO', $f($tramite['municipio'] ?? ''));
        $tpl->setValue('FECHA', date('d/m/Y'));
        $tpl->setValue('SECRETARIO', 'Lic. Alberto Yépez Alfonso');
        $tpl->setValue('CARGO_SECRETARIO', 'Secretario General');

        // 🗂️ Archivo de salida temporal
        $id = $tramite['id_tramite'] ?? $tramite['id'] ?? uniqid();
        $safeName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $nombreTramite);
        $outFile = sys_get_temp_dir() . "/Constancia_Tramite_{$safeName}_{$id}.docx";

        // 💾 Guardar archivo
        $tpl->saveAs($outFile);

        // 🧪 Validar tamaño (>1KB) para asegurar que no se corrompió
        if (filesize($outFile) < 1024) {
            throw new \RuntimeException("El archivo Word generado parece estar vacío o dañado ({$outFile}).");
        }

        return $outFile;
    }
}
