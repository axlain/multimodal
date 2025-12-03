<?php
namespace App\Maestro\Services;

use App\Maestro\Models\Maestro;

class MaestroService
{
    /** Validación simple de RFC (opcional) */
    private static function validarRFC(?string $rfc): ?string
    {
        if (!$rfc) return null;
        $rfc = strtoupper(trim($rfc));
        // Acepta 10 (moral) o 13 (física). Si no coincide, lo permitimos vacío.
        if (!preg_match('/^[A-ZÑ&]{3,4}\\d{6}[A-Z0-9]{2,3}$/', $rfc)) {
            // Puedes lanzar error si quieres obligarlo a formato: throw new \Exception('RFC inválido');
        }
        return $rfc;
    }

    public static function crear(array $input): int
    {
        $nombre     = trim((string)($input['nombre'] ?? ''));
        $ap_paterno = trim((string)($input['ap_paterno'] ?? ''));
        $ap_materno = isset($input['ap_materno']) ? trim((string)$input['ap_materno']) : null;
        $rfc        = isset($input['rfc']) ? self::validarRFC($input['rfc']) : null;
        $numero_de_personal = trim((string)($input['numero_de_personal'] ?? ''));

        if ($nombre === '' || $ap_paterno === '' || $numero_de_personal === '') {
            throw new \Exception('Faltan campos obligatorios: nombre, ap_paterno y numero_de_personal');
        }
        if ($rfc && Maestro::existeRFC($rfc)) {
            throw new \Exception('El RFC ya existe');
        }
        return Maestro::crear($nombre, $ap_paterno, $ap_materno, $rfc, $numero_de_personal);
    }

    public static function editar(int $id_maestro, array $input): bool
    {
        $data = [];
        foreach (['nombre','ap_paterno','ap_materno','numero_de_personal'] as $k) {
            if (array_key_exists($k, $input)) $data[$k] = $input[$k] === null ? null : trim((string)$input[$k]);
        }
        if (array_key_exists('rfc', $input)) {
            $rfc = self::validarRFC($input['rfc']);
            if ($rfc && Maestro::existeRFC($rfc, $id_maestro)) {
                throw new \Exception('El RFC ya existe');
            }
            $data['rfc'] = $rfc;
        }
        if (array_key_exists('activo', $input)) {
            $data['activo'] = (int)!!$input['activo'];
        }
        if (!$data) return true; // nada que actualizar
        return Maestro::editar($id_maestro, $data);
    }

    public static function eliminar(int $id_maestro): bool
    {
        // Aquí podrías validar dependencias antes de eliminar.
        return Maestro::eliminar($id_maestro);
    }

    public static function buscar(string $q, int $limit = 20, int $offset = 0): array
    {
        return Maestro::buscar($q, $limit, $offset);
    }

    public static function obtenerTodos(int $limit = 100, int $offset = 0): array
    {
        return Maestro::obtenerTodos($limit, $offset);
    }

    public static function detalle(int $id_maestro): ?array
    {
        return Maestro::obtenerPorId($id_maestro);
    }
}
