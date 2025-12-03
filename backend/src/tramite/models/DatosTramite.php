<?php
namespace App\Tramite\Models;
require_once __DIR__ . '/../../config/database.php';
class DatosTramite
{
    /** LLENAR un dato de un requisito para un trámite */
    public static function llenarRequisito(int $id_tramite, int $id_requisito, string $valor): bool
    {
        $mysqli = db();
        $sql = "INSERT INTO datos_tramite (id_tramite, id_requisito, valor) VALUES (?, ?, ?)";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \RuntimeException("Prepare failed: " . $mysqli->error);

        $stmt->bind_param("iis", $id_tramite, $id_requisito, $valor);
        if (!$stmt->execute()) throw new \RuntimeException("Execute failed: " . $stmt->error);

        $stmt->close();
        return true;
    }

    /** EDITAR un dato de un requisito ya existente */
    public static function editarDato(int $id_tramite, int $id_requisito, string $valor): bool
    {
        $mysqli = db();
        $sql = "UPDATE datos_tramite SET valor = ? WHERE id_tramite = ? AND id_requisito = ?";
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) throw new \RuntimeException("Prepare failed: " . $mysqli->error);

        $stmt->bind_param("sii", $valor, $id_tramite, $id_requisito);
        if (!$stmt->execute()) throw new \RuntimeException("Execute failed: " . $stmt->error);

        $stmt->close();
        return true;
    }
}
