<?php
namespace App\Tramite\Models;
require_once __DIR__ . '/../../config/database.php';
class Requisito
{
    /** AÑADIR un nuevo requisito */
    public static function agregarRequisito(int $id_tramite, string $titulo, string $tipo, bool $obligatorio, int $orden): int
    {
        $mysqli = db();
        $sql = "INSERT INTO requisitos (id_tramite, titulo, tipo, obligatorio, orden) VALUES (?, ?, ?, ?, ?)";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \RuntimeException("Prepare failed: " . $mysqli->error);

        $stmt->bind_param("issii", $id_tramite, $titulo, $tipo, $obligatorio, $orden);
        if (!$stmt->execute()) throw new \RuntimeException("Execute failed: " . $stmt->error);

        $id = $mysqli->insert_id;
        $stmt->close();
        return $id;
    }
    /** EDITAR un requisito */
    public static function editarRequisito(int $id_requisito, array $data): bool
    {
        $mysqli = db();
        $sets = [];
        $tipos = '';
        $params = [];

        if (isset($data['titulo'])) {
            $sets[] = "titulo = ?";
            $tipos .= 's';
            $params[] = $data['titulo'];
        }
        if (isset($data['tipo'])) {
            $sets[] = "tipo = ?";
            $tipos .= 's';
            $params[] = $data['tipo'];
        }
        if (isset($data['obligatorio'])) {
            $sets[] = "obligatorio = ?";
            $tipos .= 'i';
            $params[] = $data['obligatorio'];
        }
        if (isset($data['orden'])) {
            $sets[] = "orden = ?";
            $tipos .= 'i';
            $params[] = $data['orden'];
        }

        if (empty($sets)) return false;

        $sql = "UPDATE requisitos SET " . implode(', ', $sets) . " WHERE id_requisito = ?";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \RuntimeException("Prepare failed: " . $mysqli->error);

        $tipos .= 'i';
        $params[] = $id_requisito;

        $stmt->bind_param($tipos, ...$params);
        $ok = $stmt->execute();
        if (!$ok) throw new \RuntimeException("Execute failed: " . $stmt->error);

        $filas = $stmt->affected_rows;
        $stmt->close();
        return $ok && $filas >= 0;
    }
    /** ELIMINAR un requisito */
    public static function eliminarRequisito(int $id_requisito): bool
    {
        $mysqli = db();
        $stmt = $mysqli->prepare("DELETE FROM requisitos WHERE id_requisito = ?");
        if (!$stmt) throw new \RuntimeException("Prepare failed: " . $mysqli->error);

        $stmt->bind_param("i", $id_requisito);
        $ok = $stmt->execute();
        if (!$ok) throw new \RuntimeException("Execute failed: " . $stmt->error);

        $filas = $stmt->affected_rows;
        $stmt->close();
        return $ok && $filas > 0;
    }

    /** OBTENER los requisitos por trámite */
    public static function obtenerRequisitosPorTramite(int $id_tramite): array
    {
        $mysqli = db();
        // Unir los requisitos con el nombre del trámite en una sola consulta
        $sql = "
            SELECT r.id_requisito, r.titulo, r.tipo, r.obligatorio, r.orden, t.nombre AS nombre_tramite
            FROM requisitos r
            JOIN tramites t ON r.id_tramite = t.id_tramite
            WHERE r.id_tramite = ?
            ORDER BY r.orden ASC
        ";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \RuntimeException("Prepare failed: " . $mysqli->error);

        $stmt->bind_param("i", $id_tramite);
        if (!$stmt->execute()) throw new \RuntimeException("Execute failed: " . $mysqli->error);

        $res = $stmt->get_result();
        $data = [];
        
        // Agrupar los requisitos por el nombre del trámite
        while ($row = $res->fetch_assoc()) {
            $data['nombre_tramite'] = $row['nombre_tramite'];  // Guardar el nombre del trámite
            $data['requisitos'][] = [
                'id_requisito' => $row['id_requisito'],
                'titulo' => $row['titulo'],
                'tipo' => $row['tipo'],
                'obligatorio' => $row['obligatorio'],
                'orden' => $row['orden'],
            ];
        }
        
        $stmt->close();

        return $data;  // Retorna los datos organizados por trámite
    }
}
