<?php

namespace App\Core;

class ErrorHandler
{
    public static function register(): void
    {
        set_exception_handler([self::class, 'handleException']);
        set_error_handler([self::class, 'handleError']);
        register_shutdown_function([self::class, 'handleShutdown']);
    }

    public static function handleException(\Throwable $e): void
    {
        self::respond($e->getMessage(), 500);
    }

    public static function handleError(int $severity, string $message, string $file, int $line): void
    {
        self::respond("$message in $file:$line", 500);
    }

    public static function handleShutdown(): void
    {
        $err = error_get_last();
        if ($err && $err['type'] === E_ERROR) {
            self::respond($err['message'], 500);
        }
    }

    private static function respond(string $message, int $code): void
    {
        http_response_code($code);

        $show = getenv('APP_ENV') === 'local';

        $response = [
            'ok' => false,
            'code' => $code,
            'error' => $show ? $message : 'Internal Server Error',
        ];

        // log real
        error_log("[" . date('Y-m-d H:i:s') . "] $message\n", 3, __DIR__ . '/../../logs/error.log');

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }
}
