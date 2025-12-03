<?php
namespace App\Instancia\Models;

require_once __DIR__ . '/../../config/database.php';

class DatosInstancia
{
    /** Lista de requisitos del trámite con su valor (si existe) para esta instancia */
    public static function obtenerConRequisitos(int $id_instancia): array
    {
        $mysqli = db();
        $sql = "SELECT r.id_requisito, r.titulo, r.tipo, r.obligatorio, r.orden, di.valor
                FROM tramites_instancias i
                JOIN requisitos r ON r.id_tramite = i.id_tramite
                LEFT JOIN datos_instancia di
                  ON di.id_instancia = i.id_instancia AND di.id_requisito = r.id_requisito
                WHERE i.id_instancia = ?
                ORDER BY r.orden ASC";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \RuntimeException("Prepare failed: " . $mysqli->error);

        $stmt->bind_param("i", $id_instancia);
        if (!$stmt->execute()) throw new \RuntimeException("Execute failed: " . $stmt->error);

        $res = $stmt->get_result();
        $data = [];
        while ($row = $res->fetch_assoc()) {
            $data[] = [
                'id_requisito' => (int)$row['id_requisito'],
                'titulo'       => $row['titulo'],
                'tipo'         => $row['tipo'],
                'obligatorio'  => (int)$row['obligatorio'],
                'orden'        => (int)$row['orden'],
                'valor'        => $row['valor'],
            ];
        }
        $stmt->close();
        return $data;
    }

    /** Guardar/actualizar un valor (UPSERT por PK compuesta) */
    public static function upsert(int $id_instancia, int $id_requisito, string $valor): bool
    {
        $mysqli = db();
        $sql = "INSERT INTO datos_instancia (id_instancia, id_requisito, valor)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE valor = VALUES(valor)";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \RuntimeException("Prepare failed: " . $mysqli->error);

        $stmt->bind_param("iis", $id_instancia, $id_requisito, $valor);
        if (!$stmt->execute()) throw new \RuntimeException("Execute failed: " . $stmt->error);
        $stmt->close();
        return true;
    }
}
