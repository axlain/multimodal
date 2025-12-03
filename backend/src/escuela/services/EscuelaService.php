<?php
namespace App\Escuela\Services;

use App\Escuela\Models\Escuela;

class EscuelaService
{
    private static function normalizarClave(string $clave): string
    {
        return strtoupper(trim($clave));
    }

    public static function crear(array $input): int
    {
        $nombre = trim((string)($input['nombre'] ?? ''));
        $clave  = self::normalizarClave((string)($input['clave'] ?? ''));

        if ($nombre === '' || $clave === '') {
            throw new \Exception('Faltan campos obligatorios: nombre y clave');
        }
        if (Escuela::existeClave($clave)) {
            throw new \Exception('La clave ya existe');
        }
        return Escuela::crear($nombre, $clave);
    }

    public static function editar(int $id_escuela, array $input): bool
    {
        $data = [];
        if (array_key_exists('nombre', $input)) $data['nombre'] = trim((string)$input['nombre']);
        if (array_key_exists('clave', $input)) {
            $clave = self::normalizarClave((string)$input['clave']);
            if ($clave !== '' && Escuela::existeClave($clave, $id_escuela)) {
                throw new \Exception('La clave ya existe');
            }
            $data['clave'] = $clave;
        }
        if (array_key_exists('activo', $input)) $data['activo'] = (int)!!$input['activo'];
        if (!$data) return true;
        return Escuela::editar($id_escuela, $data);
    }

    public static function eliminar(int $id_escuela): bool
    {
        // Aquí podrías validar dependencias (si en el futuro se relaciona).
        return Escuela::eliminar($id_escuela);
    }

    public static function buscar(string $q, int $limit = 20, int $offset = 0): array
    {
        return Escuela::buscar($q, $limit, $offset);
    }

    public static function obtenerTodos(int $limit = 100, int $offset = 0): array
    {
        return Escuela::obtenerTodos($limit, $offset);
    }

    public static function detalle(int $id_escuela): ?array
    {
        return Escuela::obtenerPorId($id_escuela);
    }

    public static function porClave(string $clave): ?array
    {
        $clave = self::normalizarClave($clave);
        return Escuela::obtenerPorClave($clave);
    }
}
