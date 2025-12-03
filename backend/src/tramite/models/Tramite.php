<?php
namespace App\Tramite\Models;

require_once __DIR__ . '/../../config/database.php';

class Tramite
{
    /** CREAR */
    public static function crearTramite(string $nombre, ?string $descripcion, int $id_area): int
    {
        $mysqli = db();
        $sql = "INSERT INTO tramites (nombre, descripcion, id_area) VALUES (?, ?, ?)";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \RuntimeException("Prepare failed: " . $mysqli->error);

        $stmt->bind_param("ssi", $nombre, $descripcion, $id_area);
        if (!$stmt->execute()) throw new \RuntimeException("Execute failed: " . $stmt->error);

        $id = $mysqli->insert_id;
        $stmt->close();
        return $id;
    }
    /** EDITAR (parcial) */
    public static function editarTramite(int $id, array $data): bool
    {
        $mysqli = db();
        $sets = [];
        $tipos = '';
        $params = [];

        if (isset($data['nombre'])) {
            $sets[] = "nombre = ?";
            $tipos .= 's';
            $params[] = $data['nombre'];
        }
        if (isset($data['descripcion'])) {
            $sets[] = "descripcion = ?";
            $tipos .= 's';
            $params[] = $data['descripcion'];
        }
        if (isset($data['id_area'])) {
            $sets[] = "id_area = ?";
            $tipos .= 'i';
            $params[] = $data['id_area'];
        }

        if (empty($sets)) return false;

        $sql = "UPDATE tramites SET " . implode(', ', $sets) . " WHERE id_tramite = ?";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \RuntimeException("Prepare failed: " . $mysqli->error);

        $tipos .= 'i';
        $params[] = $id;

        $stmt->bind_param($tipos, ...$params);
        $ok = $stmt->execute();
        if (!$ok) throw new \RuntimeException("Execute failed: " . $stmt->error);

        $filas = $stmt->affected_rows;
        $stmt->close();
        return $ok && $filas >= 0;
    }

    /** ELIMINAR (si no tiene dependencias) */
    public static function eliminarTramite(int $id): bool
    {
        $mysqli = db();
        $stmt = $mysqli->prepare("DELETE FROM tramites WHERE id_tramite = ?");
        if (!$stmt) throw new \RuntimeException("Prepare failed: " . $mysqli->error);

        $stmt->bind_param("i", $id);
        $ok = $stmt->execute();
        if (!$ok) throw new \RuntimeException("Execute failed: " . $stmt->error);

        $filas = $stmt->affected_rows;
        $stmt->close();
        return $ok && $filas > 0;
    }

    /** BUSCAR por nombre */
    public static function buscarTramite(string $term, int $limit = 50, int $offset = 0): array
    {
        $mysqli = db();
        $sql = "SELECT id_tramite AS id, nombre, descripcion
                FROM tramites
                WHERE nombre COLLATE utf8mb4_0900_ai_ci LIKE CONCAT('%', ?, '%')
                ORDER BY nombre ASC
                LIMIT ? OFFSET ?";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \RuntimeException('Prepare failed: ' . $mysqli->error);

        $stmt->bind_param("sii", $term, $limit, $offset);
        if (!$stmt->execute()) throw new \RuntimeException('Execute failed: ' . $stmt->error);

        $res = $stmt->get_result();
        $data = [];
        while ($row = $res->fetch_assoc()) $data[] = $row;
        $stmt->close();
        return $data;
    }
    
    /** OBTENER TODOS los tramites */
    public static function obtenerTodosTramites(): array
    {
        $mysqli = db();
        $sql = "SELECT id_tramite AS id, nombre, descripcion, id_area
                FROM tramites
                ORDER BY nombre ASC";
        $res = $mysqli->query($sql);
        if (!$res) throw new \RuntimeException("Query failed: " . $mysqli->error);
        $data = $res->fetch_all(MYSQLI_ASSOC);
        $res->close();
        return $data ?: [];
    }
    
    /** OBTENER TRÁMITES por Área */
    public static function obtenerTramitesPorArea(int $id_area): array
    {
        $mysqli = db();
        $sql = "SELECT id_tramite AS id, nombre, descripcion
                FROM tramites
                WHERE id_area = ?
                ORDER BY nombre ASC";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \RuntimeException("Prepare failed: " . $mysqli->error);

        $stmt->bind_param("i", $id_area);
        if (!$stmt->execute()) throw new \RuntimeException("Execute failed: " . $stmt->error);

        $res = $stmt->get_result();
        $data = [];
        while ($row = $res->fetch_assoc()) $data[] = $row;
        $stmt->close();
        return $data;
    }



}
