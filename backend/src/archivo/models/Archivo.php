<?php
namespace App\Archivo\Models;

require_once __DIR__ . '/../../config/database.php';

class Archivo
{
    /** Crear registro de archivo subido */
    public static function crear(
        int $id_tramite,
        int $id_requisito,
        string $filename,
        string $mime,
        int $size,
        string $url
    ): int {
        $mysqli = db();
        $sql = "INSERT INTO archivos (id_tramite, id_requisito, filename, mime, size, url, creado_en)
                VALUES (?, ?, ?, ?, ?, ?, NOW())";
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param('iissis', $id_tramite, $id_requisito, $filename, $mime, $size, $url);
        $stmt->execute();
        $id = (int)$stmt->insert_id;
        $stmt->close();
        return $id;
    }

    /** Vincula archivo a datos_instancia (crea si no existe el registro) */
    public static function vincularAInstancia(int $id_instancia, int $id_requisito, int $id_archivo): void
    {
        $mysqli = db();

        // 1️⃣ Crear registro si no existe
        $insert = $mysqli->prepare("
            INSERT IGNORE INTO datos_instancia (id_instancia, id_requisito)
            VALUES (?, ?)
        ");
        $insert->bind_param("ii", $id_instancia, $id_requisito);
        $insert->execute();
        $insert->close();

        // 2️⃣ Actualizar id_archivo
        $stmt = $mysqli->prepare("
            UPDATE datos_instancia
            SET id_archivo = ?
            WHERE id_instancia = ? AND id_requisito = ?
        ");
        $stmt->bind_param("iii", $id_archivo, $id_instancia, $id_requisito);
        $stmt->execute();
        $stmt->close();
    }

    /** Verifica si se completaron los requisitos y finaliza la instancia si corresponde */
    public static function verificarYCompletarInstancia(int $id_instancia): void
    {
        $mysqli = db();

        // Obtener el trámite asociado
        $stmt = $mysqli->prepare("SELECT id_tramite FROM tramites_instancias WHERE id_instancia = ?");
        $stmt->bind_param("i", $id_instancia);
        $stmt->execute();
        $id_tramite = (int)($stmt->get_result()->fetch_assoc()['id_tramite'] ?? 0);
        $stmt->close();
        if (!$id_tramite) return;

        // Total de requisitos obligatorios
        $stmt2 = $mysqli->prepare("SELECT COUNT(*) AS total FROM requisitos WHERE id_tramite = ? AND obligatorio = 1");
        $stmt2->bind_param("i", $id_tramite);
        $stmt2->execute();
        $total = (int)$stmt2->get_result()->fetch_assoc()['total'];
        $stmt2->close();

        // Requisitos con archivos subidos
        $stmt3 = $mysqli->prepare("
            SELECT COUNT(DISTINCT id_requisito) AS subidos
            FROM datos_instancia
            WHERE id_instancia = ? AND id_archivo IS NOT NULL
        ");
        $stmt3->bind_param("i", $id_instancia);
        $stmt3->execute();
        $subidos = (int)$stmt3->get_result()->fetch_assoc()['subidos'];
        $stmt3->close();

        // Finalizar si corresponde
        if ($total > 0 && $subidos >= $total) {
            $stmt4 = $mysqli->prepare("
                UPDATE tramites_instancias
                SET estado = 'finalizado', updated_at = NOW()
                WHERE id_instancia = ?
            ");
            $stmt4->bind_param("i", $id_instancia);
            $stmt4->execute();
            $stmt4->close();
        }
    }

    /** Devuelve el estado actual de una instancia */
    public static function obtenerEstadoInstancia(int $id_instancia): string
    {
        $mysqli = db();
        $stmt = $mysqli->prepare("SELECT estado FROM tramites_instancias WHERE id_instancia = ?");
        $stmt->bind_param("i", $id_instancia);
        $stmt->execute();
        $estado = $stmt->get_result()->fetch_assoc()['estado'] ?? 'borrador';
        $stmt->close();
        return $estado;
    }
}
