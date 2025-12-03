<?php
namespace App\Tramite\Services;

use App\Tramite\Models\Tramite;

class TramiteService
{
   // Crear tramite
    public static function crearTramite(array $data): int
    {
        $nombre = trim($data['nombre'] ?? '');
        $descripcion = $data['descripcion'] ?? null;
        $id_area = (int)($data['id_area'] ?? 0);

        if ($nombre === '') throw new \RuntimeException('El nombre es requerido', 400);
        if ($id_area <= 0) throw new \RuntimeException('El área es requerida', 400);

        return Tramite::crearTramite($nombre, $descripcion, $id_area);
    }

    // Editar tramite
    public static function editarTramite(int $id, array $data): bool
    {
        $permitidos = ['nombre', 'descripcion', 'id_area'];
        $payload = array_intersect_key($data, array_flip($permitidos));

        return Tramite::editarTramite($id, $payload);
    }

    // Eliminar tramite
    public static function eliminarTramite(int $id): bool
    {
        return Tramite::eliminarTramite($id);
    }

    // Buscar tramite
    public static function buscarTramite(string $term): array
    {
        return Tramite::buscarTramite($term);
    }

    // Obtener todos los tramites
    public static function obtenerTodosTramites(): array
    {
        return Tramite::obtenerTodosTramites();
    }
    
    // Obtener tramites por área
    public static function obtenerTramitesPorArea(int $id_area): array
    {
        return Tramite::obtenerTramitesPorArea($id_area);
    }



}
