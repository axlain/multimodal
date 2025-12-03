<?php
namespace App\Area\Services;

use App\Area\Models\Area;

class AreaService
{
    public static function crearArea(array $data): int
    {
        $nombre = trim($data['nombre'] ?? '');
        $descripcion = $data['descripcion'] ?? null;

        if ($nombre === '') throw new \RuntimeException('El nombre es requerido', 400);
        if (mb_strlen($nombre) > 100) throw new \RuntimeException('Nombre demasiado largo', 400);

        return Area::crearArea($nombre, $descripcion);
    }

    public static function editarArea(int $id, array $data): bool
    {
        $permitidos = ['nombre','descripcion'];
        $payload = array_intersect_key($data, array_flip($permitidos));

        if (isset($payload['nombre'])) {
            $payload['nombre'] = trim($payload['nombre']);
            if ($payload['nombre'] === '') throw new \RuntimeException('Nombre no puede estar vacío', 400);
            if (mb_strlen($payload['nombre']) > 100) throw new \RuntimeException('Nombre demasiado largo', 400);
        }
        if (array_key_exists('descripcion', $payload) && $payload['descripcion'] === '') {
            $payload['descripcion'] = null; // permitir limpiar
        }

        return Area::editarArea($id, $payload);
    }

    public static function eliminarArea(int $id): bool
    {
        return Area::eliminarArea($id);
    }

    public static function buscarArea(string $term): array
    {
        return Area::buscarArea($term);
    }

    public static function obtenerTodasAreas(): array
    {
        return Area::obtenerTodasAreas();
    }

    public static function mostrarNombreArea(int $id): ?string
    {
        return Area::mostrarNombreArea($id);
    }

    public static function obtenerUsuariosPorArea(int $id_area): array
    {
        return Area::obtenerUsuariosPorArea($id_area);
    }

    public static function obtenerTramitesPorArea(int $id_area): array
    {
        return Area::obtenerTramitesPorArea($id_area);
    }
    public static function obtenerAreaPorUsuario(string $term): ?array
    {
        return Area::obtenerAreaPorUsuario($term);
    }

    /**
     * Devuelve true si el área existe (por id).
     */
    public static function existeArea(int $id_area): bool
    {
        // Reusa el modelo: si hay nombre, el área existe
        return Area::mostrarNombreArea($id_area) !== null;
    }

    /**
     * (Opcional) Lanza excepción si no existe, para usarla en flujos críticos.
     */
    public static function assertExiste(int $id_area): void
    {
        if (!self::existeArea($id_area)) {
            throw new \RuntimeException("El área ($id_area) no existe");
        }
    }

}
