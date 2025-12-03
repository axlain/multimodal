<?php
namespace App\Escuela\Models;

require_once __DIR__ . '/../../config/database.php';

class Escuela
{
    /** Crear y devolver ID */
    public static function crear(string $nombre, string $clave): int
    {
        $mysqli = db();
        $sql = "INSERT INTO escuelas (nombre, clave) VALUES (?, ?)";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \Exception($mysqli->error);
        $stmt->bind_param('ss', $nombre, $clave);
        if (!$stmt->execute()) throw new \Exception($stmt->error);
        return $stmt->insert_id;
    }

    /** Editar parcialmente; $data = ['nombre'=>..., 'clave'=>..., 'activo'=>0/1] */
    public static function editar(int $id_escuela, array $data): bool
    {
        if (!$data) return true;

        $allowed = ['nombre','clave','activo'];
        $sets = [];
        $types = '';
        $vals  = [];
        foreach ($data as $k => $v) {
            if (!in_array($k, $allowed, true)) continue;
            $sets[] = "$k = ?";
            $types .= is_int($v) ? 'i' : 's';
            $vals[] = $v;
        }
        if (!$sets) return true;

        $mysqli = db();
        $sql = "UPDATE escuelas SET " . implode(', ', $sets) . " WHERE id_escuela = ?";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \Exception($mysqli->error);

        $types .= 'i';
        $vals[] = $id_escuela;
        $stmt->bind_param($types, ...$vals);
        if (!$stmt->execute()) throw new \Exception($stmt->error);

        return $stmt->affected_rows >= 0;
    }

    /** Baja lógica */
    public static function eliminar(int $id_escuela): bool
    {
        $mysqli = db();
        $stmt = $mysqli->prepare("UPDATE escuelas SET activo = 0 WHERE id_escuela = ?");
        if (!$stmt) throw new \Exception($mysqli->error);
        $stmt->bind_param('i', $id_escuela);
        if (!$stmt->execute()) throw new \Exception($stmt->error);
        return $stmt->affected_rows >= 0;
    }

    /** Obtener uno por ID */
    public static function obtenerPorId(int $id_escuela): ?array
    {
        $mysqli = db();
        $stmt = $mysqli->prepare("SELECT * FROM escuelas WHERE id_escuela = ?");
        if (!$stmt) throw new \Exception($mysqli->error);
        $stmt->bind_param('i', $id_escuela);
        if (!$stmt->execute()) throw new \Exception($stmt->error);
        $res = $stmt->get_result();
        $row = $res->fetch_assoc();
        return $row ?: null;
    }

    /** Buscar por nombre/clave */
    public static function buscar(string $q, int $limit = 20, int $offset = 0): array
    {
        $qLike = '%' . $q . '%';
        $mysqli = db();
        $sql = "SELECT * FROM escuelas
                WHERE activo = 1 AND (nombre LIKE ? OR clave LIKE ?)
                ORDER BY nombre
                LIMIT ? OFFSET ?";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \Exception($mysqli->error);
        $stmt->bind_param('ssii', $qLike, $qLike, $limit, $offset);
        if (!$stmt->execute()) throw new \Exception($stmt->error);
        $res = $stmt->get_result();
        return $res->fetch_all(MYSQLI_ASSOC) ?: [];
    }

    /** Listar todas (activas) */
    public static function obtenerTodos(int $limit = 100, int $offset = 0): array
    {
        $mysqli = db();
        $stmt = $mysqli->prepare("SELECT * FROM escuelas WHERE activo = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?");
        if (!$stmt) throw new \Exception($mysqli->error);
        $stmt->bind_param('ii', $limit, $offset);
        if (!$stmt->execute()) throw new \Exception($stmt->error);
        $res = $stmt->get_result();
        return $res->fetch_all(MYSQLI_ASSOC) ?: [];
    }

    /** ¿Existe CLAVE? (para unicidad) */
    public static function existeClave(string $clave, ?int $excluirId = null): bool
    {
        $mysqli = db();
        if ($excluirId) {
            $stmt = $mysqli->prepare("SELECT 1 FROM escuelas WHERE clave = ? AND id_escuela <> ? LIMIT 1");
            if (!$stmt) throw new \Exception($mysqli->error);
            $stmt->bind_param('si', $clave, $excluirId);
        } else {
            $stmt = $mysqli->prepare("SELECT 1 FROM escuelas WHERE clave = ? LIMIT 1");
            if (!$stmt) throw new \Exception($mysqli->error);
            $stmt->bind_param('s', $clave);
        }
        if (!$stmt->execute()) throw new \Exception($stmt->error);
        $res = $stmt->get_result();
        return (bool)$res->fetch_row();
    }

    /** Obtener por clave (útil para front) */
    public static function obtenerPorClave(string $clave): ?array
    {
        $mysqli = db();
        $stmt = $mysqli->prepare("SELECT * FROM escuelas WHERE clave = ? LIMIT 1");
        if (!$stmt) throw new \Exception($mysqli->error);
        $stmt->bind_param('s', $clave);
        if (!$stmt->execute()) throw new \Exception($stmt->error);
        $res = $stmt->get_result();
        $row = $res->fetch_assoc();
        return $row ?: null;
    }
}
