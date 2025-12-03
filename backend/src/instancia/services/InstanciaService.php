<?php
namespace App\Instancia\Services;

use App\Instancia\Models\Instancia;
use App\Instancia\Models\DatosInstancia;

class InstanciaService
{
    public static function crear(int $id_tramite, string $maestro_nombre, ?int $solicitante_id = null): int
    {
        $maestro_nombre = trim($maestro_nombre);
        if ($id_tramite <= 0) throw new \RuntimeException('Trámite inválido', 400);
        if ($maestro_nombre === '') throw new \RuntimeException('Nombre de maestro requerido', 400);

        return Instancia::crear($id_tramite, $maestro_nombre, $solicitante_id);
    }

    public static function obtener(int $id_instancia): array
    {
        $inst = Instancia::obtener($id_instancia);
        if (!$inst) throw new \RuntimeException('Instancia no encontrada', 404);
        return $inst;
    }

    public static function requisitosConValores(int $id_instancia): array
    {
        return DatosInstancia::obtenerConRequisitos($id_instancia);
    }

    public static function upsertValor(int $id_instancia, int $id_requisito, string $valor): bool
    {
        return DatosInstancia::upsert($id_instancia, $id_requisito, $valor);
    }

    public static function buscarPorMaestro(string $q): array
    {
        $q = trim($q);
        if ($q === '') return [];
        return Instancia::buscarPorMaestro($q);
    }

    public static function listarPorUsuario(int $solicitante_id): array
    {
        return Instancia::listarPorUsuario($solicitante_id);
    }

    public static function listarPorTramite(int $id_tramite): array
    {
        if ($id_tramite <= 0) throw new \RuntimeException('Trámite inválido', 400);
            return Instancia::listarPorTramite($id_tramite);
    }
    public static function finalizar(int $id_instancia): bool
    {
        if ($id_instancia <= 0) {
            throw new \RuntimeException('ID inválido', 400);
        }

        return Instancia::finalizar($id_instancia);
    }

    // Ejemplo: src/instancia/services/InstanciaService.php
    public static function listarInstanciasUsuario(int $idUsuario): array
    {
        $db = db();
        $sql = "
            SELECT 
                i.id_instancia,
                i.id_tramite,
                i.maestro_nombre,
                i.estado,
                i.constancia_path,
                i.created_at,
                t.nombre AS nombre_tramite,
                a.nombre AS area_nombre,
                c.id AS id_constancia,
                c.nombre_archivo AS constancia_nombre
            FROM tramites_instancias i
            INNER JOIN tramites t ON i.id_tramite = t.id_tramite
            LEFT JOIN areas a ON t.id_area = a.id_area
            LEFT JOIN constancias c ON c.id_tramite = i.id_tramite
            WHERE i.solicitante_id = ?
            ORDER BY i.created_at DESC
        ";

        $stmt = $db->prepare($sql);
        $stmt->bind_param("i", $idUsuario);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    }



}
