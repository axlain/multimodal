<?php
namespace App\Instancia\Models;
require_once __DIR__ . '/../../config/database.php';
use App\Archivo\Models\Archivo;
class Instancia
{
    /** Crear una instancia (iniciar trámite) */
    public static function crear(int $id_tramite, string $maestro_nombre, ?int $solicitante_id = null): int
    {
        $mysqli = db();
        $sql = "INSERT INTO tramites_instancias (id_tramite, maestro_nombre, solicitante_id)
                VALUES (?, ?, ?)";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \RuntimeException("Prepare failed: " . $mysqli->error);

        // solicitante_id puede ser null -> usa "isi" pero pasando null
        $stmt->bind_param("isi", $id_tramite, $maestro_nombre, $solicitante_id);
        if (!$stmt->execute()) throw new \RuntimeException("Execute failed: " . $stmt->error);

        $id = (int)$mysqli->insert_id;
        $stmt->close();
        return $id;
    }

    /** Obtener datos básicos de la instancia + datos del trámite */
    public static function obtener(int $id_instancia): ?array
    {
        $mysqli = db();
        $sql = "SELECT i.id_instancia, i.id_tramite, i.maestro_nombre, i.solicitante_id, i.estado,
                       i.created_at, i.updated_at, t.nombre AS nombre_tramite, t.descripcion
                FROM tramites_instancias i
                JOIN tramites t ON t.id_tramite = i.id_tramite
                WHERE i.id_instancia = ?";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \RuntimeException("Prepare failed: " . $mysqli->error);

        $stmt->bind_param("i", $id_instancia);
        if (!$stmt->execute()) throw new \RuntimeException("Execute failed: " . $stmt->error);

        $res = $stmt->get_result();
        $row = $res->fetch_assoc() ?: null;
        $stmt->close();
        return $row;
    }

    /** Buscar instancias por nombre de maestro */
    public static function buscarPorMaestro(string $q, int $limit = 50, int $offset = 0): array
    {
        $mysqli = db();
        $sql = "SELECT i.id_instancia, i.id_tramite, i.maestro_nombre, i.estado, i.created_at,
                       t.nombre AS nombre_tramite
                FROM tramites_instancias i
                JOIN tramites t ON t.id_tramite = i.id_tramite
                WHERE i.maestro_nombre LIKE CONCAT('%', ?, '%')
                ORDER BY i.created_at DESC
                LIMIT ? OFFSET ?";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \RuntimeException('Prepare failed: ' . $mysqli->error);

        $stmt->bind_param("sii", $q, $limit, $offset);
        if (!$stmt->execute()) throw new \RuntimeException('Execute failed: ' . $stmt->error);

        $res = $stmt->get_result();
        $data = [];
        while ($row = $res->fetch_assoc()) $data[] = $row;
        $stmt->close();
        return $data;
    }

    /** Listar instancias creadas por un usuario (opcional) */
    public static function listarPorUsuario(int $solicitante_id): array
    {
        $mysqli = db();
        $sql = "SELECT i.id_instancia, i.id_tramite, i.maestro_nombre, i.estado, i.created_at,
                       t.nombre AS nombre_tramite
                FROM tramites_instancias i
                JOIN tramites t ON t.id_tramite = i.id_tramite
                WHERE i.solicitante_id = ?
                ORDER BY i.created_at DESC";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \RuntimeException("Prepare failed: " . $mysqli->error);

        $stmt->bind_param("i", $solicitante_id);
        if (!$stmt->execute()) throw new \RuntimeException("Execute failed: " . $stmt->error);

        $res = $stmt->get_result();
        $data = $res->fetch_all(MYSQLI_ASSOC) ?: [];
        $stmt->close();
        return $data;
    }

    public static function listarPorTramite(int $id_tramite): array
    {
        $mysqli = db();
        $sql = "SELECT i.id_instancia, i.id_tramite, i.maestro_nombre, i.estado, i.created_at,
                    t.nombre AS nombre_tramite
                FROM tramites_instancias i
                JOIN tramites t ON t.id_tramite = i.id_tramite
                WHERE i.id_tramite = ?
                ORDER BY i.created_at DESC";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \RuntimeException("Prepare failed: " . $mysqli->error);
        $stmt->bind_param("i", $id_tramite);
        if (!$stmt->execute()) throw new \RuntimeException("Execute failed: " . $stmt->error);
        $res = $stmt->get_result();
        $data = $res->fetch_all(MYSQLI_ASSOC) ?: [];
        $stmt->close();
        return $data;
    }

    // 🔹 NUEVO MÉTODO: Finalizar instancia
     public static function finalizar(int $id_instancia): bool
    {
        if ($id_instancia <= 0) {
            throw new \RuntimeException('ID inválido', 400);
        }

        // 👇 delega toda la validación y actualización a Archivo::verificarYCompletarInstancia
        Archivo::verificarYCompletarInstancia($id_instancia);
        return true;
    }
}