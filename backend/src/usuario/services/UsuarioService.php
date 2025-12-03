<?php
namespace App\Usuario\Services;

use App\Usuario\Models\Usuario;

class UsuarioService
{
    public static function crearUsuario(array $data): int
    {
        return Usuario::crearUsuario(
            $data['nombre'] ?? '',
            $data['email'] ?? '',
            $data['password'] ?? '',
            (int)($data['id_area'] ?? 0),
            $data['rol'] ?? ''
        );
    }

    public static function editarUsuario(int $id, array $data): bool
    {
        // Filtrar sólo campos válidos
        $permitidos = ['nombre','email','password','id_area','rol'];
        $payload = array_intersect_key($data, array_flip($permitidos));
        return Usuario::editarUsuario($id, $payload);
    }

    public static function eliminarUsuario(int $id): bool
    {
        return Usuario::eliminarUsuario($id);
    }

    public static function buscarUsuario(string $term): array
    {
        return Usuario::buscarUsuario($term);
    }

    public static function obtenerTodosUsuarios(): array
    {
        return Usuario::obtenerTodosUsuarios();
    }

    public static function mostrarNombreUsuario(int $id): ?string
    {
        return Usuario::mostrarNombreUsuario($id);
    }

    public static function loginUsuario(array $data): ?array
    {
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        return Usuario::loginUsuario($email, $password);
    }

    public static function cambiarPassword(int $id, array $data): bool
    {
        $actual = $data['password_actual'] ?? '';
        $nueva  = $data['password_nueva'] ?? '';
        if ($id <= 0 || $actual === '' || $nueva === '') {
            return false;
        }
        return Usuario::cambiarPassword($id, $actual, $nueva);
    }

        public static function obtenerUsuarioPorId(int $id): ?array
    {
        if ($id <= 0) return null;
        return Usuario::obtenerUsuarioPorId($id);
    }

    // Opcional, por si te sirve en otros flujos
    public static function obtenerUsuarioPorEmail(string $email): ?array
    {
        $email = trim(strtolower($email ?? ''));
        if ($email === '') return null;
        return Usuario::obtenerUsuarioPorEmail($email);
    }

}
