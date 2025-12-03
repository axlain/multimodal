<?php
namespace App\Area\Models;

require_once __DIR__ . '/../../config/database.php';

class Area
{
    /** CREAR */
    public static function crearArea(string $nombre, ?string $descripcion): int
    {
        $mysqli = db();
        $sql = "INSERT INTO areas (nombre, descripcion) VALUES (?, ?)";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \RuntimeException("Prepare failed: " . $mysqli->error);

        $stmt->bind_param("ss", $nombre, $descripcion);
        if (!$stmt->execute()) throw new \RuntimeException("Execute failed: " . $stmt->error);

        $id = $mysqli->insert_id;
        $stmt->close();
        return $id;
    }

    /** EDITAR (parcial) */
    public static function editarArea(int $id, array $data): bool
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
        if (array_key_exists('descripcion', $data)) {
            $sets[] = "descripcion = ?";
            $tipos .= 's';
            $params[] = $data['descripcion']; // puede ser null
        }

        if (empty($sets)) return false;

        $sql = "UPDATE areas SET " . implode(', ', $sets) . " WHERE id_area = ?";
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
    public static function eliminarArea(int $id): bool
    {
        $mysqli = db();

        // Validaciones: usuarios y trámites asociados
        $chk1 = $mysqli->prepare("SELECT COUNT(*) FROM usuarios WHERE id_area = ?");
        $chk1->bind_param("i", $id);
        $chk1->execute();
        $chk1->bind_result($cUsers);
        $chk1->fetch();
        $chk1->close();

        $chk2 = $mysqli->prepare("SELECT COUNT(*) FROM tramites WHERE id_area = ?");
        $chk2->bind_param("i", $id);
        $chk2->execute();
        $chk2->bind_result($cTrams);
        $chk2->fetch();
        $chk2->close();

        if ($cUsers > 0 || $cTrams > 0) {
            throw new \RuntimeException("No se puede eliminar: hay usuarios o trámites asociados");
        }

        $stmt = $mysqli->prepare("DELETE FROM areas WHERE id_area = ?");
        if (!$stmt) throw new \RuntimeException("Prepare failed: " . $mysqli->error);
        $stmt->bind_param("i", $id);
        $ok = $stmt->execute();
        if (!$ok) throw new \RuntimeException("Execute failed: " . $stmt->error);

        $filas = $stmt->affected_rows;
        $stmt->close();
        return $ok && $filas > 0;
    }

    /** BUSCAR por nombre */
    public static function buscarArea(string $term, int $limit = 50, int $offset = 0): array
    {
        $mysqli = db();
        $sql = "SELECT id_area AS id, nombre, descripcion
                FROM areas
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

    /** OBTENER TODAS */
    public static function obtenerTodasAreas(): array
    {
        $mysqli = db();
        $sql = "SELECT id_area AS id, nombre, descripcion
                FROM areas
                ORDER BY id_area DESC";
        $res = $mysqli->query($sql);
        if (!$res) throw new \RuntimeException("Query failed: " . $mysqli->error);
        $data = $res->fetch_all(MYSQLI_ASSOC);
        $res->close();
        return $data ?: [];
    }

    /** MOSTRAR NOMBRE por ID */
    public static function mostrarNombreArea(int $id): ?string
    {
        $mysqli = db();
        $sql = "SELECT nombre FROM areas WHERE id_area = ?";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \RuntimeException("Prepare failed: " . $mysqli->error);

        $stmt->bind_param("i", $id);
        if (!$stmt->execute()) throw new \RuntimeException("Execute failed: " . $stmt->error);

        $stmt->bind_result($nombre);
        $tiene = $stmt->fetch();
        $stmt->close();
        return $tiene ? $nombre : null;
    }

    /** USUARIOS del área */
    public static function obtenerUsuariosPorArea(int $id_area): array
    {
        $mysqli = db();
        $sql = "SELECT id_usuario AS id, nombre, email, rol
                FROM usuarios
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

    /** TRÁMITES del área */
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
    /** OBTENER ÁREA por ID o Nombre de Usuario */
    public static function obtenerAreaPorUsuario(string $term): ?array
    {
        $mysqli = db();
        $sql = "SELECT a.id_area, a.nombre AS area_nombre
                FROM usuarios u
                JOIN areas a ON u.id_area = a.id_area
                WHERE u.id_usuario = ? OR u.nombre COLLATE utf8mb4_0900_ai_ci = ?";

        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \RuntimeException("Prepare failed: " . $mysqli->error);

        $stmt->bind_param("ss", $term, $term);
        if (!$stmt->execute()) throw new \RuntimeException("Execute failed: " . $stmt->error);

        $res = $stmt->get_result();
        $data = $res->fetch_assoc();
        $stmt->close();
        
        return $data ?: null;
    }

}
