<?php
namespace App\Tramite\Services;

use App\Tramite\Models\Requisito;
use App\Tramite\Models\DatosTramite;

class RequisitoService
{
    // Agregar un nuevo requisito
    public static function agregarRequisito(int $id_tramite, string $titulo, string $tipo, bool $obligatorio, int $orden): int
    {
        return Requisito::agregarRequisito($id_tramite, $titulo, $tipo, $obligatorio, $orden);
    }

    // Editar un requisito
    public static function editarRequisito(int $id_requisito, array $data): bool
    {
        return Requisito::editarRequisito($id_requisito, $data);
    }

    // Eliminar un requisito
    public static function eliminarRequisito(int $id_requisito): bool
    {
        return Requisito::eliminarRequisito($id_requisito);
    }

    // Llenar un requisito con valor
    public static function llenarRequisito(int $id_tramite, int $id_requisito, string $valor): bool
    {
        return DatosTramite::llenarRequisito($id_tramite, $id_requisito, $valor);
    }

    // Editar un dato de un requisito
    public static function editarDato(int $id_tramite, int $id_requisito, string $valor): bool
    {
        return DatosTramite::editarDato($id_tramite, $id_requisito, $valor);
    }

    public static function obtenerRequisitosPorTramite(int $id_tramite): array
    {
        return Requisito::obtenerRequisitosPorTramite($id_tramite);
    }

}
