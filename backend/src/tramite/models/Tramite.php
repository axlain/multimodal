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

    /** OBTENER TODOS los trámites */
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

    /** OBTENER DETALLE por ID */
    public static function obtenerPorId(int $id_tramite): ?array
    {
        $mysqli = db();

        $sql = "SELECT t.id_tramite, t.nombre AS nombre_tramite, t.descripcion, 
                       t.id_area, t.estado, a.nombre AS area_nombre
                FROM tramites t
                JOIN areas a ON a.id_area = t.id_area
                WHERE t.id_tramite = ?";
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("i", $id_tramite);
        $stmt->execute();
        $tramite = $stmt->get_result()->fetch_assoc();

        if (!$tramite) return null;

        // Último maestro asociado
        $stmt2 = $mysqli->prepare("
            SELECT mi.maestro_nombre, m.rfc, m.numero_de_personal
            FROM tramites_instancias mi
            LEFT JOIN maestros m ON m.nombre = mi.maestro_nombre
            WHERE mi.id_tramite = ?
            ORDER BY mi.created_at DESC
            LIMIT 1
        ");
        $stmt2->bind_param("i", $id_tramite);
        $stmt2->execute();
        $maestro = $stmt2->get_result()->fetch_assoc();

        return array_merge($tramite, [
            'nombre_personal' => $maestro['maestro_nombre'] ?? '',
            'rfc' => $maestro['rfc'] ?? '',
            'numero_personal' => $maestro['numero_de_personal'] ?? ''
        ]);
    }

    /** VERIFICAR si tiene archivos completos */
    public static function tieneArchivosCompletos(int $id_tramite): bool
    {
        $mysqli = db();
        $sql = "SELECT COUNT(*) AS subidos, 
                       (SELECT COUNT(*) FROM requisitos WHERE id_tramite = ?) AS totales
                FROM archivos WHERE id_tramite = ?";
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("ii", $id_tramite, $id_tramite);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        return $row && (int)$row['subidos'] >= (int)$row['totales'];
    }

    /** 🔹 OBTENER DATOS COMPLETOS PARA CONSTANCIA */
    public static function obtenerDatosParaConstancia(int $id_instancia): ?array
    {
        $mysqli = db();

        $sql = "
            SELECT 
                ti.id_instancia,
                ti.id_tramite,
                ti.maestro_nombre AS nombre_personal,
                ti.estado,
                ti.created_at,
                t.nombre AS nombre_tramite,
                a.nombre AS area_nombre,
                u.nombre AS nombre_solicitante,
                u.email AS correo_solicitante,
                m.rfc,
                m.numero_de_personal
            FROM tramites_instancias ti
            JOIN tramites t ON t.id_tramite = ti.id_tramite
            LEFT JOIN areas a ON a.id_area = t.id_area
            LEFT JOIN usuarios u ON u.id_usuario = ti.solicitante_id
            LEFT JOIN maestros m ON m.nombre = ti.maestro_nombre
            WHERE ti.id_instancia = ?
            LIMIT 1
        ";

        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \RuntimeException("Prepare failed: " . $mysqli->error);
        $stmt->bind_param('i', $id_instancia);
        $stmt->execute();

        $res = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        return $res ?: null;
    }
}
