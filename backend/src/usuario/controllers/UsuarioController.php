<?php
namespace App\Usuario\Controllers;

use App\Usuario\Services\UsuarioService;
use App\Middleware\AuthMiddleware;

class UsuarioController
{
    /* ---------------------- NUEVO: registro público ---------------------- */
    public static function registrar()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $input = json_decode(file_get_contents('php://input'), true) ?? [];

            $nombre   = trim($input['nombre']  ?? '');
            $email    = strtolower(trim($input['email'] ?? ''));
            $password = (string)($input['password'] ?? '');
            $id_area  = isset($input['id_area']) ? (int)$input['id_area'] : 0;

            if ($nombre === '' || $email === '' || $password === '' || $id_area <= 0) {
                http_response_code(400);
                echo json_encode(['ok'=>false,'error'=>'Faltan nombre, email, password y/o id_area']);
                return;
            }

            // (Opcional) valida que el área exista para responder 400 bonito en vez de error SQL
            if (!\App\Area\Services\AreaService::existeArea($id_area)) {
                http_response_code(400);
                echo json_encode(['ok'=>false,'error'=>"El área ($id_area) no existe"]);
                return;
            }

            $payloadCrear = [
                'nombre'   => $nombre,
                'email'    => $email,
                'password' => $password,
                'id_area'  => $id_area,
                'rol'      => 'usuario',
            ];

            $id = UsuarioService::crearUsuario($payloadCrear);

            $usuario = UsuarioService::obtenerUsuarioPorId($id);
            $token   = AuthMiddleware::generarToken($usuario);

            http_response_code(201);
            echo json_encode(['ok'=>true,'id'=>$id,'data'=>$usuario,'token'=>$token], JSON_UNESCAPED_UNICODE);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 400);
            echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        }
    }


    /* --------- OPCIONAL: bootstrap del primer admin del sistema ---------- */
    // Si quieres permitir que el PRIMER usuario del sistema sea creado sin admin,
    // puedes descomentar el bloque $allowBootstrap más abajo en crearUsuario().

    public static function crearUsuario()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $payload = AuthMiddleware::verificarToken();
            $esAdmin = (($payload['usr']['rol'] ?? '') === 'administrador');

            // --- OPCIONAL (bootstrap primer admin):
            // $allowBootstrap = (UsuarioService::contarUsuarios() === 0);
            // if (!$esAdmin && !$allowBootstrap) { http_response_code(403); echo json_encode(['ok'=>false,'error'=>'Prohibido']); return; }

            if (!$esAdmin) { http_response_code(403); echo json_encode(['ok'=>false,'error'=>'Prohibido']); return; }

            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $id = UsuarioService::crearUsuario($input);
            http_response_code(201);
            echo json_encode(['ok'=>true,'id'=>$id], JSON_UNESCAPED_UNICODE);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 401); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        }
    }

    public static function index()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            AuthMiddleware::verificarToken();
            $usuarios = UsuarioService::obtenerTodosUsuarios();
            echo json_encode(['ok'=>true,'data'=>$usuarios], JSON_UNESCAPED_UNICODE);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 401); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        }
    }

    public static function buscar()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            AuthMiddleware::verificarToken();
            $term = trim($_GET['q'] ?? '');
            if ($term === '') { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Falta parámetro q']); return; }
            $res = UsuarioService::buscarUsuario($term);
            echo json_encode(['ok'=>true,'data'=>$res], JSON_UNESCAPED_UNICODE);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 401); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        }
    }

    public static function editar()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $payload = AuthMiddleware::verificarToken();
            $idToken = (int)($payload['usr']['id'] ?? 0);
            $rol     = $payload['usr']['rol'] ?? '';

            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $id = (int)($_GET['id'] ?? ($input['id'] ?? 0));
            if ($id <= 0) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'ID inválido']); return; }
            if ($id !== $idToken && $rol !== 'administrador') { http_response_code(403); echo json_encode(['ok'=>false,'error'=>'Prohibido']); return; }

            $payloadBody = $input; unset($payloadBody['id']);
            if (empty($payloadBody)) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'No hay campos para actualizar']); return; }

            $ok = UsuarioService::editarUsuario($id, $payloadBody);
            echo json_encode(['ok'=>$ok]);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 401); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        }
    }

    public static function eliminar()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $payload = AuthMiddleware::verificarToken();
            $esAdmin = (($payload['usr']['rol'] ?? '') === 'administrador');
            if (!$esAdmin) { http_response_code(403); echo json_encode(['ok'=>false,'error'=>'Prohibido']); return; }

            $id = (int)($_GET['id'] ?? 0);
            if ($id <= 0) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'ID inválido']); return; }

            $ok = UsuarioService::eliminarUsuario($id);
            if (!$ok) { http_response_code(404); echo json_encode(['ok'=>false,'error'=>'Usuario no encontrado']); return; }
            echo json_encode(['ok'=>true]);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 401); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        }
    }

    public static function mostrarNombre()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            AuthMiddleware::verificarToken();
            $id = (int)($_GET['id'] ?? 0);
            if ($id <= 0) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'ID inválido']); return; }
            $nombre = UsuarioService::mostrarNombreUsuario($id);
            if ($nombre === null) { http_response_code(404); echo json_encode(['ok'=>false,'error'=>'Usuario no encontrado']); return; }
            echo json_encode(['ok'=>true,'nombre'=>$nombre], JSON_UNESCAPED_UNICODE);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 401); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        }
    }

    public static function login()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            if (empty($input['email']) || empty($input['password'])) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Faltan email y/o password']); return; }

            $usuario = UsuarioService::loginUsuario($input);
            if ($usuario === null) { http_response_code(401); echo json_encode(['ok'=>false,'error'=>'Credenciales inválidas']); return; }

            $token = AuthMiddleware::generarToken($usuario);
            echo json_encode(['ok'=>true,'data'=>$usuario,'token'=>$token], JSON_UNESCAPED_UNICODE);
        } catch (\Throwable $e) {
            http_response_code(500); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        }
    }

    public static function cambiarPassword()
    {
        header('Content-Type: application/json; charset=utf-8');
        try {
            $payload = AuthMiddleware::verificarToken();
            $idToken = (int)($payload['usr']['id'] ?? 0);
            $rol     = $payload['usr']['rol'] ?? '';

            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $id = (int)($_GET['id'] ?? ($input['id'] ?? 0));
            if ($id <= 0) $id = $idToken;

            if ($id !== $idToken && $rol !== 'administrador') { http_response_code(403); echo json_encode(['ok'=>false,'error'=>'Prohibido']); return; }
            if (empty($input['password_actual']) || empty($input['password_nueva'])) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Faltan campos de contraseña']); return; }

            $ok = UsuarioService::cambiarPassword($id, $input);
            if (!$ok) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'No se pudo cambiar la contraseña (verifique la contraseña actual)']); return; }
            echo json_encode(['ok'=>true]);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 401); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        } catch (\Throwable $e) {
            http_response_code(500); echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
        }
    }
}
