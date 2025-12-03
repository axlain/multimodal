<?php
namespace App\Maestro\Models;

require_once __DIR__ . '/../../config/database.php';

class Maestro
{
    /** Crear y devolver ID insertado */
   public static function crear(string $nombre, string $ap_paterno, ?string $ap_materno, ?string $rfc, ?string $numero_de_personal): int
    {
        $mysqli = db();
        $sql = "INSERT INTO maestros (nombre, ap_paterno, ap_materno, rfc, numero_de_personal) VALUES (?,?,?,?,?)";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \Exception($mysqli->error);
        $stmt->bind_param('sssss', $nombre, $ap_paterno, $ap_materno, $rfc, $numero_de_personal);
        if (!$stmt->execute()) throw new \Exception($stmt->error);
        return $stmt->insert_id;
    }

    /** Editar parcialmente; $data = ['nombre'=>..., 'ap_paterno'=>..., 'ap_materno'=>..., 'rfc'=>..., 'activo'=>0/1] */
    public static function editar(int $id_maestro, array $data): bool
    {
        if (!$data) return false;

        $allowed = ['nombre','ap_paterno','ap_materno','rfc','activo','numero_de_personal'];
        $sets = [];
        $types = '';
        $vals  = [];
        foreach ($data as $k => $v) {
            if (!in_array($k, $allowed, true)) continue;
            $sets[] = "$k = ?";
            $types .= is_int($v) ? 'i' : 's';
            $vals[] = $v;
        }
        if (!$sets) return false;

        $mysqli = db();
        $sql = "UPDATE maestros SET " . implode(', ', $sets) . " WHERE id_maestro = ?";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \Exception($mysqli->error);

        $types .= 'i';
        $vals[] = $id_maestro;
        $stmt->bind_param($types, ...$vals);
        if (!$stmt->execute()) throw new \Exception($stmt->error);

        return $stmt->affected_rows >= 0;
    }

    /** Baja lógica (activo=0). Si quieres borrado físico, cambia el SQL. */
    public static function eliminar(int $id_maestro): bool
    {
        $mysqli = db();
        // Cambiar el UPDATE por DELETE
        $stmt = $mysqli->prepare("DELETE FROM maestros WHERE id_maestro = ?");
        if (!$stmt) throw new \Exception($mysqli->error);
        $stmt->bind_param('i', $id_maestro);
        if (!$stmt->execute()) throw new \Exception($stmt->error);
        return $stmt->affected_rows > 0; // Si se eliminó el registro, affected_rows será mayor a 0
    }


    /** Obtener uno */
    public static function obtenerPorId(int $id_maestro): ?array
    {
        $mysqli = db();
        $stmt = $mysqli->prepare("SELECT * FROM maestros WHERE id_maestro = ?");
        if (!$stmt) throw new \Exception($mysqli->error);
        $stmt->bind_param('i', $id_maestro);
        if (!$stmt->execute()) throw new \Exception($stmt->error);
        $res = $stmt->get_result();
        $row = $res->fetch_assoc();
        return $row ?: null;
    }

    /** Buscar por nombre/apellidos/RFC con paginación */
    public static function buscar(string $q, int $limit = 20, int $offset = 0): array
    {
        $qLike = '%' . $q . '%';
        $mysqli = db();
        $sql = "SELECT * FROM maestros
                WHERE activo = 1 AND (nombre LIKE ? OR ap_paterno LIKE ? OR ap_materno LIKE ? OR rfc LIKE ?)
                ORDER BY nombre, ap_paterno, ap_materno
                LIMIT ? OFFSET ?";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \Exception($mysqli->error);
        $stmt->bind_param('ssssii', $qLike, $qLike, $qLike, $qLike, $limit, $offset);
        if (!$stmt->execute()) throw new \Exception($stmt->error);
        $res = $stmt->get_result();
        return $res->fetch_all(MYSQLI_ASSOC) ?: [];
    }

    /** Listar todos (activos) con paginación */
    public static function obtenerTodos(int $limit = 100, int $offset = 0): array
    {
        $mysqli = db();
        $stmt = $mysqli->prepare("SELECT * FROM maestros WHERE activo = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?");
        if (!$stmt) throw new \Exception($mysqli->error);
        $stmt->bind_param('ii', $limit, $offset);
        if (!$stmt->execute()) throw new \Exception($stmt->error);
        $res = $stmt->get_result();
        return $res->fetch_all(MYSQLI_ASSOC) ?: [];
    }

    /** ¿Existe RFC? (para validar unicidad) */
    public static function existeRFC(string $rfc, ?int $excluirId = null): bool
    {
        $mysqli = db();
        if ($excluirId) {
            $stmt = $mysqli->prepare("SELECT 1 FROM maestros WHERE rfc = ? AND id_maestro <> ? LIMIT 1");
            if (!$stmt) throw new \Exception($mysqli->error);
            $stmt->bind_param('si', $rfc, $excluirId);
        } else {
            $stmt = $mysqli->prepare("SELECT 1 FROM maestros WHERE rfc = ? LIMIT 1");
            if (!$stmt) throw new \Exception($mysqli->error);
            $stmt->bind_param('s', $rfc);
        }
        if (!$stmt->execute()) throw new \Exception($stmt->error);
        $res = $stmt->get_result();
        return (bool)$res->fetch_row();
    }
}
